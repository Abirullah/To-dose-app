import jwt from "jsonwebtoken";
import { config } from "dotenv";
import express from "express";

config();

const JWT_SECRET = process.env.JWT_SECRET;



export const verifyUserLoginStatius = async (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1]; 

  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    req.user = decoded; 
    next();
  });
};