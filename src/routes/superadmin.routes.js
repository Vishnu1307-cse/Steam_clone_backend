import express from "express";
import {
  requestSuperAdmin,
  registerSuperAdmin,
  loginSuperAdmin,
  verifySuperAdminOtp
} from "../controllers/superadmin.controller.js";

import {
  getAllUsers,
  getAllEmployees,
  banUser,
  unbanUser,
  getLoginLogs,
  verifySignature
} from "../controllers/superadmin-management.controller.js";

import { authenticateSuperAdmin } from "../middleware/superadmin.middleware.js";

const router = express.Router();

/* ============================
   SUPER ADMIN AUTH FLOW
============================ */

// Registration
router.post("/request", requestSuperAdmin);
router.post("/register", registerSuperAdmin);

// Login
router.post("/login", loginSuperAdmin);
router.post("/verify-otp", verifySuperAdminOtp);

// Digital signature verification (optional / public)
router.post("/verify-signature", verifySignature);

/* ============================
   MANAGEMENT (SUPER ADMIN ONLY)
============================ */

router.get("/users/all", authenticateSuperAdmin, getAllUsers);

router.get("/employees/all", authenticateSuperAdmin, getAllEmployees);

router.post("/users/:userId/ban", authenticateSuperAdmin, banUser);
router.post("/users/:userId/unban", authenticateSuperAdmin, unbanUser);

router.get("/logs", authenticateSuperAdmin, getLoginLogs);

export default router;
