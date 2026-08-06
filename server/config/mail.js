import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || 'mock_user',
    pass: process.env.SMTP_PASS || 'mock_pass',
  },
});

export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    if (!process.env.SMTP_HOST) {
      console.log(`[MOCK EMAIL SENT] To: ${to} | Subject: ${subject}`);
      console.log(`Content: ${text || html}`);
      return { success: true, mock: true };
    }
    const info = await transporter.sendMail({
      from: `"${process.env.APP_NAME || 'Meeting Management System'}" <${process.env.SMTP_FROM || 'no-reply@gov.in'}>`,
      to,
      subject,
      text,
      html,
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error.message);
    return { success: false, error: error.message };
  }
};
