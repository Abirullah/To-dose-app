import express from "express";
import UserController from "../Controller/UserController.js";
import { AiFeature, GetAIChatHistory } from "./AiFeatureRoutes.js";
import TaskController from "../Controller/TaskController.js";

import { verifyUserLoginStatius } from "../Utils/VerifyUser.js";
import { requireSelf } from "../MiddleWears/RequireSelf.js";

import multer from "multer";

const uploadDir = process.env.VERCEL ? "/tmp/uploads" : "uploads/";

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const UserRouter = express.Router({ mergeParams: true });

// User routes

UserRouter.post("/Register", UserController.Register);

UserRouter.post("/VerifyOTP", UserController.VerifyOTP);
UserRouter.post("/Login", UserController.Login);
UserRouter.get(
  "/GetUserProfile/:userId",
  verifyUserLoginStatius,
  requireSelf,
  UserController.GetUserProfile
);

UserRouter.post(
  "/UpdateUserProfile/:userId",
  verifyUserLoginStatius,
  requireSelf,
  upload.single("file"),
  UserController.UpdateUserProfile
);

UserRouter.post(
  "/UpdatePassword/:userId",
  verifyUserLoginStatius,
  requireSelf,
  UserController.UpdatePassword
);
UserRouter.delete(
  "/DeleteUser/:userId",
  verifyUserLoginStatius,
  requireSelf,
  UserController.DeleteUser
);



//utils route to verify token

UserRouter.post("/verify-token", verifyUserLoginStatius, (req, res) => {
  res.status(200).json({ message: "Token is valid", user: req.user });
});

// AI Feature route

UserRouter.post("/chat/:userId", verifyUserLoginStatius, requireSelf, AiFeature);
UserRouter.get(
  "/get-chats/:userId",
  verifyUserLoginStatius,
  requireSelf,
  GetAIChatHistory
);

export default UserRouter;
