import express from "express";
import cors from "cors";
import { config } from "dotenv";
import mongoose from "mongoose";
import DbConnection from "./Config/DataBaseConnection.js";
import Routers from "./Routes/RoutesIndex.js";

config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "0.0.0.0";

process.on("unhandledRejection", (reason) => {
  console.error("UNHANDLED_REJECTION:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT_EXCEPTION:", err);
  // Let Railway restart the process
  process.exit(1);
});

/* ---------- MIDDLEWARE ---------- */

const defaultAllowedOrigins = [
  "https://abirafriditaskmaster.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",")
      .map((o) => o.trim())
      .filter(Boolean)
  : defaultAllowedOrigins;

const allowAllOrigins = allowedOrigins.includes("*");

app.use(
  cors({
    origin: (origin, callback) => {
      // allow non-browser clients (curl, server-to-server)
      if (!origin || allowAllOrigins) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ---------- ROUTES ---------- */

app.get("/", (req, res) => {
  res.status(200).send("API is running 🚀");
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    db: mongoose.connection.readyState, // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
  });
});

const requireDbConnection = (req, res, next) => {
  if (mongoose.connection.readyState === 1) return next();
  return res.status(503).json({
    success: false,
    message: "Database not connected. Try again in a moment.",
  });
};

// Your main routes
app.use("/", requireDbConnection, Routers);

/* ---------- ERROR HANDLER ---------- */

app.use((err, req, res, next) => {
  console.error("ERROR:", err);
  const status = Number(err?.statusCode || err?.status || 500);
  res.status(status).json({
    success: false,
    message: err.message || "Something went wrong",
  });
});

/* ---------- SERVER START ---------- */

const connectDbWithRetry = async (attempt = 1) => {
  try {
    console.log("Connecting to database...");
    await DbConnection();
    console.log("Database connected ✅");
  } catch (error) {
    console.error(`Database connection failed (attempt ${attempt}) ❌`);
    console.error(error.message);

    const delayMs = Math.min(30_000, 1000 * 2 ** (attempt - 1));
    console.log(`Retrying in ${delayMs}ms...`);
    setTimeout(() => connectDbWithRetry(attempt + 1), delayMs);
  }
};

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});

connectDbWithRetry();
