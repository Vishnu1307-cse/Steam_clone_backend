import dotenv from "dotenv";
dotenv.config();

import sgMail from "@sendgrid/mail";
import fs from "fs";
import path from "path";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const logResult = (data) => {
  const logPath = path.join(process.cwd(), "mail-debug.log");
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${JSON.stringify(data)}\n`;
  fs.appendFileSync(logPath, logMessage);
};

const sendEmail = async (msg) => {
  try {
    logResult({ action: "attempt", to: msg.to, from: msg.from, subject: msg.subject });
    console.log(`Attempting to send email to ${msg.to} from ${msg.from}...`);
    const response = await sgMail.send(msg);
    console.log(`Email sent successfully. Status Code: ${response[0].statusCode}`);
    logResult({ action: "success", status: response[0].statusCode });
  } catch (error) {
    console.error("SendGrid Error Details:");
    const errorData = error.response ? error.response.body : { message: error.message };
    console.error(JSON.stringify(errorData, null, 2));
    logResult({ action: "error", error: errorData });
  }
};

// Main transporter for tokens/approvals (svvishnu33@gmail.com)
export const transporter = {
  verify: (callback) => {
    // Mocking nodemailer verify for SendGrid
    if (process.env.SENDGRID_API_KEY) {
      callback(null, true);
    } else {
      callback(new Error("SENDGRID_API_KEY is missing"), null);
    }
  },
  sendMail: async (options) => {
    const msg = {
      to: options.to,
      from: process.env.EMAIL_USER, // svvishnu33@gmail.com
      subject: options.subject,
      text: options.text,
      html: options.html,
    };
    return sendEmail(msg);
  }
};

// OTP transporter (anonymousforuse33@gmail.com)
export const otpTransporter = {
  verify: (callback) => {
    // Mocking nodemailer verify for SendGrid
    if (process.env.SENDGRID_API_KEY) {
      callback(null, true);
    } else {
      callback(new Error("SENDGRID_API_KEY is missing"), null);
    }
  },
  sendMail: async (options) => {
    const msg = {
      to: options.to,
      from: process.env.EMAIL_OTP_USER, // anonymousforuse33@gmail.com
      subject: options.subject,
      text: options.text,
      html: options.html,
    };
    return sendEmail(msg);
  }
};