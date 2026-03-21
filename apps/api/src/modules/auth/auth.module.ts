import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthMailService } from './auth-mail.service';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret', 'dev-secret-key-min-32-characters-long-enough'),
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthMailService, JwtStrategy],
  exports: [AuthService, AuthMailService],
})
export class AuthModule {}
