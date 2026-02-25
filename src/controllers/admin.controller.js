import bcrypt from "bcrypt";
import crypto from "crypto";
import AdminRequest from "../models/AdminRequest.js";
import User from "../models/User.js";
import { transporter } from "../config/mail.js";

export const requestAdmin = async (req, res) => {
  const { username, email, password } = req.body;

  const passwordHash = await bcrypt.hash(password, 12);

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  await AdminRequest.create({
    username,
    email,
    passwordHash,
    approvalTokenHash: tokenHash,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000)
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: "Employee Creation Request",
    text: `
Employee account request:

Username: ${username}
Email: ${email}

Approval Token:
${rawToken}
`
  });

  res.status(200).json({ message: "Employee request sent for approval" });
};



export const approveAdmin = async (req, res) => {
  const { email, token } = req.body;

  if (!email || !token) {
    return res.status(400).json({ message: "Email and token required" });
  }

  const request = await AdminRequest.findOne({ email, used: false });

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
    role: "employee"
  });

  request.used = true;
  await request.save();

  res.json({ message: "Employee approved and account created" });
};


export const getAllUsers = async (req, res) => {
  if (!(req.user.role === "employee" || req.user.role === "admin")) {
    return res.status(403).json({ message: "Employees only" });
  }

  const { q } = req.query;

  const filter = {
    role: "user"
  };

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
  if (!(req.user.role === "employee" || req.user.role === "admin")) {
    return res.status(403).json({ message: "Employees only" });
  }

  const user = await User.findById(req.params.userId);

  if (!user || user.role === "employee" || user.role === "admin") {
    return res.status(404).json({ message: "User not found" });
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
