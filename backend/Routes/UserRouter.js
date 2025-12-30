import express from "express";
import UserController from "../Controller/UserController.js";
import { AiFeature, GetAIChatHistory } from "./AiFeatureRoutes.js";
import TaskController from "../Controller/TaskController.js";

import { verifyUserLoginStatius } from "../Utils/VerifyUser.js";

import multer from "multer";

const upload = multer({ dest: "ToDosApp/" });

const UserRouter = express.Router({ mergeParams: true });

// User routes

UserRouter.post("/Register", UserController.Register);

UserRouter.post("/VerifyOTP", UserController.VerifyOTP);
UserRouter.post("/Login", UserController.Login);
UserRouter.get(
  "/GetUserProfile/:userId",
  verifyUserLoginStatius,
  UserController.GetUserProfile
);

UserRouter.post(
  "/UpdateUserProfile/:userId",
  verifyUserLoginStatius,
  upload.single("file"),
  UserController.UpdateUserProfile
);
UserRouter.delete(
  "/DeleteUser/:userId",
  verifyUserLoginStatius,
  UserController.DeleteUser
);



//utils route to verify token

UserRouter.post("/verify-token", verifyUserLoginStatius, (req, res) => {
  res.status(200).json({ message: "Token is valid", user: req.user });
});

// AI Feature route

UserRouter.post("/chat/:userId",verifyUserLoginStatius, AiFeature);
UserRouter.get("/get-chats/:userId",verifyUserLoginStatius, GetAIChatHistory);

export default UserRouter;
