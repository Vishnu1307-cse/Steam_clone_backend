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

// Create reusable SMTP Transporter (using direct SSL port 465 for Cloud compatibility)
const createSmtpTransporter = (user, pass) => {
  if (user && pass) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 465,
      secure: process.env.SMTP_SECURE !== "false", // true for 465
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

// HTTPS API Email Sender (Port 443 - Bypasses Cloud Provider SMTP Port Blocks on Render)
const sendViaHttpsApi = async (options) => {
  const resendApiKey = process.env.RESEND_API_KEY;
  const brevoApiKey = process.env.BREVO_API_KEY;

  if (resendApiKey) {
    console.log("Sending email via Resend HTTPS API (Port 443)...");
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "Steam Clone Security <onboarding@resend.dev>",
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || JSON.stringify(data));
    console.log("✅ Email sent via Resend HTTPS API:", data.id);
    return { messageId: data.id };
  }

  if (brevoApiKey) {
    console.log("Sending email via Brevo HTTPS API (Port 443)...");
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": brevoApiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        sender: { email: emailOtpUser, name: "Steam Clone Security" },
        to: [{ email: options.to }],
        subject: options.subject,
        textContent: options.text,
        htmlContent: options.html
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || JSON.stringify(data));
    console.log("✅ Email sent via Brevo HTTPS API:", data.messageId);
    return { messageId: data.messageId };
  }

  return null;
};

// Main transporter for tokens/approvals
export const transporter = {
  verify: (callback) => {
    callback(null, true);
  },
  sendMail: async (options) => {
    try {
      const apiResult = await sendViaHttpsApi(options);
      if (apiResult) return apiResult;
    } catch (apiErr) {
      console.warn("HTTPS API Email Error, falling back to Nodemailer:", apiErr.message);
    }

    if (!mainSmtp) {
      console.log(`[MOCK EMAIL] To: ${options.to} | Subject: ${options.subject}`);
      logResult({ action: "mock_send", to: options.to, subject: options.subject });
      return;
    }

    try {
      logResult({ action: "attempt", to: options.to, subject: options.subject });
      const info = await mainSmtp.sendMail({
        from: `\"Steam Clone\" <${emailUser}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html
      });
      console.log(`Email sent via Nodemailer: ${info.messageId}`);
      logResult({ action: "success", messageId: info.messageId });
      return info;
    } catch (error) {
      console.error("Nodemailer Send Error:", error.message);
      logResult({ action: "error", error: error.message });
    }
  }
};

// OTP Transporter
export const otpTransporter = {
  verify: (callback) => {
    callback(null, true);
  },
  sendMail: async (options) => {
    try {
      const apiResult = await sendViaHttpsApi(options);
      if (apiResult) return apiResult;
    } catch (apiErr) {
      console.warn("HTTPS API OTP Error, falling back to Nodemailer:", apiErr.message);
    }

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
      console.error("Nodemailer OTP Send Error:", error.message);
      logResult({ action: "otp_error", error: error.message });
    }
  }
};