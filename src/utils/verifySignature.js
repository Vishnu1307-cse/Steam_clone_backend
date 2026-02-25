import crypto from "crypto";

/**
 * Verify digital signature from email
 * Copy the public key and digital signature from the email and paste them below
 */

const employeeId = "EMP001"; // The employee ID from the email
const publicKey = `-----BEGIN PUBLIC KEY-----
PASTE_THE_PUBLIC_KEY_FROM_EMAIL_HERE
-----END PUBLIC KEY-----`;

const digitalSignature = "PASTE_THE_DIGITAL_SIGNATURE_HEX_STRING_HERE";

// Verify the signature
try {
  const verifier = crypto.createVerify("sha256").update(employeeId);
  const isValid = verifier.verify(publicKey, digitalSignature, "hex");

  if (isValid) {
    console.log("✅ Signature is VALID - Employee identity confirmed!");
    console.log(`Employee ID: ${employeeId}`);
    console.log("This proves the employee has the corresponding private key.");
  } else {
    console.log("❌ Signature is INVALID - Could not verify employee identity");
  }
} catch (err) {
  console.error("❌ Verification error:", err.message);
  console.log("Make sure you copied the public key and signature correctly.");
}
