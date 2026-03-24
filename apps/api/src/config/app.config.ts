import { registerAs } from '@nestjs/config';

const DEV_FALLBACK_SIGNING_SECRET = 'supportops-dev-signing-secret';

export default registerAs('app', () => {
  const fileSigningSecret = process.env.FILE_SIGNING_SECRET ?? DEV_FALLBACK_SIGNING_SECRET;

  if (process.env.NODE_ENV === 'production' && fileSigningSecret === DEV_FALLBACK_SIGNING_SECRET) {
    throw new Error('FILE_SIGNING_SECRET must be set to a strong secret in production');
  }

  return {
    port: Number.parseInt(process.env.PORT ?? '8081', 10),
    corsOrigins: process.env.CORS_ALLOWED_ORIGIN ?? 'http://localhost:3000',
    filePublicBaseUrl: process.env.FILE_PUBLIC_BASE_URL ?? '',
    fileSigningSecret,
  };
});
