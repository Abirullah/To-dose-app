import express from "express";
import { config } from "dotenv";
const app = express();
import UserModel from "../Modells/UserModle.js";
import nodemilar from "nodemailer";
import bcrypt from "bcrypt";
import { version } from "mongoose";

config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const Register = async (req, res) => {
  const { name, email, password, conformPassword } = req.body;

  if (!name || !email || !password || !conformPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (password !== conformPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    return res
      .status(409)
      .json({ message: "User with this email already exists" });
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Generate OTP
  const OTP = Math.floor(100000 + Math.random() * 900000).toString();

  // Send OTP via email
  const transporter = nodemilar.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_SERVICE,
      pass: process.env.APP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_SERVICE,
    to: email,
    subject: "OTP Verification",
    html: `<h3>Your OTP is: <b>${OTP}</b></h3>`,
  });

  // Save OTP and temp user data in DB (or cache like Redis)
  await UserModel.create({
    name,
    email,
    password: hashedPassword,
    otp: OTP,
    otpExpiresAt: Date.now() + 10 * 60 * 60 * 500, // 10 min expiry
  });

  return res
    .status(200)
    .json({ message: "OTP sent to email verify it in 24 hours" });
};

const VerifyOTP = async (req, res) => {
  const { otp, email } = req.body;

  if (!otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }
  const tempUser = await UserModel.findOne({ email });

  if (!tempUser) {
    return res.status(400).json({
      message:
        "No pending verification for this email or Verfication time expeired",
    });
  }

  if (tempUser.otp !== otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  if (Date.now() > tempUser.otpExpiresAt) {
    await UserModel.deleteOne({ email });
    return res.status(400).json({ message: "OTP expired" });
  }

  // Create actual user

  await UserModel.updateOne({ email }, { verified: true });

  return res
    .status(201)
    .json({ message: "User verified and registered successfully" });
};

const Login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  const user = await UserModel.find({ email });
  const PasswordsMatch = await bcrypt.compare(password, user[0].password);

  if (user.length === 0 || !PasswordsMatch) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
  if (!user[0].verified) {
    return res
      .status(403)
      .json({ message: "Please verify your email before logging in" });
  }

  return res.status(200).json({ message: "Login successful", user });
};

export default {
  Register,
  Login,
  VerifyOTP,
};
