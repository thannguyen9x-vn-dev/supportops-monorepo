import { ConfigService } from '@nestjs/config';
import { AppException } from '../../common/exceptions/app.exception';
import { AuthMailService } from './auth-mail.service';

describe('AuthMailService', () => {
  const baseConfig = {
    'mail.enabled': true,
    'mail.provider': 'resend',
    'mail.resendApiKey': 'rk_test',
    'mail.dailyLimit': 90,
    'mail.fromEmail': 'no-reply@example.com',
    'mail.fromName': 'SupportOps',
  } as const;

  const buildConfig = (overrides?: Record<string, unknown>) => {
    const values = { ...baseConfig, ...overrides };
    return {
      get: jest.fn((key: string, fallback?: unknown) => (key in values ? values[key as keyof typeof values] : fallback)),
    } as unknown as ConfigService;
  };

  it('logs only when mail is disabled', async () => {
    const service = new AuthMailService(buildConfig({ 'mail.enabled': false }));

    await expect(service.sendVerificationEmail('a@example.com', 'http://verify')).resolves.toBeUndefined();
  });

  it('throws when provider is misconfigured', async () => {
    const service = new AuthMailService(buildConfig({ 'mail.provider': 'smtp' }));

    await expect(service.sendVerificationEmail('a@example.com', 'http://verify')).rejects.toThrow(AppException);
  });

  it('throws when daily limit reached', async () => {
    const service = new AuthMailService(buildConfig({ 'mail.dailyLimit': 0 }));

    await expect(service.sendVerificationEmail('a@example.com', 'http://verify')).rejects.toThrow(AppException);
  });
});
