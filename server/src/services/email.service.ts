import { Resend } from 'resend';
import { env } from '../config/env';

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface SendEmailResult {
  delivered: boolean;
  mode: 'resend' | 'console' | 'disabled';
  id?: string;
}

const resendClient = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  if (resendClient) {
    const response = await resendClient.emails.send({
      from: env.EMAIL_FROM,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    });

    if (response.error) {
      throw new Error(`Resend email failed: ${response.error.message}`);
    }

    return {
      delivered: true,
      mode: 'resend',
      id: response.data?.id,
    };
  }

  if (!env.isProduction) {
    console.info(
      [
        '--- [DEV EMAIL LOGGER] ---',
        `From: ${env.EMAIL_FROM}`,
        `To: ${input.to}`,
        `Subject: ${input.subject}`,
        input.text,
        '--------------------------',
      ].join('\n')
    );

    return {
      delivered: false,
      mode: 'console',
    };
  }

  console.error(
    `[EMAIL] Skipped email to ${input.to} ("${input.subject}") because RESEND_API_KEY is not configured in production.`
  );

  return {
    delivered: false,
    mode: 'disabled',
  };
}

export async function sendVerificationEmail(to: string, token: string): Promise<SendEmailResult> {
  const verifyUrl = `${env.CLIENT_URL.replace(/\/$/, '')}/verify-email?token=${encodeURIComponent(token)}`;
  const subject = 'Verify your LUNAR Colony email address';
  const text = [
    'Welcome to LUNAR Colony.',
    '',
    'Confirm your email address by opening this link:',
    verifyUrl,
    '',
    'This link expires in 24 hours. If you did not create an account, you can safely ignore this message.',
  ].join('\n');

  const html = `
    <div style="background:#05070a;color:#e5e7eb;font-family:monospace,sans-serif;padding:24px;border:1px solid #1f2937;">
      <h2 style="color:#f59e0b;margin-top:0;">LUNAR COLONY // EMAIL VERIFICATION</h2>
      <p>Confirm your email address to activate your LUNAR Colony account.</p>
      <p style="margin:24px 0;">
        <a href="${verifyUrl}" style="background:#f59e0b;color:#05070a;padding:10px 18px;text-decoration:none;font-weight:bold;">
          VERIFY EMAIL ADDRESS
        </a>
      </p>
      <p style="font-size:12px;color:#9ca3af;">Or paste this link in your browser:<br/>${verifyUrl}</p>
      <p style="font-size:12px;color:#6b7280;">This link expires in 24 hours.</p>
    </div>
  `.trim();

  return sendEmail({ to, subject, html, text });
}

export async function sendPasswordResetEmail(to: string, token: string): Promise<SendEmailResult> {
  const resetUrl = `${env.CLIENT_URL.replace(/\/$/, '')}/reset-password?token=${encodeURIComponent(token)}`;
  const subject = 'Reset your LUNAR Colony password';
  const text = [
    'LUNAR Colony Password Reset',
    '',
    'Use the link below to set a new password:',
    resetUrl,
    '',
    'This link expires in 1 hour. If you did not request a password reset, ignore this email.',
  ].join('\n');

  const html = `
    <div style="background:#05070a;color:#e5e7eb;font-family:monospace,sans-serif;padding:24px;border:1px solid #1f2937;">
      <h2 style="color:#00f0ff;margin-top:0;">LUNAR COLONY // PASSWORD RESET</h2>
      <p>A password reset was requested for your LUNAR Colony account.</p>
      <p style="margin:24px 0;">
        <a href="${resetUrl}" style="background:#00f0ff;color:#05070a;padding:10px 18px;text-decoration:none;font-weight:bold;">
          RESET PASSWORD
        </a>
      </p>
      <p style="font-size:12px;color:#9ca3af;">Or paste this link in your browser:<br/>${resetUrl}</p>
      <p style="font-size:12px;color:#6b7280;">This link expires in 1 hour.</p>
    </div>
  `.trim();

  return sendEmail({ to, subject, html, text });
}

export const emailService = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
};
