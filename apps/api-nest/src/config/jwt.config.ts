import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET ?? 'dev-secret-key-min-32-characters-long-enough',
  accessTokenTtlSeconds: Number.parseInt(process.env.ACCESS_TOKEN_TTL_SECONDS ?? '900', 10),
  refreshTokenTtlSeconds: Number.parseInt(process.env.REFRESH_TOKEN_TTL_SECONDS ?? '604800', 10),
}));
