import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MembershipStatus, Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { PermissionsRequirement, PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { JwtPayload } from '../../modules/auth/strategies/jwt.strategy';

type RequestWithUser = {
  user?: JwtPayload;
  authzPermissions?: string[];
};

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requirement = this.reflector.getAllAndOverride<PermissionsRequirement | undefined>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requirement || (!requirement.all?.length && !requirement.any?.length)) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;
    if (!user) {
      return false;
    }

    const permissions = await this.resolvePermissions(user);
    request.authzPermissions = permissions;

    if (requirement.all?.length) {
      const hasAll = requirement.all.every((permission) => permissions.includes(permission));
      if (!hasAll) {
        return false;
      }
    }

    if (requirement.any?.length) {
      const hasAny = requirement.any.some((permission) => permissions.includes(permission));
      if (!hasAny) {
        return false;
      }
    }

    return true;
  }

  private async resolvePermissions(user: JwtPayload): Promise<string[]> {
    const membership = await this.prisma.membership.findFirst({
      where: {
        userId: user.sub,
        tenantId: user.tenantId,
        status: MembershipStatus.ACTIVE,
      },
      include: {
        role: {
          include: {
            rolePermissions: {
              select: {
                permissionCode: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (membership?.role?.rolePermissions) {
      return membership.role.rolePermissions.map((rolePermission) => rolePermission.permissionCode);
    }

    return this.getLegacyRolePermissions(user.role);
  }

  private getLegacyRolePermissions(role: Role): string[] {
    const employee = ['request.create', 'request.read.own', 'comment.create.public', 'request.close', 'request.reopen'];
    const coordinator = [
      ...employee,
      'request.read.all',
      'request.assign',
      'request.reassign',
      'request.start_work',
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
    ];
    const technician = [
      'request.create',
      'request.read.own',
      'request.start_work',
      'request.resolve',
      'comment.create.public',
      'comment.create.internal',
      'comment.read.internal',
    ];

    if (role === Role.SUPER_ADMIN) {
      return [
        ...new Set([
          ...coordinator,
          ...technician,
          'workflow.manage',
          'sla.manage',
          'user.invite',
          'user.deactivate',
          'role.manage',
          'request.read.all',
        ]),
      ];
    }

    if (role === Role.ADMIN) {
      return coordinator;
    }

    return employee;
  }
}
