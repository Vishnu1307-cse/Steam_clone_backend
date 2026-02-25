import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import SuperAdmin from "../models/SuperAdmin.js";
import SuperAdminRequest from "../models/SuperAdminRequest.js";
import { transporter, otpTransporter } from "../config/mail.js";
import LoginLog from "../models/LoginLog.js";
import { generateKeyPair, createDigitalSignature, encryptPrivateKey, decryptPrivateKey } from "../utils/digitalSignature.js";

export const requestSuperAdmin = async (req, res) => {
  try {
    const { username, email, password, secretKey, employeeId } = req.body;

    // Validate employeeId
    if (!employeeId) {
      return res.status(400).json({ message: "Employee ID is required" });
    }

    // Validate secret key
    if (secretKey !== process.env.SUPERADMIN_SECRET_KEY) {
      return res.status(403).json({
        message: "Invalid secret key"
      });
    }

    const existingRequest = await SuperAdminRequest.findOne({
      $or: [{ email }, { username }],
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (existingRequest) {
      return res.status(409).json({
        message: "Super admin request already exists for this email/username. Please wait for it to expire or use another email."
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Generate approval token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    // Generate RSA key pair for digital signature
    const { publicKey, privateKey } = generateKeyPair();

    // Encrypt private key before storing
    const encryptedPrivateKey = encryptPrivateKey(privateKey);

    // Create digital signature (sign the employeeId with private key)
    const digitalSignature = createDigitalSignature(employeeId, privateKey);

    await SuperAdminRequest.create({
      username,
      email,
      passwordHash,
      employeeId,
      approvalTokenHash: tokenHash,
      publicKey,
      privateKey: encryptedPrivateKey,
      digitalSignature,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });

    // Send approval token via email
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: "Super Admin Account Request with Digital Signature",
        text: `
Super Admin account request:

Username: ${username}
Email: ${email}
Employee ID: ${employeeId}

Approval Token (expires in 24 hours):
${rawToken}

--- DIGITAL SIGNATURE VERIFICATION ---
Requester's Public Key:
${publicKey}

Digital Signature (Employee ID signed with their private key):
${digitalSignature}

Note: This token is required to complete the super admin registration.
`
      });
    } catch (mailErr) {
      console.error("Failed to send approval email:", mailErr);
    }

    res.status(200).json({ message: "Super admin request sent. Check email for approval token." });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        message: "Duplicate username or email"
      });
    }

    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const registerSuperAdmin = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token required" });
    }

    const tokenHash = crypto
      .createHash("sha256")
      .update(token.trim())
      .digest("hex");

    const request = await SuperAdminRequest.findOne({ approvalTokenHash: tokenHash, used: false });

    if (!request) {
      return res.status(404).json({ message: "Invalid token or already used" });
    }

    if (request.expiresAt < new Date()) {
      return res.status(400).json({ message: "Token expired" });
    }

    const existingSuperAdmin = await SuperAdmin.findOne({
      $or: [{ email: request.email }, { username: request.username }]
    });

    if (existingSuperAdmin) {
      return res.status(409).json({
        message: "Super admin account already exists"
      });
    }

    await SuperAdmin.create({
      username: request.username,
      email: request.email,
      passwordHash: request.passwordHash,
      employeeId: request.employeeId,
      publicKey: request.publicKey,
      privateKey: request.privateKey,
      digitalSignature: request.digitalSignature,
      role: "superadmin"
    });

    request.used = true;
    request.verifiedAt = new Date();
    await request.save();

    res.status(201).json({ message: "Super Admin registered successfully" });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        message: "Duplicate username or email"
      });
    }

    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const loginSuperAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // LOGIN BY EMAIL
    const superAdmin = await SuperAdmin.findOne({ email });
    if (!superAdmin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!superAdmin.isActive) {
      return res.status(403).json({ message: "Account is inactive" });
    }

    const isMatch = await bcrypt.compare(password, superAdmin.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate one-time OTP, hash and store temporarily, send by email
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
    const otpHash = await bcrypt.hash(otp, 10);
    superAdmin.otpHash = otpHash;
    superAdmin.otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
    await superAdmin.save();

    // send OTP via email
    try {
      await otpTransporter.sendMail({
        from: `"Steam Clone Admin" <${process.env.EMAIL_OTP_USER}>`,
        to: superAdmin.email,
        subject: "Your Steam Clone Super Admin login OTP",
        text: `Your one-time login code is: ${otp}. It expires in 5 minutes.`
      });
    } catch (mailErr) {
      console.error("Failed to send OTP email:", mailErr);
    }

    // Tell client that 2FA is required and return superadmin id to verify against
    res.json({ twoFactorRequired: true, superAdminId: superAdmin._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const verifySuperAdminOtp = async (req, res) => {
  try {
    const { superAdminId, otp } = req.body;
    if (!superAdminId || !otp) {
      return res.status(400).json({ message: "Missing parameters" });
    }

    const superAdmin = await SuperAdmin.findById(superAdminId);
    if (!superAdmin || !superAdmin.otpHash || !superAdmin.otpExpires) {
      return res.status(400).json({ message: "OTP not found or expired" });
    }

    if (Date.now() > new Date(superAdmin.otpExpires).getTime()) {
      superAdmin.otpHash = undefined;
      superAdmin.otpExpires = undefined;
      await superAdmin.save();
      return res.status(400).json({ message: "OTP expired" });
    }

    const isMatch = await bcrypt.compare(otp, superAdmin.otpHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid OTP" });
    }

    // Clear OTP fields and update last login
    superAdmin.otpHash = undefined;
    superAdmin.otpExpires = undefined;
    superAdmin.lastLogin = new Date();
    await superAdmin.save();

    const token = jwt.sign(
      { id: superAdmin._id, role: "superadmin" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // log successful login
    try {
      await LoginLog.create({
        user: superAdmin._id,
        action: "superadmin_login",
        ip: req.ip,
        userAgent: req.headers["user-agent"]
      });
    } catch (logErr) {
      console.error("Failed to create login log:", logErr);
    }

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
