import nodemailer from 'nodemailer';

const sendEmail = async ({ to, subject, html }) => {
    // Check for credentials first
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('================================================================');
        console.log('WARNING: Email credentials missing in .env');
        console.log(`Mock Email To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log('HTML Content (Preview):');
        console.log(html); // Log the HTML so user can see the OTP code
        console.log('================================================================');
        return; // Return as if successful
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail', // or any other service like 'SendGrid', 'Mailgun', etc.
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: `"SecureCert Team" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        // For development, if env vars are missing, just log the OTP
        if (!process.env.EMAIL_USER) {
            console.log('WARNING: Email environment variables missing. OTP was NOT sent via email.');
        }
    }
};

export default sendEmail;
