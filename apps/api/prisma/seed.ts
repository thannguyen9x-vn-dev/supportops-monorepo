import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const roles: Array<{ code: string; name: string; description: string }> = [
  { code: 'EMPLOYEE', name: 'Employee', description: 'Requester role with own-request visibility.' },
  {
    code: 'OPS_COORDINATOR',
    name: 'Ops Coordinator',
    description: 'Coordinates assignments and request processing across tenant queue.',
  },
  { code: 'TECHNICIAN', name: 'Technician', description: 'Executes assigned work and internal updates.' },
  { code: 'TENANT_ADMIN', name: 'Tenant Admin', description: 'Full tenant administration and governance.' },
];

const permissions: Array<{ code: string; description: string }> = [
  { code: 'request.create', description: 'Create service requests.' },
  { code: 'request.read.own', description: 'Read own service requests.' },
  { code: 'request.read.all', description: 'Read all service requests in tenant.' },
  { code: 'request.assign', description: 'Assign request to a technician.' },
  { code: 'request.reassign', description: 'Reassign request owner.' },
  { code: 'request.resolve', description: 'Resolve service requests.' },
  { code: 'request.close', description: 'Close service requests.' },
  { code: 'request.reopen', description: 'Reopen closed service requests.' },
  { code: 'request.escalate', description: 'Escalate requests.' },
  { code: 'request.start_work', description: 'Start work on assigned requests.' },
  { code: 'request.update.metadata', description: 'Update request metadata and routing fields.' },
  { code: 'comment.create.public', description: 'Create public comments.' },
  { code: 'comment.create.internal', description: 'Create internal notes.' },
  { code: 'comment.read.internal', description: 'Read internal notes.' },
  { code: 'workflow.manage', description: 'Manage workflow configuration.' },
  { code: 'sla.manage', description: 'Manage SLA policies.' },
  { code: 'user.invite', description: 'Invite users into tenant.' },
  { code: 'user.deactivate', description: 'Deactivate tenant users.' },
  { code: 'role.manage', description: 'Change membership roles.' },
  { code: 'audit.read', description: 'Read audit logs.' },
  { code: 'product.manage', description: 'Manage products and product assets.' },
  { code: 'billing.manage', description: 'Manage billing info and payment methods.' },
  { code: 'invoice.manage', description: 'Manage invoices.' },
  { code: 'subscription.manage', description: 'Manage subscription lifecycle and plan changes.' },
  { code: 'kanban.manage', description: 'Manage board structure and columns.' },
];

const rolePermissionMap: Record<string, string[]> = {
  EMPLOYEE: ['request.create', 'request.read.own', 'comment.create.public', 'request.close', 'request.reopen'],
  OPS_COORDINATOR: [
    'request.create',
    'request.read.own',
    'comment.create.public',
    'request.close',
    'request.reopen',
    'request.read.all',
    'request.assign',
    'request.reassign',
    'request.resolve',
    'request.escalate',
    'request.update.metadata',
    'comment.create.internal',
    'comment.read.internal',
    'audit.read',
    'product.manage',
    'billing.manage',
    'invoice.manage',
    'subscription.manage',
    'kanban.manage',
  ],
  TECHNICIAN: [
    'request.read.own',
    'request.start_work',
    'request.resolve',
    'comment.create.public',
    'comment.create.internal',
    'comment.read.internal',
  ],
  TENANT_ADMIN: permissions.map((permission) => permission.code),
};

async function main(): Promise<void> {
  for (const role of roles) {
    await prisma.authRole.upsert({
      where: { code: role.code },
      update: { name: role.name, description: role.description },
      create: role,
    });
  }

  for (const permission of permissions) {
    await prisma.authPermission.upsert({
      where: { code: permission.code },
      update: { description: permission.description },
      create: permission,
    });
  }

  for (const [roleCode, permissionCodes] of Object.entries(rolePermissionMap)) {
    for (const permissionCode of permissionCodes) {
      await prisma.authRolePermission.upsert({
        where: {
          roleCode_permissionCode: {
            roleCode,
            permissionCode,
          },
        },
        update: {},
        create: { roleCode, permissionCode },
      });
    }
  }
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
