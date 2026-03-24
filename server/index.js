// Load .env.local first (Next.js convention), then .env as fallback
require("dotenv").config({ path: ".env.local" });
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const pool = require("./db/pool");
const userRoutes = require("./routes/userRoutes");
const preferencesRoutes = require("./routes/preferencesRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");

const app = express();
const port = Number(process.env.API_PORT || 4000);

// When requests reach Express via the Next.js proxy rewrite they originate from
// the Next.js server process, so CORS is mostly irrelevant in that path.
// This origin list covers direct browser requests used in development.
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
];

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) {
        cb(null, true);
      } else {
        cb(new Error(`CORS: origin '${origin}' is not allowed`));
      }
    },
    credentials: true, // required so the browser sends/receives cookies
  }),
);

app.use(express.json({ limit: "2mb" }));

// Signed cookies — the secret prevents clients from forging a sc_session value.
const cookieSecret = process.env.COOKIE_SECRET;
if (!cookieSecret) {
  console.warn("[warn] COOKIE_SECRET is not set — using insecure dev fallback");
}
app.use(cookieParser(cookieSecret ?? "dev-insecure-secret-change-me"));

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