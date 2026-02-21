import DbConnection from "./Config/DataBaseConnection.js";
import app from "./app.js";
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "0.0.0.0";
const bindHost = ["localhost", "127.0.0.1", "::1"].includes(HOST)
  ? "0.0.0.0"
  : HOST;

process.on("unhandledRejection", (reason) => {
  console.error("UNHANDLED_REJECTION:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT_EXCEPTION:", err);
  process.exit(1);
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

const server = app.listen(PORT, bindHost);
server.on("error", (err) => {
  console.error("SERVER_ERROR:", err);
  process.exit(1);
});
server.on("listening", () => {
  const addr = server.address();
  if (typeof addr === "string") {
    console.log(`Server running on ${addr}`);
    return;
  }
  console.log(`Server running on http://${addr.address}:${addr.port}`);
});

connectDbWithRetry();
