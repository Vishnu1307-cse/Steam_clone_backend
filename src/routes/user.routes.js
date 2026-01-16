import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { getMe, updateMe, deleteMe } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/me", authenticate, getMe);
router.put("/me", authenticate, updateMe);
router.delete("/me", authenticate, deleteMe);

export default router;
