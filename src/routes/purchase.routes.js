import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { purchaseGame } from "../controllers/purchase.controller.js";

const router = express.Router();

router.post("/purchase/:gameId", authenticate, purchaseGame);


export default router;
