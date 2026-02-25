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

const allowedOrigins = [
  "http://localhost:3000",
  "https://steamclone-pm23a39q9-vishnus-projects-12deed2b.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true
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

app.get("/ping", (req, res) => {
  res.status(200).send("Server is alive");
});

export default app;
