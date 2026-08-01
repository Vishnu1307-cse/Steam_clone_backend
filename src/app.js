import express from "express";
import cors from "cors";

import employeeRoutes from "./routes/employee.routes.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import gameRoutes from "./routes/game.routes.js";
import purchaseRoutes from "./routes/purchase.routes.js";
import libraryRoutes from "./routes/library.routes.js";
import superadminRoutes from "./routes/superadmin.routes.js";

const app = express();

// =========================================================
// ✅ HEALTH CHECK — MUST be before CORS so ping bots
//    (UptimeRobot, cron-job.org, Better Stack, etc.) can
//    reach these endpoints without being blocked by origin
//    restrictions. They send no Origin header.
// =========================================================
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "Steam Clone Backend",
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`
  });
});

// Also respond to HEAD (some bots use HEAD instead of GET)
app.head("/health", (req, res) => res.status(200).end());

app.get("/ping", (req, res) => res.status(200).send("pong"));
app.head("/ping", (req, res) => res.status(200).end());

app.get("/", (req, res) => res.status(200).json({ status: "ok" }));
app.head("/", (req, res) => res.status(200).end());

// =========================================================

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5174",
  "https://steamclone-pm23a39q9-vishnus-projects-12deed2b.vercel.app",
  "https://steamclone.vercel.app"
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/superadmin", superadminRoutes);
app.use("/employee", employeeRoutes);
app.use("/users", userRoutes);
app.use("/library", libraryRoutes);
app.use("/games", gameRoutes);
app.use("/games", purchaseRoutes);

export default app;

