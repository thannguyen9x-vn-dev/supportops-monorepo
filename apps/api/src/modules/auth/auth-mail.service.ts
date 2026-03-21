import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { AppException } from '../../common/exceptions/app.exception';

interface SendEmailInput {
  userId?: string;
  tenantId?: string;
  template: string;
  to: string;
  subject: string;
  html: string;
  text: string;
}

@Injectable()
export class AuthMailService {
  private static sentCountByDate = new Map<string, number>();

  private readonly logger = new Logger(AuthMailService.name);
  private readonly resendClient: Resend | null;
  private readonly enabled: boolean;
  private readonly from: string;
  private readonly provider: string;
  private readonly dailyLimit: number;

  constructor(
    private readonly configService: ConfigService,
  ) {
    const enabled = configService.get<boolean>('mail.enabled', false);
    const provider = configService.get<string>('mail.provider', 'resend');
    const resendApiKey = configService.get<string>('mail.resendApiKey', '');
    const dailyLimit = configService.get<number>('mail.dailyLimit', 90);
    const fromEmail = configService.get<string>('mail.fromEmail', 'no-reply@supportops.local');
    const fromName = configService.get<string>('mail.fromName', 'SupportOps');

    this.enabled = Boolean(enabled && fromEmail);
    this.provider = provider;
    this.dailyLimit = Number.isFinite(dailyLimit) ? dailyLimit : 90;
    this.from = `${fromName} <${fromEmail}>`;

    if (!this.enabled) {
      this.resendClient = null;
      this.logger.warn('Mail is disabled. Emails will be logged only.');
      return;
    }

    if (provider !== 'resend' || !resendApiKey) {
      this.resendClient = null;
      this.logger.warn('MAIL_PROVIDER is not resend or RESEND_API_KEY is missing. Emails will be skipped.');
      return;
    }

    this.resendClient = new Resend(resendApiKey);
  }

  async sendVerificationEmail(
    to: string,
    verificationUrl: string,
    userId?: string,
    tenantId?: string,
  ): Promise<void> {
    const subject = 'Verify your SupportOps email';
    const text = [
      'Welcome to SupportOps.',
      'Please verify your email by opening the link below:',
      verificationUrl,
      '',
      'If you did not request this, you can ignore this email.',
    ].join('\n');

    const html = this.renderCardTemplate({
      title: 'Email Verification',
      recipientEmail: to,
      intro: 'Please click the button below to verify your email address.',
      actionLabel: 'Verify my Email',
      actionUrl: verificationUrl,
      fallbackLabel: 'If the button does not work, open this link:',
      fallbackUrl: verificationUrl,
      content: `
        <p style="margin:0 0 8px;color:#111827">Thank you! See you soon on SupportOps.</p>
        <p style="margin:0;color:#6b7280">If you did not request this, you can ignore this email.</p>
      `,
      footer: 'The SupportOps Team',
      promoText: 'Explore SupportOps docs',
      promoUrl: 'https://supportops.local/docs',
    });

    await this.send({ to, subject, html, text, template: 'AUTH_VERIFY_EMAIL', userId, tenantId });
  }

  async sendPasswordResetCodeEmail(
    to: string,
    code: string,
    expiresInMinutes: number,
    resetUrl: string,
    userId?: string,
    tenantId?: string,
  ): Promise<void> {
    const subject = 'Your SupportOps password reset code';
    const text = [
      'We received a request to reset your password.',
      `Your reset code is: ${code}`,
      `This code will expire in ${expiresInMinutes} minutes.`,
      `Reset link: ${resetUrl}`,
      '',
      'If you did not request this, you can ignore this email.',
    ].join('\n');

    const html = this.renderCardTemplate({
      title: 'Password reset request',
      recipientEmail: to,
      intro: 'Please click the button below to reset your password.',
      actionLabel: 'Reset my Password',
      actionUrl: resetUrl,
      fallbackLabel: 'If the button does not work, open this link:',
      fallbackUrl: resetUrl,
      content: `
        <p style="margin:0 0 8px;color:#111827">Your reset code:</p>
        <p style="margin:0 0 10px;font-size:30px;font-weight:700;letter-spacing:6px;color:#dc2626">${code}</p>
        <p style="margin:0;color:#4b5563">This code expires in <strong>${expiresInMinutes} minutes</strong>.</p>
      `,
      footer: 'The SupportOps Team',
      promoText: 'Need help? Contact SupportOps support',
      promoUrl: 'mailto:support@supportops.local',
    });

    await this.send({ to, subject, html, text, template: 'AUTH_RESET_PASSWORD_OTP', userId, tenantId });
  }

  async sendInviteEmail(
    to: string,
    acceptInviteUrl: string,
    tenantName: string,
    roleCode: string,
    userId?: string,
    tenantId?: string,
  ): Promise<void> {
    const subject = `You're invited to join ${tenantName} on SupportOps`;
    const text = [
      `You were invited to join ${tenantName} on SupportOps.`,
      `Role: ${roleCode}`,
      'Open the link below to set your password and activate your account:',
      acceptInviteUrl,
      '',
      'If you did not expect this invitation, you can ignore this email.',
    ].join('\n');

    const html = this.renderCardTemplate({
      title: 'You are invited to SupportOps',
      recipientEmail: to,
      intro: `You were invited to join <strong>${tenantName}</strong> as <strong>${roleCode}</strong>.`,
      actionLabel: 'Accept Invitation',
      actionUrl: acceptInviteUrl,
      fallbackLabel: 'If the button does not work, open this link:',
      fallbackUrl: acceptInviteUrl,
      content: `
        <p style="margin:0 0 8px;color:#111827">Set your password to activate your account.</p>
        <p style="margin:0;color:#4b5563">This invitation link will expire based on tenant policy.</p>
      `,
      footer: 'The SupportOps Team',
      promoText: 'Need help? Contact SupportOps support',
      promoUrl: 'mailto:support@supportops.local',
    });

    await this.send({ to, subject, html, text, template: 'AUTH_TENANT_INVITE', userId, tenantId });
  }

