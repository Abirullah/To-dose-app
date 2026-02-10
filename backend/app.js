import express from "express";
import cors from "cors";
import { config } from "dotenv";
import mongoose from "mongoose";
import DbConnection from "./Config/DataBaseConnection.js";
import Routers from "./Routes/RoutesIndex.js";

config();

const app = express();

/* ---------- MIDDLEWARE ---------- */

app.use((req, res, next) => {
  const start = Date.now();
  console.log(`--> ${req.method} ${req.originalUrl}`);
  res.on("finish", () => {
    console.log(
      `<-- ${req.method} ${req.originalUrl} ${res.statusCode} ${
        Date.now() - start
      }ms`
    );
  });
  next();
});

// Health check (keep this BEFORE other middleware to debug edge/proxy issues)
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    db: mongoose.connection.readyState,
  });
});

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

const corsOptions = {
  origin: (origin, callback) => {
    // allow non-browser clients (curl, server-to-server)
    if (!origin || allowAllOrigins) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

app.use(cors(corsOptions));
// Express 5 + path-to-regexp: "*" is an invalid path pattern (wildcards must be named)
app.options("/{*path}", cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ---------- ROUTES ---------- */

app.get("/", (req, res) => {
  res.status(200).send("API is running 🚀");
});

const ensureDbConnection = async (req, res, next) => {
  if (mongoose.connection.readyState === 1) return next();
  try {
    await DbConnection();
    return next();
  } catch (err) {
    err.statusCode = err?.statusCode || 503;
    err.message =
      err?.message || "Database not connected. Try again in a moment.";
    return next(err);
  }
};

app.use("/", ensureDbConnection, Routers);

/* ---------- ERROR HANDLER ---------- */

app.use((err, req, res, next) => {
  console.error("ERROR:", err);
  const status = Number(err?.statusCode || err?.status || 500);
  res.status(status).json({
    success: false,
    message: err.message || "Something went wrong",
  });
});

export default app;
