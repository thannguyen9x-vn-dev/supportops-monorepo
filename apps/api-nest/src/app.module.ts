import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { TenantMiddleware } from './common/middleware/tenant.middleware';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';
import { TenantContextInterceptor } from './common/interceptors/tenant-context.interceptor';
import { TraceIdInterceptor } from './common/interceptors/trace-id.interceptor';
import { AuthCoreModule } from './modules/core/auth/auth-core.module';
import { AuditCoreModule } from './modules/core/audit/audit-core.module';
import { CommentCoreModule } from './modules/core/comment/comment-core.module';
import { NotificationCoreModule } from './modules/core/notification/notification-core.module';
import { PermissionCoreModule } from './modules/core/permission/permission-core.module';
import { RoleCoreModule } from './modules/core/role/role-core.module';
import { TenantCoreModule } from './modules/core/tenant/tenant-core.module';
import { UserCoreModule } from './modules/core/user/user-core.module';
import { WorkItemCoreModule } from './modules/core/work-item/work-item-core.module';
import { WorkflowCoreModule } from './modules/core/workflow/workflow-core.module';
import { BillingModule } from './modules/billing/billing.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { FileModule } from './modules/file/file.module';
import { InvoiceModule } from './modules/invoice/invoice.module';
import { KanbanModule } from './modules/kanban/kanban.module';
import { MessageModule } from './modules/message/message.module';
import { ProductModule } from './modules/product/product.module';
import { AssetModule } from './modules/service-ops/asset/asset.module';
import { AssignmentModule } from './modules/service-ops/assignment/assignment.module';
import { EscalationModule } from './modules/service-ops/escalation/escalation.module';
import { RequestModule } from './modules/service-ops/request/request.module';
import { ResolutionModule } from './modules/service-ops/resolution/resolution.module';
import { SlaModule } from './modules/service-ops/sla/sla.module';
import { WorkLogModule } from './modules/service-ops/work-log/work-log.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig],
    }),
    PrismaModule,
    // TeamOps core layer
    TenantCoreModule,
    AuthCoreModule,
    UserCoreModule,
    RoleCoreModule,
    PermissionCoreModule,
    WorkItemCoreModule,
    WorkflowCoreModule,
    CommentCoreModule,
    NotificationCoreModule,
    AuditCoreModule,
    // ServiceOps business layer
    RequestModule,
    AssignmentModule,
    SlaModule,
    EscalationModule,
    AssetModule,
    WorkLogModule,
    ResolutionModule,
    // Legacy modules (to be removed phase-by-phase)
    ProductModule,
    KanbanModule,
    MessageModule,
    DashboardModule,
    SubscriptionModule,
    BillingModule,
    InvoiceModule,
    FileModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: TraceIdInterceptor },
    { provide: APP_INTERCEPTOR, useClass: TenantContextInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ResponseTransformInterceptor },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}