  private async send(input: SendEmailInput): Promise<void> {
    if (!this.enabled) {
      this.logger.log(`[MAIL_DISABLED] to=${input.to} subject="${input.subject}" text="${input.text}"`);
      return;
    }

    const overLimit = await this.isOverDailyLimit();
    if (overLimit) {
      throw new AppException(429, 'MAIL_DAILY_LIMIT_REACHED', 'Daily email limit reached. Please try again tomorrow.');
    }

    if (!this.resendClient || this.provider !== 'resend') {
      throw new AppException(503, 'MAIL_PROVIDER_NOT_CONFIGURED', 'Mail provider is not configured correctly.');
    }

    try {
      const { error } = await this.resendClient.emails.send({
        from: this.from,
        to: [input.to],
        subject: input.subject,
        html: input.html,
        text: input.text,
      });

      if (error) {
        throw new AppException(502, 'EMAIL_DELIVERY_FAILED', 'Unable to deliver email');
      }

      this.incrementDailySentCount();
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }

      throw new AppException(502, 'EMAIL_DELIVERY_FAILED', 'Unable to deliver email');
    }
  }

  private async isOverDailyLimit(): Promise<boolean> {
    const sentCountToday = AuthMailService.sentCountByDate.get(this.getDateKey()) ?? 0;
    return sentCountToday >= this.dailyLimit;
  }

  private incrementDailySentCount(): void {
    const dateKey = this.getDateKey();
    const currentCount = AuthMailService.sentCountByDate.get(dateKey) ?? 0;
    AuthMailService.sentCountByDate.set(dateKey, currentCount + 1);
  }

  private getDateKey(): string {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private renderCardTemplate(input: {
    title: string;
    recipientEmail: string;
    intro: string;
    actionLabel: string;
    actionUrl: string;
    fallbackLabel: string;
    fallbackUrl: string;
    content: string;
    footer: string;
    promoText: string;
    promoUrl: string;
  }): string {
    return `
      <div style="margin:0;padding:28px 0;background:#ececec;font-family:Arial,Helvetica,sans-serif">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse">
          <tr>
            <td align="center">
              <table role="presentation" width="760" cellspacing="0" cellpadding="0" style="max-width:760px;width:100%;background:#f1f1f1;border-radius:8px;border-collapse:separate">
                <tr>
                  <td style="padding:28px">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#ffffff;border-radius:6px">
                      <tr>
                        <td style="padding:22px 30px">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                            <tr>
                              <td>
                                <table role="presentation" cellspacing="0" cellpadding="0" style="border-collapse:collapse">
                                  <tr>
                                    <td>
                                      <span style="display:inline-block;width:46px;height:46px;line-height:46px;text-align:center;border-radius:9999px;background:#ef1f2f;color:#ffffff;font-weight:700;font-size:31px">it</span>
                                    </td>
                                    <td style="padding-left:6px">
                                      <span style="display:inline-block;padding:7px 12px;background:#171717;color:#ffffff;font-size:31px;font-weight:700;line-height:1;border-radius:2px">viec</span>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                              <td align="right" style="font-size:44px;color:#111827;font-weight:500;letter-spacing:-0.5px;white-space:nowrap">
                                Ít Nhưng Mà Chất
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:4px 30px 34px">
                          <h2 style="margin:0 0 14px;font-size:27px;line-height:1.3;color:#111827">${input.title}</h2>
                          <p style="margin:0 0 18px;font-size:18px;color:#111827;line-height:1.55">
                            Hi <a href="mailto:${input.recipientEmail}" style="color:#2563eb;text-decoration:underline">${input.recipientEmail}</a>,
                          </p>
                          <p style="margin:0 0 26px;font-size:17px;color:#3f3f46;line-height:1.7">${input.intro}</p>
                          <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 20px">
                            <tr>
                              <td style="border-radius:7px;background:#ef1f2f">
                                <a href="${input.actionUrl}" style="display:inline-block;padding:14px 28px;font-size:19px;font-weight:700;color:#ffffff;text-decoration:none">${input.actionLabel}</a>
                              </td>
                            </tr>
                          </table>
                          <p style="margin:0 0 8px;font-size:14px;color:#71717a">${input.fallbackLabel}</p>
                          <p style="margin:0 0 22px;font-size:14px;word-break:break-all">
                            <a href="${input.fallbackUrl}" style="color:#2563eb;text-decoration:underline">${input.fallbackUrl}</a>
                          </p>
                          <div style="margin:0 0 28px">${input.content}</div>
                          <p style="margin:0;font-size:18px;color:#111827;line-height:1.7">Cheers,<br /><strong>${input.footer}</strong></p>
                          <p style="margin:24px 0 0;font-size:16px;line-height:1.6">
                            <a href="${input.promoUrl}" style="color:#ef1f2f;text-decoration:underline">${input.promoText}</a>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
    `;
  }
}
