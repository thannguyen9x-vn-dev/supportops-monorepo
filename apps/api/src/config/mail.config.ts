import { registerAs } from '@nestjs/config';

export default registerAs('mail', () => ({
  enabled: (process.env.MAIL_ENABLED ?? 'false').toLowerCase() === 'true',
  provider: (process.env.MAIL_PROVIDER ?? 'resend').toLowerCase(),
  dailyLimit: Number.parseInt(process.env.MAIL_DAILY_LIMIT ?? '90', 10),
  fromEmail: process.env.MAIL_FROM_EMAIL ?? 'onboarding@resend.dev',
  fromName: process.env.MAIL_FROM_NAME ?? 'SupportOps',
  resendApiKey: process.env.RESEND_API_KEY ?? '',
}));
