import express from "express";
import { config } from "dotenv";
import DbConnection from "./Config/DataBaseConnection.js";
import Routers from "./Routes/Index.js";
import cors from "cors";
import fs from "fs";
import path from "path";

config();
console.log("wowow", process.env.MONGOOSE_URL);
DbConnection();
const app = express();

const PORT = process.env.PORT;

const uploadDir = path.join(process.cwd(), "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", Routers);

app.use((err, req, res, next) => {
  if (!err) return next();
  const status = err.name === "MulterError" ? 400 : 400;
  return res.status(status).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
