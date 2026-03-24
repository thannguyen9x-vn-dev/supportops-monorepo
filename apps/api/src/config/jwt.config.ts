import { registerAs } from '@nestjs/config';

const DEV_FALLBACK_SECRET = 'dev-secret-key-min-32-characters-long-enough';

export default registerAs('jwt', () => {
  const secret = process.env.JWT_SECRET ?? DEV_FALLBACK_SECRET;

  if (process.env.NODE_ENV === 'production' && secret === DEV_FALLBACK_SECRET) {
    throw new Error('JWT_SECRET must be set to a strong secret in production');
  }

  return {
    secret,
    accessTokenTtlSeconds: Number.parseInt(process.env.ACCESS_TOKEN_TTL_SECONDS ?? '900', 10),
    sessionRefreshTokenTtlSeconds: Number.parseInt(process.env.SESSION_REFRESH_TOKEN_TTL_SECONDS ?? '86400', 10),
    refreshTokenTtlSeconds: Number.parseInt(process.env.REFRESH_TOKEN_TTL_SECONDS ?? '604800', 10),
  };
});
