import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { OtpType } from '../common/enums/otp-type.enum';

// Paleta de packages/tokens/src/colors.ts do front — mesmo visual dos apps.
const COLORS = {
  bg: '#121418',
  surface: '#1B1E24',
  border: '#2E333C',
  text: '#ECE8E1',
  textMuted: '#A0A6AF',
  accent: '#F2B544',
  accentInk: '#121418',
};

const SUBJECTS: Record<OtpType, string> = {
  [OtpType.EMAIL_VERIFICATION]: 'Confirme seu e-mail — checkpoint',
  [OtpType.PASSWORD_RESET]: 'Redefinir senha — checkpoint',
  [OtpType.LOGIN]: 'Seu código de login — checkpoint',
};

const HEADLINES: Record<OtpType, string> = {
  [OtpType.EMAIL_VERIFICATION]: 'Confirme seu e-mail',
  [OtpType.PASSWORD_RESET]: 'Redefinir sua senha',
  [OtpType.LOGIN]: 'Entrar no checkpoint',
};

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter;
  private readonly from: string;

  constructor(private readonly configService: ConfigService) {
    this.from = configService.get('MAIL_FROM') ?? 'checkpoint <nao-responda@checkpoint.app>';

    this.transporter = nodemailer.createTransport({
      host: configService.getOrThrow<string>('MAIL_HOST'),
      port: Number(configService.get('MAIL_PORT') ?? 587),
      secure: configService.get('MAIL_SECURE') === 'true',
      auth: {
        user: configService.getOrThrow<string>('MAIL_USER'),
        pass: configService.getOrThrow<string>('MAIL_PASS'),
      },
      pool: true,
      maxConnections: 3,
      maxMessages: 100,
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.transporter.verify();
      this.logger.log('SMTP conectado');
    } catch (err) {
      this.logger.error('Falha ao conectar no SMTP — e-mails não serão enviados', err);
    }
  }

  async sendOtp(email: string, code: string, type: OtpType): Promise<void> {
    const html = `
    <body style="margin:0;background:${COLORS.bg};font-family:'IBM Plex Sans',system-ui,sans-serif;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.bg};padding:40px 0;">
        <tr><td align="center">
          <table role="presentation" width="420" cellpadding="0" cellspacing="0" style="background:${COLORS.surface};border-radius:16px;border:1px solid ${COLORS.border};overflow:hidden;">
            <tr><td style="padding:32px 32px 8px;">
              <div style="font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:20px;color:${COLORS.text};">
                checkpoint<span style="color:${COLORS.accent};">.</span>
              </div>
            </td></tr>
            <tr><td style="padding:16px 32px 0;">
              <h1 style="margin:0;font-family:'Bricolage Grotesque',sans-serif;font-weight:700;font-size:22px;color:${COLORS.text};">${HEADLINES[type]}</h1>
              <p style="margin:8px 0 0;font-size:14px;color:${COLORS.textMuted};line-height:1.5;">Use o código abaixo para continuar. Ele expira em 10 minutos.</p>
            </td></tr>
            <tr><td align="center" style="padding:28px 32px;">
              <div style="font-family:'IBM Plex Mono',monospace;font-size:36px;font-weight:600;letter-spacing:8px;color:${COLORS.accent};background:${COLORS.bg};border-radius:12px;padding:16px 24px;">${code}</div>
            </td></tr>
            <tr><td style="padding:0 32px 32px;">
              <p style="margin:0;font-size:12px;color:${COLORS.textMuted};line-height:1.5;">Não compartilhe esse código com ninguém. Se você não pediu isso, ignore este e-mail.</p>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body>`;

    await this.transporter.sendMail({
      from: this.from,
      to: email,
      subject: SUBJECTS[type],
      html,
      text: `${HEADLINES[type]}\n\nSeu código: ${code}\n\nExpira em 10 minutos.`,
    });
  }
}
