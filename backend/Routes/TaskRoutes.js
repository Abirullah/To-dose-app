import express from "express";
import { verifyUserLoginStatius } from "../Utils/VerifyUser.js";
import TaskController from "../Controller/TaskController.js";

const TaskRoutes = express.Router({ mergeParams: true });

// Task routes

TaskRoutes.post(
    "/AddTask/:userId",
    verifyUserLoginStatius,
    TaskController.AddTask
);
TaskRoutes.get(
    "/GetTasks/:userId",
    verifyUserLoginStatius,
    TaskController.GetTasks
);
TaskRoutes.put(
    "/UpdateTask/:userId",
    verifyUserLoginStatius,
    TaskController.UpdateTask
);
TaskRoutes.delete(
    "/DeleteTask/:TaskId",
    verifyUserLoginStatius,
    TaskController.DeleteTask
);



export default TaskRoutes;