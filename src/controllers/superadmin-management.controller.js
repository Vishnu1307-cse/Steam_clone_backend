import User from "../models/User.js";
import LoginLog from "../models/LoginLog.js";
import bcrypt from "bcrypt";
import { verifyDigitalSignature } from "../utils/digitalSignature.js";

/* =====================================================
   DIGITAL SIGNATURE VERIFICATION
===================================================== */

export const verifySignature = async (req, res) => {
  try {
    const { employeeId, publicKey, digitalSignature } = req.body;

    if (!employeeId || !publicKey || !digitalSignature) {
      return res.status(400).json({
        message:
          "employeeId, publicKey, and digitalSignature are required"
      });
    }

    const isValid = verifyDigitalSignature(
      employeeId,
      digitalSignature,
      publicKey
    );

    if (isValid) {
      return res.json({
        valid: true,
        message:
          "✅ Signature is VALID - Employee identity confirmed!",
        employeeId
      });
    }

    return res.status(401).json({
      valid: false,
      message:
        "❌ Signature is INVALID - Could not verify employee identity"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      valid: false,
      message: "Verification error: " + err.message
    });
  }
};

/* =====================================================
   USERS / EMPLOYEES LISTING
===================================================== */

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).select(
      "-passwordHash -otpHash"
    );

    res.json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllEmployees = async (req, res) => {
  try {
    const employees = await User.find({
      role: "employee"
    }).select("-passwordHash -otpHash");

    res.json({ employees });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
   BAN / UNBAN
===================================================== */

export const banUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        isBanned: true,
        banReason: reason
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // LOG ACTION
    try {
      await LoginLog.create({
        user: req.user?.id,
        action: "user_banned",
        ip: req.ip,
        userAgent: req.headers["user-agent"],
        targetUser: userId,
        details: reason
      });
    } catch (logErr) {
      console.error("Failed to create log:", logErr);
    }

    res.json({
      message: "User banned successfully",
      user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error"
    });
  }
};

export const unbanUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        isBanned: false,
        banReason: null
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // LOG ACTION
    try {
      await LoginLog.create({
        user: req.user?.id,
        action: "user_unbanned",
        ip: req.ip,
        userAgent: req.headers["user-agent"],
        targetUser: userId
      });
    } catch (logErr) {
      console.error("Failed to create log:", logErr);
    }

    res.json({
      message: "User unbanned successfully",
      user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error"
    });
  }
};

/* =====================================================
   LOGIN LOGS
===================================================== */

export const getLoginLogs = async (req, res) => {
  try {
    const logs = await LoginLog.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("user", "username email role");

    res.json({ logs });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error"
    });
  }
};
