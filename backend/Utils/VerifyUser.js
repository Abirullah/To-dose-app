import jwt from "jsonwebtoken";
import { config } from "dotenv";
import User from "../Modells/UserModle.js";

config();

const JWT_SECRET =
  process.env.JWT_SECRET_KEY || process.env.JWT_SECRET || "";

export const verifyUserLoginStatius = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    // console.log(token)

    if (!token) {
      return res.status(401).json({ message: "Token missing" });
    }

    if (!JWT_SECRET) {
      return res.status(500).json({ message: "JWT secret is not configured" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id);

    // console.log(decoded)

    if (!user) {
      return res.status(404).json({ message: "User not found or deleted" });
    }

    if (!user.verified) {
      return res.status(403).json({ message: "User is blocked" });
    }

    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
