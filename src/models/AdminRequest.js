import mongoose from "mongoose";

const adminRequestSchema = new mongoose.Schema(
  {
    username: String,
    email: String,
    passwordHash: String,

    approvalTokenHash: String,

    expiresAt: Date,
    used: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Auto delete expired requests
adminRequestSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("AdminRequest", adminRequestSchema);
