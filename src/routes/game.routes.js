import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { getMyGames } from "../controllers/game.controller.js";
import {
  getAllGames,
  getGameById,
  createGame,
  updateGame,
  deleteGame,
  searchGamesByName
} from "../controllers/game.controller.js";

const router = express.Router();

// 🔍 SEARCH MUST COME BEFORE :id
router.get("/search", searchGamesByName);

// Public
router.get("/", getAllGames);
router.get("/me", authenticate, getMyGames);
router.get("/:id", getGameById);

// Protected
router.post("/", authenticate, createGame);
router.put("/:id", authenticate, updateGame);
router.delete("/:id", authenticate, deleteGame);

export default router;
