import express from "express";
import { requestEmployee, approveEmployee, getAllUsers, deleteUser } from "../controllers/employee.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { getLogs } from "../controllers/employee.controller.js";

const router = express.Router();

router.post("/request", requestEmployee);
router.post("/approve", approveEmployee);
router.get("/users", authenticate, getAllUsers);
router.delete("/users/:userId", authenticate, deleteUser);
router.get("/logs", authenticate, getLogs);

export default router;
