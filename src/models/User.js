import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true
    },

    email: {
      type: String,
      required: true,
      unique: true
    },

    passwordHash: {
      type: String,
      required: true
    },

    // Only for employee / admin roles
    employeeId: {
      type: String,
      sparse: true,
      unique: true
    },

    role: {
      type: String,
      enum: ["user", "employee", "admin", "superadmin"],
      default: "user"
    },

    /* ======================
       Digital identity
    ====================== */

    // Store ONLY public key
    publicKey: String,

    // Optional: encrypted private key (demo only)
    encryptedPrivateKey: String,

    // OTP / verification
    otpHash: String,
    otpExpires: Date,

    isVerified: {
      type: Boolean,
      default: false
    },

    /* ======================
       Moderation
    ====================== */

    isBanned: {
      type: Boolean,
      default: false
    },

    banReason: String
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
