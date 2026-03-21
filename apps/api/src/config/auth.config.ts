import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  emailVerificationTokenTtlSeconds: Number.parseInt(process.env.EMAIL_VERIFICATION_TOKEN_TTL_SECONDS ?? '86400', 10),
  passwordResetCodeTtlSeconds: Number.parseInt(process.env.PASSWORD_RESET_CODE_TTL_SECONDS ?? '600', 10),
  webAppBaseUrl: process.env.WEB_APP_BASE_URL ?? 'http://localhost:3000',
}));
