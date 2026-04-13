import { sendOtpEmail as sendOtpEmailResend } from './resend.service.js';
import { sendOtpEmail as sendOtpEmailDev } from './dev-console.service.js';
import { sendOtpEmail as sendOtpEmailSmtp } from './smtp.service.js';

export const sendOtpEmail = async (params) => {
  const isProd = process.env.NODE_ENV === 'production';
  const hasResend = Boolean(process.env.RESEND_API_KEY) && Boolean(process.env.EMAIL_FROM);
  const hasSmtp = Boolean(process.env.SMTP_HOST) && Boolean(process.env.SMTP_USER) && Boolean(process.env.SMTP_PASS);

  // Localhost-first: use SMTP if configured, else console in dev
  if (!isProd && hasSmtp) {
    console.info('[email] provider=smtp');
    return await sendOtpEmailSmtp(params);
  }

  // Localhost-first: if not production, default to console provider unless Resend is configured.
  if (!isProd && !hasResend) {
    console.info('[email] provider=dev-console (set SMTP_* or RESEND_* to send emails)');
    return await sendOtpEmailDev(params);
  }

  // Production: use Resend (throws a clean error if misconfigured)
  console.info('[email] provider=resend');
  return await sendOtpEmailResend(params);
};

