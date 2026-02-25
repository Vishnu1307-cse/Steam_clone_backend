import express from "express";
import {
  registerUserInit,
  verifyRegisterOtp,
  loginUser,
  verifyOtp
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", registerUserInit);
router.post("/verify-register-otp", verifyRegisterOtp);

router.post("/login", loginUser);
router.post("/verify-otp", verifyOtp);

export default router;
