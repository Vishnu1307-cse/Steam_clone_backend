import crypto from "crypto";

/**
 * Generate RSA key pair for digital signatures
 * @returns {Object} { publicKey, privateKey }
 */
export const generateKeyPair = () => {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: "spki",
      format: "pem"
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem"
    }
  });

  return { publicKey, privateKey };
};

/**
 * Encrypt private key with master encryption key (for secure storage)
 * @param {String} privateKey - The private key in PEM format
 * @returns {String} Encrypted private key (base64)
 */
export const encryptPrivateKey = (privateKey) => {
  const masterKey = process.env.ENCRYPTION_KEY || "your-master-encryption-key-change-me";
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(masterKey.padEnd(32).slice(0, 32)),
    iv
  );
  
  let encrypted = cipher.update(privateKey, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  return iv.toString("hex") + ":" + encrypted;
};

/**
 * Decrypt private key from storage
 * @param {String} encryptedKey - Encrypted private key (base64)
 * @returns {String} Decrypted private key in PEM format
 */
export const decryptPrivateKey = (encryptedKey) => {
  const masterKey = process.env.ENCRYPTION_KEY || "your-master-encryption-key-change-me";
  const [ivHex, encrypted] = encryptedKey.split(":");
  const iv = Buffer.from(ivHex, "hex");
  
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(masterKey.padEnd(32).slice(0, 32)),
    iv
  );
  
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  
  return decrypted;
};

/**
 * Create digital signature by signing employeeId with private key
 * @param {String} employeeId - The employee ID to sign
 * @param {String} privateKey - The private key in PEM format
 * @returns {String} The digital signature in hex format
 */
export const createDigitalSignature = (employeeId, privateKey) => {
  // Hash the employeeId
  const hash = crypto.createHash("sha256").update(employeeId).digest();

  // Sign the hash with private key
  const signature = crypto.createSign("sha256").update(employeeId).sign(privateKey, "hex");

  return signature;
};

/**
 * Verify digital signature
 * @param {String} employeeId - The original employee ID
 * @param {String} signature - The signature in hex format
 * @param {String} publicKey - The public key in PEM format
 * @returns {Boolean} True if signature is valid
 */
export const verifyDigitalSignature = (employeeId, signature, publicKey) => {
  try {
    const verifier = crypto.createVerify("sha256").update(employeeId);
    return verifier.verify(publicKey, signature, "hex");
  } catch (err) {
    console.error("Signature verification error:", err);
    return false;
  }
};
