import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { getMyLibrary } from "../controllers/library.controller.js";

const router = express.Router();

router.get("/", authenticate, getMyLibrary);

export default router;
