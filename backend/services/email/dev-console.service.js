export const sendOtpEmail = async ({ to, otp, expiresInMinutes = 5 }) => {
  // Local/dev email provider: prints OTP to server logs
  console.log('======================================================');
  console.log('DEV OTP DELIVERY (no email sent)');
  console.log(`To: ${to}`);
  console.log(`OTP: ${otp} (expires in ${expiresInMinutes} minutes)`);
  console.log('======================================================');
};

