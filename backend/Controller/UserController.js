import express from "express";
import { config } from "dotenv";
import jwt from 'jsonwebtoken'
import UserModel from "../Modells/UserModle.js";
import bcrypt from "bcrypt";
import  uploadToCloudinary  from "../Utils/Cloudnary.js";
import fs from "fs";
import { assertEmailSenderConfigured, sendEmail } from "../Utils/sendEmail.js";


const app = express();

config();

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN


const generateToken = (user) => {
  //  console.log("USER PASSED TO TOKEN:", user)
  return jwt.sign(
    { id: user._id, email: user.email, name: user.name },
    JWT_SECRET_KEY,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const Register = async (req, res) => {
  try {
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

    try {
      assertEmailSenderConfigured();
    } catch (err) {
      return res.status(500).json({
        message: err?.message || "Email service is not configured on the server.",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate OTP
    const OTP = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP and temp user data in DB (or cache like Redis)
    const createdUser = await UserModel.create({
      name,
      email,
      password: hashedPassword,
      otp: OTP,
      otpExpiresAt: Date.now() + 1000 * 60 * 60 * 24,
    });

    try {
      const mailResult = await sendEmail({
        to: email,
        subject: "OTP Verification",
        html: `<h3>Your OTP is: <b>${OTP}</b></h3>`,
        timeoutMs: 8_000,
      });

      return res.status(200).json({
        message: "OTP sent to email verify it in 24 hours",
        ...(mailResult?.provider === "console" ? { devOtp: OTP } : {}),
      });
    } catch (mailError) {
      try {
        await UserModel.deleteOne({ _id: createdUser._id });
      } catch {
        // ignore cleanup errors
      }
      throw mailError;
    }
  } catch (error) {
    console.error("Register error:", error);
    return res
      .status(500)
      .json({ message: error?.message || "Server error" });
  }
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
  if (user.length === 0) {
     return res.status(401).json({ message: "Invalid email or password" });
  }

  const PasswordsMatch = await bcrypt.compare(password, user[0].password);

  if ( !PasswordsMatch) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
  if (!user[0].verified) {
    return res
      .status(403)
      .json({ message: "Please verify your email before logging in" });
  }

  console.log("User Durning Logining : " + user) 

   const token = generateToken(user[0]);

  return res.status(200).json({token, message: "Login successful", user });
};


const UpdateUserProfile = async (req, res) => {
  const { userId } = req.params;
  const { name } = req.body;

  try {
   
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

  
    let avatarUrl = user.avatarUrl;
    if (req.file) {
      if (!req.file.mimetype?.startsWith("image/")) {
        try {
          fs.unlinkSync(req.file.path);
        } catch {
          // ignore
        }
        return res.status(400).json({ message: "Avatar must be an image" });
      }
      avatarUrl = await uploadToCloudinary(req.file.path, {
        folder: "ToDosApp/avatars",
        resource_type: "image",
        originalName: req.file.originalname,
      });
    }

  
    user.name = name || user.name;
    user.avatarUrl = avatarUrl;

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    if (error?.code === 11000) {
      return res.status(409).json({ message: "Email already in use" });
    }
    res.status(500).json({ message: error.message });
  }
};



const UpdatePassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (String(newPassword).length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const GetUserProfile = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const DeleteUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await UserModel.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error" });
  }
};





export default {
  Register,
  Login,
  VerifyOTP,
  UpdateUserProfile,
  UpdatePassword,
  GetUserProfile,
  DeleteUser,
};
