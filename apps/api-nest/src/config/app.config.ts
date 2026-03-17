import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: Number.parseInt(process.env.PORT ?? '8081', 10),
  corsOrigins: process.env.CORS_ALLOWED_ORIGIN ?? 'http://localhost:3000',
  filePublicBaseUrl: process.env.FILE_PUBLIC_BASE_URL ?? '',
  fileSigningSecret: process.env.FILE_SIGNING_SECRET ?? 'supportops-dev-signing-secret',
}));
