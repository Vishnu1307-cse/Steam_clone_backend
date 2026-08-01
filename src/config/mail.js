import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

const logResult = (data) => {
  const logPath = path.join(process.cwd(), "mail-debug.log");
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${JSON.stringify(data)}\n`;
  fs.appendFileSync(logPath, logMessage);
};

// Create reusable SMTP Transporter (defaulting to Gmail SMTP or custom host)
const createSmtpTransporter = (user, pass) => {
  if (user && pass) {
    return nodemailer.createTransport({
      service: process.env.SMTP_SERVICE || "gmail",
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user,
        pass
      }
    });
  }
  return null;
};

const emailUser = process.env.EMAIL_USER || "svvishnu33@gmail.com";
const emailPass = process.env.EMAIL_PASS || "psexfpodiffccpgs";

const emailOtpUser = process.env.EMAIL_OTP_USER || "anonymousforuse33@gmail.com";
const emailOtpPass = process.env.EMAIL_OTP_PASS || "wrcazcuhrwqgqchu";

// Transporters for main email & OTP email
const mainSmtp = createSmtpTransporter(emailUser, emailPass);
const otpSmtp = createSmtpTransporter(emailOtpUser, emailOtpPass) || mainSmtp;

// Main transporter for tokens/approvals
export const transporter = {
  verify: (callback) => {
    if (mainSmtp) {
      mainSmtp.verify(callback);
    } else {
      console.warn("⚠️ Nodemailer Warning: EMAIL_PASS is not configured in .env. Running in mock email mode.");
      callback(null, true);
    }
  },
  sendMail: async (options) => {
    if (!mainSmtp) {
      console.log(`[NODEMAILER MOCK] To: ${options.to} | Subject: ${options.subject}`);
      logResult({ action: "mock_send", to: options.to, subject: options.subject });
      return;
    }

    try {
      logResult({ action: "attempt", to: options.to, subject: options.subject });
      const info = await mainSmtp.sendMail({
        from: `\"Steam Clone\" <${process.env.EMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html
      });
      console.log(`Email sent via Nodemailer: ${info.messageId}`);
      logResult({ action: "success", messageId: info.messageId });
      return info;
    } catch (error) {
      console.error("Nodemailer Send Error:", error);
      logResult({ action: "error", error: error.message });
      throw error;
    }
  }
};

// OTP Transporter
export const otpTransporter = {
  verify: (callback) => {
    if (otpSmtp) {
      otpSmtp.verify(callback);
    } else {
      callback(null, true);
    }
  },
  sendMail: async (options) => {
    if (!otpSmtp) {
      console.log(`\n============================================`);
      console.log(`🔑 [MOCK OTP GENERATED] To: ${options.to}`);
      console.log(`📧 Content: ${options.text}`);
      console.log(`============================================\n`);
      logResult({ action: "mock_otp_send", to: options.to, content: options.text });
      return;
    }

    try {
      logResult({ action: "otp_attempt", to: options.to, subject: options.subject });
      const info = await otpSmtp.sendMail({
        from: `\"Steam Clone Security\" <${emailOtpUser}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html
      });
      console.log(`OTP Email sent via Nodemailer: ${info.messageId}`);
      logResult({ action: "otp_success", messageId: info.messageId });
      return info;
    } catch (error) {
      console.error("Nodemailer OTP Send Error:", error);
      logResult({ action: "otp_error", error: error.message });
      throw error;
    }
  }
};