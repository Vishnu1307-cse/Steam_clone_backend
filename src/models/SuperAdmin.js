import mongoose from "mongoose";

const superAdminSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    employeeId: { type: String, required: true, unique: true },
    
    role: {
      type: String,
      enum: ["superadmin"],
      default: "superadmin"
    },

    // Digital Signature fields
    publicKey: String,
    privateKey: String,
    digitalSignature: String,

    // OTP for login (email) - stored hashed
    otpHash: { type: String },
    otpExpires: { type: Date },

    // Track admin actions
    lastLogin: { type: Date },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model("SuperAdmin", superAdminSchema);
