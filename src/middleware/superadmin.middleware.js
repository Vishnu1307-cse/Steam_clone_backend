import jwt from "jsonwebtoken";
import SuperAdmin from "../models/SuperAdmin.js";

export const authenticateSuperAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "superadmin") {
      return res.status(403).json({ message: "Forbidden: Super Admin access required" });
    }

    const superAdmin = await SuperAdmin.findById(decoded.id);
    if (!superAdmin) {
      return res.status(401).json({ message: "Super Admin not found" });
    }

    if (!superAdmin.isActive) {
      return res.status(403).json({ message: "Super Admin account is inactive" });
    }

    req.user = {
      id: superAdmin._id.toString(),
      role: "superadmin"
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
