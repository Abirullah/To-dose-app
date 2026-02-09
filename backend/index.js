import express from "express";
import cors from "cors";
import { config } from "dotenv";
import DbConnection from "./Config/DataBaseConnection.js";
import Routers from "./Routes/Index.js";

config();

const app = express();
const PORT = process.env.PORT || 3000;

/* ---------- MIDDLEWARE ---------- */

// TEMP: allow all origins to avoid CORS 502
app.use(cors());

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ---------- ROUTES ---------- */

// Health check (IMPORTANT for Railway)
app.get("/", (req, res) => {
  res.status(200).send("API is running 🚀");
});

// Your main routes
app.use("/", Routers);

/* ---------- ERROR HANDLER ---------- */

app.use((err, req, res, next) => {
  console.error("ERROR:", err);
  res.status(400).json({
    success: false,
    message: err.message || "Something went wrong",
  });
});

/* ---------- SERVER START ---------- */

const startServer = async () => {
  try {
    console.log("Connecting to database...");
    await DbConnection();
    console.log("Database connected ✅");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server ❌");
    console.error(error.message);
    process.exit(1);
  }
};

startServer();
