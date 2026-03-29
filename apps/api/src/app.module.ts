import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { ReadinessService } from './common/health/readiness.service';
import { TenantMiddleware } from './common/middleware/tenant.middleware';
import { ErrorAlertService } from './common/monitoring/error-alert.service';
import appConfig from './config/app.config';
import authConfig from './config/auth.config';
import databaseConfig from './config/database.config';
import fileConfig from './config/file.config';
import jwtConfig from './config/jwt.config';
import mailConfig from './config/mail.config';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { PermissionsGuard } from './common/guards/permissions.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';
import { TenantContextInterceptor } from './common/interceptors/tenant-context.interceptor';
import { TraceIdInterceptor } from './common/interceptors/trace-id.interceptor';
import { AuthCoreModule } from './modules/core/auth/auth-core.module';
import { AuditCoreModule } from './modules/core/audit/audit-core.module';
import { CommentCoreModule } from './modules/core/comment/comment-core.module';
import { NotificationCoreModule } from './modules/core/notification/notification-core.module';
import { NotificationModule } from './modules/notification/notification.module';
import { KnowledgeBaseModule } from './modules/knowledge-base/knowledge-base.module';
import { CannedResponseModule } from './modules/canned-response/canned-response.module';
import { PermissionCoreModule } from './modules/core/permission/permission-core.module';
import { RoleCoreModule } from './modules/core/role/role-core.module';
import { TenantCoreModule } from './modules/core/tenant/tenant-core.module';
import { UserCoreModule } from './modules/core/user/user-core.module';
import { WorkItemCoreModule } from './modules/core/work-item/work-item-core.module';
import { WorkflowCoreModule } from './modules/core/workflow/workflow-core.module';
import { FileModule } from './modules/file/file.module';
import { AssetModule } from './modules/service-ops/asset/asset.module';
import { AssignmentModule } from './modules/service-ops/assignment/assignment.module';
import { DashboardModule } from './modules/service-ops/dashboard/dashboard.module';
import { EscalationModule } from './modules/service-ops/escalation/escalation.module';
import { ReportingModule } from './modules/service-ops/reporting/reporting.module';
import { RequestModule } from './modules/service-ops/request/request.module';
import { ResolutionModule } from './modules/service-ops/resolution/resolution.module';
import { SlaModule } from './modules/service-ops/sla/sla.module';
import { SettingsModule } from './modules/service-ops/settings/settings.module';
import { WorkLogModule } from './modules/service-ops/work-log/work-log.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, authConfig, databaseConfig, fileConfig, jwtConfig, mailConfig],
    }),
    EventEmitterModule.forRoot(),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL ?? 'info',
        redact: ['req.headers.authorization', 'req.headers.cookie'],
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  singleLine: true,
                },
              }
            : undefined,
      },
    }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60_000, // 1 minute window
        limit: 100,  // 100 requests per window (general)
      },
    ]),
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
    NotificationModule,
    KnowledgeBaseModule,
    CannedResponseModule,
    // ServiceOps business layer
    RequestModule,
    AssignmentModule,
    SlaModule,
    SettingsModule,
    EscalationModule,
    ReportingModule,
    AssetModule,
    WorkLogModule,
    ResolutionModule,
    FileModule,
    DashboardModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: TraceIdInterceptor },
    { provide: APP_INTERCEPTOR, useClass: TenantContextInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ResponseTransformInterceptor },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    ReadinessService,
    ErrorAlertService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}
