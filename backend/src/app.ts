import express from "express";
import cors from "cors";

import marketRoutes from "./modules/market-data/market.routes.js";

const app = express();

app.use(cors());

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    status: "OK",
    service: "Backend is running",
  });
});

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "quantpulse-backend",
  });
});

app.use("/api/market", marketRoutes);

export default app;
