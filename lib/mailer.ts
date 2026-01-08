// lib/mailer.ts
import nodemailer from "nodemailer";

export async function sendPaymentEmail(email: string, projectName: string) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Agentic" <${process.env.MAIL_USER}>`,
    to: email,
    subject: "Payment Request",
    html: `
      <p>Your project <b>${projectName}</b> has been completed.</p>
      <p>Please login to your dashboard to proceed with payment.</p>
    `,
  });
}
