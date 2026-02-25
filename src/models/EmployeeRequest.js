import mongoose from "mongoose";

const employeeRequestSchema = new mongoose.Schema(
  {
    username: String,
    email: String,
    passwordHash: String,
    employeeId: { type: String, required: true, unique: true },

    approvalTokenHash: String,

    // Digital Signature fields
    publicKey: String, // Employee's public key (sent to company)
    privateKey: String, // Employee's encrypted private key (stored for later use)
    digitalSignature: String, // Employee's signature (hashed employeeId encrypted with private key)

    expiresAt: Date,
    used: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Auto delete expired requests
employeeRequestSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("EmployeeRequest", employeeRequestSchema);
