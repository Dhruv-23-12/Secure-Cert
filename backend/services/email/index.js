import { sendOtpEmail as sendOtpEmailResend } from './resend.service.js';
import { sendOtpEmail as sendOtpEmailDev } from './dev-console.service.js';

export const sendOtpEmail = async (params) => {
  const isProd = process.env.NODE_ENV === 'production';
  const hasResend = Boolean(process.env.RESEND_API_KEY) && Boolean(process.env.EMAIL_FROM);

  // Localhost-first: if not production, default to console provider unless Resend is configured.
  if (!isProd && !hasResend) {
    return await sendOtpEmailDev(params);
  }

  // Production: use Resend (throws a clean error if misconfigured)
  return await sendOtpEmailResend(params);
};

