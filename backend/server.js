import express from "express";
import { config } from "dotenv";
import DbConnection from "./Config/DataBaseConnection.js";
import Routers from "./Routes/Index.js";
import cors from "cors";

config();
console.log("wowow", process.env.MONGOOSE_URL);
DbConnection();
const app = express();

const PORT = process.env.PORT;

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", Routers);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
