import express from "express";
import { requestAdmin, approveAdmin } from "../controllers/admin.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { getAllUsers, deleteUser } from "../controllers/admin.controller.js";

const router = express.Router();

router.post("/request", requestAdmin);
router.post("/approve", approveAdmin);
router.get("/users", authenticate, getAllUsers);
router.delete("/users/:userId", authenticate, deleteUser);

export default router;
