import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import { otpTransporter } from "../config/mail.js";
import LoginLog from "../models/LoginLog.js";

/* ===========================
   REGISTER -> SEND OTP
=========================== */

export const registerUserInit = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const exists = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (exists) {
      return res.status(409).json({
        message: "Username or email already exists"
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);

    const user = await User.create({
      username,
      email,
      passwordHash,
      role: "user",
      isVerified: false,
      otpHash,
      otpExpires: Date.now() + 5 * 60 * 1000
    });

    await otpTransporter.sendMail({
      from: `"Steam Clone" <${process.env.EMAIL_OTP_USER}>`,
      to: email,
      subject: "Verify your Steam Clone account",
      text: `Your verification code is: ${otp}. Expires in 5 minutes.`
    });

    res.status(201).json({
      message: "OTP sent",
      userId: user._id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ===========================
   VERIFY REGISTER OTP
=========================== */

export const verifyRegisterOtp = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId);

    if (!user || !user.otpHash) {
      return res.status(400).json({ message: "OTP invalid or expired" });
    }

    if (Date.now() > new Date(user.otpExpires).getTime()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    const ok = await bcrypt.compare(otp, user.otpHash);

    if (!ok) {
      return res.status(401).json({ message: "Invalid OTP" });
    }

    user.isVerified = true;
    user.otpHash = undefined;
    user.otpExpires = undefined;

    await user.save();

    res.json({ message: "Account verified" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ===========================
   LOGIN -> SEND OTP
=========================== */

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: "Account not verified"
      });
    }

    if (user.isBanned) {
      return res.status(403).json({
        message: "Account banned",
        banReason: user.banReason
      });
    }

    const match = await bcrypt.compare(password, user.passwordHash);

    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);

    user.otpHash = otpHash;
    user.otpExpires = Date.now() + 5 * 60 * 1000;

    await user.save();

    await otpTransporter.sendMail({
      from: `"Steam Clone" <${process.env.EMAIL_OTP_USER}>`,
      to: user.email,
      subject: "Login OTP",
      text: `Your login OTP: ${otp}. Expires in 5 minutes.`
    });

    res.json({
      twoFactorRequired: true,
      userId: user._id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ===========================
   VERIFY LOGIN OTP
=========================== */

export const verifyOtp = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId);

    if (!user || !user.otpHash) {
      return res.status(400).json({ message: "OTP invalid or expired" });
    }

    if (Date.now() > new Date(user.otpExpires).getTime()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    const ok = await bcrypt.compare(otp, user.otpHash);

    if (!ok) {
      return res.status(401).json({ message: "Invalid OTP" });
    }

    user.otpHash = undefined;
    user.otpExpires = undefined;

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    await LoginLog.create({
      user: user._id,
      action: "login",
      ip: req.ip,
      userAgent: req.headers["user-agent"]
    });

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
