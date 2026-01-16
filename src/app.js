import express from "express";
import cors from "cors";

import adminRoutes from "./routes/admin.routes.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import gameRoutes from "./routes/game.routes.js";
import purchaseRoutes from "./routes/purchase.routes.js";
import libraryRoutes from "./routes/library.routes.js";

const app = express();

/**
 * ✅ CORS CONFIG
 * Allow frontend to talk to backend
 */
app.use(
  cors({
    origin: "http://localhost:5173", // Vite frontend
    credentials: true
  })
);

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/users", userRoutes);
app.use("/library", libraryRoutes);
app.use("/games", gameRoutes);
app.use("/games", purchaseRoutes);

export default app;
