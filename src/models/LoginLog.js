import mongoose from "mongoose";

const loginLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, enum: ["login", "superadmin_login", "user_banned", "user_unbanned", "admin_request_approved", "admin_request_rejected", "employee_request_approved", "employee_request_rejected"], default: "login" },
    ip: String,
    userAgent: String,
    targetUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    details: String
  },
  { timestamps: true }
);

export default mongoose.model("LoginLog", loginLogSchema);
