require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./db/pool");
const userRoutes = require("./routes/userRoutes");
const preferencesRoutes = require("./routes/preferencesRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");

const app = express();
const port = Number(process.env.API_PORT || 4000);

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Database health check failed", error);
    return res.status(500).json({ ok: false, error: "Database connection failed" });
  }
});

app.use("/api", preferencesRoutes);
app.use("/api", favoriteRoutes);
app.use("/api", userRoutes);

app.use((error, _req, res, _next) => {
  console.error("Unhandled backend error", error);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
  console.log(`SnapChef backend listening on http://localhost:${port}`);
});