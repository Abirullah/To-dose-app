import express from "express";
import UserController from "../Controller/UserController.js";
import { AiFeature } from "../Utils/AiFeature.js";

import { verifyUserLoginStatius } from "../Utils/VerifyUser.js";



import multer from "multer";


const upload = multer({ dest: "ToDosApp/" });



const UserRouter = express.Router({ mergeParams: true });

UserRouter.post("/Register", UserController.Register);
UserRouter.post("/VerifyOTP", UserController.VerifyOTP);
UserRouter.post("/Login", UserController.Login);
UserRouter.get("/GetUserProfile/:userId",verifyUserLoginStatius, UserController.GetUserProfile);

UserRouter.post("/UpdateUserProfile/:userId",verifyUserLoginStatius , upload.single('file'), UserController.UpdateUserProfile);

UserRouter.post("/verify-token", verifyUserLoginStatius, (req, res) => {
  res.status(200).json({ message: "Token is valid", user: req.user });
});

UserRouter.post('/chat', AiFeature)


export default UserRouter;
