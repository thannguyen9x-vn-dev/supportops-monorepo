import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

type V1RoleCode = 'EMPLOYEE' | 'OPS_COORDINATOR' | 'TECHNICIAN' | 'TENANT_ADMIN';
type LegacyAdminTarget = Exclude<V1RoleCode, 'EMPLOYEE' | 'TECHNICIAN'>;

function mapLegacyRoleToMembershipRole(role: Role, adminTarget: LegacyAdminTarget): V1RoleCode {
  if (role === Role.SUPER_ADMIN) {
    return 'TENANT_ADMIN';
  }
  if (role === Role.ADMIN) {
    return adminTarget;
  }
  return 'EMPLOYEE';
}

async function main(): Promise<void> {
  const dryRun = process.env.DRY_RUN === '1';
  const adminTarget = (process.env.ADMIN_ROLE_TARGET ?? 'OPS_COORDINATOR') as LegacyAdminTarget;

  if (!['OPS_COORDINATOR', 'TENANT_ADMIN'].includes(adminTarget)) {
    throw new Error(`ADMIN_ROLE_TARGET must be OPS_COORDINATOR or TENANT_ADMIN. Received: ${adminTarget}`);
  }

  const requiredRoles: V1RoleCode[] = ['EMPLOYEE', 'OPS_COORDINATOR', 'TECHNICIAN', 'TENANT_ADMIN'];
  const existingRoles = await prisma.authRole.findMany({ select: { code: true } });
  const existingRoleCodes = new Set(existingRoles.map((role) => role.code));
  const missingRoles = requiredRoles.filter((code) => !existingRoleCodes.has(code));
  if (missingRoles.length > 0) {
    throw new Error(`Missing seeded roles: ${missingRoles.join(', ')}. Run "pnpm prisma:seed" first.`);
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      tenantId: true,
      role: true,
      isActive: true,
      status: true,
      firstName: true,
      lastName: true,
      fullName: true,
      createdAt: true,
    },
  });

  let createdMemberships = 0;
  let updatedMemberships = 0;
  let updatedUsers = 0;

  for (const user of users) {
    const roleCode = mapLegacyRoleToMembershipRole(user.role, adminTarget);
    const membershipStatus = user.isActive ? 'ACTIVE' : 'SUSPENDED';
    const userStatus = user.isActive ? 'ACTIVE' : 'SUSPENDED';
    const normalizedFullName = `${user.firstName} ${user.lastName}`.trim();

    const existingMembership = await prisma.membership.findUnique({
      where: {
        tenantId_userId: {
          tenantId: user.tenantId,
          userId: user.id,
        },
      },
      select: {
        id: true,
        roleCode: true,
        status: true,
        invitedAt: true,
        joinedAt: true,
      },
    });

    if (!dryRun) {
      if (!existingMembership) {
        await prisma.membership.create({
          data: {
            tenantId: user.tenantId,
            userId: user.id,
            roleCode,
            status: membershipStatus,
            invitedAt: user.createdAt,
            joinedAt: user.isActive ? user.createdAt : null,
          },
        });
        createdMemberships += 1;
      } else {
        const membershipNeedsUpdate =
          existingMembership.roleCode !== roleCode ||
          existingMembership.status !== membershipStatus ||
          (!existingMembership.invitedAt && !!user.createdAt) ||
          (user.isActive && !existingMembership.joinedAt);

        if (membershipNeedsUpdate) {
          await prisma.membership.update({
            where: { id: existingMembership.id },
            data: {
              roleCode,
              status: membershipStatus,
              invitedAt: existingMembership.invitedAt ?? user.createdAt,
              joinedAt: user.isActive ? (existingMembership.joinedAt ?? user.createdAt) : existingMembership.joinedAt,
            },
          });
          updatedMemberships += 1;
        }
      }

      const needsUserUpdate = user.status !== userStatus || !user.fullName?.trim();
      if (needsUserUpdate) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            status: userStatus,
            fullName: user.fullName?.trim() ? user.fullName : normalizedFullName,
          },
        });
        updatedUsers += 1;
      }
    } else {
      if (!existingMembership) {
        createdMemberships += 1;
      } else {
        const membershipNeedsUpdate =
          existingMembership.roleCode !== roleCode ||
          existingMembership.status !== membershipStatus ||
          (!existingMembership.invitedAt && !!user.createdAt) ||
          (user.isActive && !existingMembership.joinedAt);
        if (membershipNeedsUpdate) {
          updatedMemberships += 1;
        }
      }

      const needsUserUpdate = user.status !== userStatus || !user.fullName?.trim();
      if (needsUserUpdate) {
        updatedUsers += 1;
      }
    }
  }

  console.log(
    JSON.stringify(
      {
        dryRun,
        adminTarget,
        totalUsers: users.length,
        createdMemberships,
        updatedMemberships,
        updatedUsers,
      },
      null,
      2,
    ),
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
