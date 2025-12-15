import express from "express";
import { config } from "dotenv";
import jwt from 'jsonwebtoken'
const app = express();
import UserModel from "../Modells/UserModle.js";
import nodemailar from "nodemailer";
import bcrypt from "bcrypt";
import  uploadToCloudinary  from "../Utils/Cloudnary.js";
import UserWorksModel from "../Modells/UserWorksModel.js";


config();

const JWT_SECRET_kEY = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN


const generateToken = (user) => {
  //  console.log("USER PASSED TO TOKEN:", user)
  return jwt.sign(
    { id: user._id, email: user.email, name: user.name },
    JWT_SECRET_kEY,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

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
  const transporter = nodemailar.createTransport({
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
    otpExpiresAt: Date.now() + 1000 * 60 * 60 * 24, // 10 min expiry
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
  const { name, email } = req.body;

  try {
   
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

  
    let avatarUrl = user.avatarUrl;
    if (req.file) {
      avatarUrl = await uploadToCloudinary(req.file.path);
    }

  
    user.name = name || user.name;
    user.email = email || user.email;
    user.avatarUrl = avatarUrl;

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: error.message });
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
  GetUserProfile,
  DeleteUser,
};
