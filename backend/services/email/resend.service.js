import { Resend } from 'resend';

const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    const error = new Error('RESEND_API_KEY is missing');
    error.statusCode = 503;
    throw error;
  }
  return new Resend(apiKey);
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const sendOtpEmail = async ({ to, otp, expiresInMinutes = 5 }) => {
  const from = process.env.EMAIL_FROM;
  if (!from) {
    const error = new Error('EMAIL_FROM is missing (example: SecureCert <no-reply@yourdomain.com>)');
    error.statusCode = 503;
    throw error;
  }

  const resend = getResendClient();

  const html = `
  <div style="margin:0;padding:0;background:#f6f8fb;font-family:Arial,sans-serif">
    <div style="max-width:560px;margin:24px auto;background:#ffffff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden">
      <div style="padding:20px 24px;background:#111827;color:#ffffff">
        <h2 style="margin:0;font-size:20px;line-height:1.4">SecureCert Security Verification</h2>
      </div>
      <div style="padding:24px;color:#111827">
        <p style="margin-top:0;font-size:14px;line-height:1.6">
          We received a sign-in verification request for your SecureCert account.
        </p>
        <p style="font-size:14px;line-height:1.6;margin-bottom:8px">Use this one-time password (OTP):</p>
        <div style="font-size:34px;letter-spacing:8px;font-weight:700;color:#4f46e5;margin:8px 0 16px 0">
          ${otp}
        </div>
        <p style="font-size:13px;line-height:1.6;color:#374151;margin:0">
          This OTP expires in ${expiresInMinutes} minutes and can only be used once.
        </p>
        <p style="font-size:13px;line-height:1.6;color:#6b7280;margin-top:16px">
          If you did not request this code, please ignore this email and secure your account.
        </p>
      </div>
    </div>
  </div>`;

  // Retry once (brief backoff) for transient provider failures
  let lastError;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const result = await resend.emails.send({
        from,
        to,
        subject: 'Your SecureCert OTP Code',
        html,
      });

      if (result?.error) {
        const error = new Error(result.error?.message || 'Resend failed');
        error.statusCode = 503;
        throw error;
      }

      return result;
    } catch (err) {
      lastError = err;
      if (attempt === 1) await sleep(600);
    }
  }

  const error = new Error(lastError?.message || 'Unable to send OTP email');
  error.statusCode = 503;
  throw error;
};

