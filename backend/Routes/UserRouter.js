import express from "express";
import UserController from "../Controller/UserController.js";
const UserRouter = express.Router({ mergeParams: true });

UserRouter.post("/Register", UserController.Register);
UserRouter.post("/VerifyOTP", UserController.VerifyOTP);
UserRouter.post("/Login", UserController.Login);
export default UserRouter;
