import mongoose from "mongoose";

const superAdminRequestSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true },
    passwordHash: { type: String, required: true },
    employeeId: { type: String, required: true, unique: true },

    // Approval token for verification
    approvalTokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },

    // Digital Signature fields
    publicKey: String, // SuperAdmin's public key (sent to company)
    privateKey: String, // SuperAdmin's encrypted private key (stored for later use)
    digitalSignature: String, // SuperAdmin's signature (hashed employeeId encrypted with private key)

    // Status tracking
    used: { type: Boolean, default: false },
    verifiedAt: { type: Date },

    // Admin approval tracking
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "SuperAdmin" },
    approvalTimestamp: { type: Date }
  },
  { timestamps: true }
);

export default mongoose.model("SuperAdminRequest", superAdminRequestSchema);
