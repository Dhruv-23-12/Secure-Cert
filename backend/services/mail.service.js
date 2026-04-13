import nodemailer from 'nodemailer';

const createTransporter = () => nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: (process.env.EMAIL_PASS || '').replace(/\s+/g, ''),
  },
});

export const sendOtpEmail = async ({ to, otp, expiresInMinutes = 5 }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    const error = new Error('Email service is not configured. Set EMAIL_USER and EMAIL_PASS');
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

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"SecureCert Security" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'Your SecureCert OTP Code',
      html,
    });
  } catch (err) {
    console.error('OTP email send failed:', err.message);
    const error = new Error('Unable to send OTP email. Please try again');
    error.statusCode = 503;
    throw error;
  }
};
