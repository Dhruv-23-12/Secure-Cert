import nodemailer from 'nodemailer';

const cleanPass = (value) => (value || '').replace(/\s+/g, '');

const getSmtpConfig = () => ({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === 'true', // true for 465
  user: process.env.SMTP_USER,
  pass: cleanPass(process.env.SMTP_PASS),
  from: process.env.SMTP_FROM,
});

const createTransporter = () => {
  const cfg = getSmtpConfig();
  if (!cfg.host || !cfg.user || !cfg.pass) {
    const error = new Error('SMTP is not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS');
    error.statusCode = 503;
    throw error;
  }

  return nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: {
      user: cfg.user,
      pass: cfg.pass,
    },
  });
};

export const sendOtpEmail = async ({ to, otp, expiresInMinutes = 5 }) => {
  const cfg = getSmtpConfig();
  const from = cfg.from || cfg.user;
  if (!from) {
    const error = new Error('SMTP_FROM is missing (or set SMTP_USER)');
    error.statusCode = 503;
    throw error;
  }

  const html = `
  <div style="margin:0;padding:0;background:#f6f8fb;font-family:Arial,sans-serif">
    <div style="max-width:560px;margin:24px auto;background:#ffffff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden">
      <div style="padding:20px 24px;background:#111827;color:#ffffff">
        <h2 style="margin:0;font-size:20px;line-height:1.4">SecureCert Security Verification</h2>
      </div>
      <div style="padding:24px;color:#111827">
        <p style="margin-top:0;font-size:14px;line-height:1.6">
          Your one-time password (OTP) is:
        </p>
        <div style="font-size:34px;letter-spacing:8px;font-weight:700;color:#4f46e5;margin:8px 0 16px 0">
          ${otp}
        </div>
        <p style="font-size:13px;line-height:1.6;color:#374151;margin:0">
          This OTP expires in ${expiresInMinutes} minutes and can only be used once.
        </p>
      </div>
    </div>
  </div>`;

  const transporter = createTransporter();
  await transporter.verify();
  await transporter.sendMail({
    from: `"SecureCert" <${from}>`,
    to,
    subject: 'Your SecureCert OTP Code',
    html,
  });
};

