import bcrypt from "bcrypt";
import crypto from "crypto";
import EmployeeRequest from "../models/EmployeeRequest.js";
import User from "../models/User.js";
import { transporter } from "../config/mail.js";
import jwt from "jsonwebtoken";
import { generateKeyPair, createDigitalSignature, encryptPrivateKey, decryptPrivateKey } from "../utils/digitalSignature.js";

export const requestEmployee = async (req, res) => {
  const { username, email, password, employeeId } = req.body;

  // Validate employeeId
  if (!employeeId) {
    return res.status(400).json({ message: "Employee ID is required" });
  }

  // Check if employeeId already exists
  const existingEmployee = await User.findOne({ employeeId });
  if (existingEmployee) {
    return res.status(409).json({ message: "Employee ID already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 12);

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

  await EmployeeRequest.create({
    username,
    email,
    passwordHash,
    employeeId,
    approvalTokenHash: tokenHash,
    publicKey,
    privateKey: encryptedPrivateKey,
    digitalSignature,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000)
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: "Employee Creation Request with Digital Signature",
    text: `
Employee account request:

Username: ${username}
Email: ${email}
Employee ID: ${employeeId}

Approval Token:
${rawToken}

--- DIGITAL SIGNATURE VERIFICATION ---
Requester's Public Key:
${publicKey}

Digital Signature (Employee ID signed with their private key):
${digitalSignature}
`
  });

  res.status(200).json({ message: "Employee request sent for approval" });
};

export const approveEmployee = async (req, res) => {
  const { email, token } = req.body;

  if (!email || !token) {
    return res.status(400).json({ message: "Email and token required" });
  }

  const request = await EmployeeRequest.findOne({ email, used: false });

  if (!request) {
    return res.status(404).json({ message: "No pending employee request" });
  }

  if (request.expiresAt < new Date()) {
    return res.status(400).json({ message: "Token expired" });
  }

  const tokenHash = crypto
    .createHash("sha256")
    .update(token.trim())
    .digest("hex");

  if (tokenHash !== request.approvalTokenHash) {
    return res.status(401).json({ message: "Invalid token" });
  }

  await User.create({
    username: request.username,
    email: request.email,
    passwordHash: request.passwordHash,
    employeeId: request.employeeId,
    publicKey: request.publicKey,
    privateKey: request.privateKey,
    digitalSignature: request.digitalSignature,
    role: "employee",
    isVerified: true
  });

  request.used = true;
  await request.save();

  res.json({ message: "Employee approved and account created" });
};


export const getAllUsers = async (req, res) => {
  // employee/admin can list regular users; superadmin can list all users including employees
  if (!(req.user.role === "employee" || req.user.role === "admin" || req.user.role === "superadmin")) {
    return res.status(403).json({ message: "Employees only" });
  }

  const { q } = req.query;

  let filter = {};

  if (req.user.role === "superadmin") {
    // no role filter, superadmin sees everybody (except maybe other superadmins)
    filter = {};
  } else {
    filter = { role: "user" };
  }

  if (q) {
    filter.$or = [
      { username: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } }
    ];
  }

  const users = await User.find(filter).select("-passwordHash");

  res.json(users);
};

export const deleteUser = async (req, res) => {
  // Only employees/admins can delete regular users; superadmin can delete any non-superadmin
  if (!(req.user.role === "employee" || req.user.role === "admin" || req.user.role === "superadmin")) {
    return res.status(403).json({ message: "Employees only" });
  }

  const user = await User.findById(req.params.userId);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // if requester is not superadmin, prevent deleting employees/admins
  if (req.user.role !== "superadmin" && (user.role === "employee" || user.role === "admin")) {
    return res.status(404).json({ message: "User not found" });
  }

  // prevent deleting superadmin accounts
  if (user.role === "superadmin") {
    return res.status(403).json({ message: "Cannot delete superadmin" });
  }

  await user.deleteOne();
  res.json({ message: "User deleted" });
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({ token });
};

export const getLogs = async (req, res) => {
  // only superadmin can view logs
  if (req.user.role !== "superadmin") {
    return res.status(403).json({ message: "Superadmins only" });
  }

  const { userId } = req.query;

  const filter = {};
  if (userId) filter.user = userId;

  const logs = await (await import("../models/LoginLog.js")).default.find(filter)
    .populate("user", "username email role")
    .sort({ createdAt: -1 });

  res.json(logs);
};
