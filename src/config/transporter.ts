import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "Gmail", // or change to your email service provider
  auth: {
    user: process.env.MAILER_AUTH_USER_NAME, // your email address from .env
    pass: process.env.MAILER_AUTH_PASSWORD,  // your email password or app-specific password from .env
  },
});

export default transporter;
