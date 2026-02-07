import express from "express";
import { verifyUserLoginStatius } from "../Utils/VerifyUser.js";
import TaskController from "../Controller/TaskController.js";
import { requireSelf } from "../MiddleWears/RequireSelf.js";

const TaskRoutes = express.Router({ mergeParams: true });

// Task routes

TaskRoutes.post(
    "/AddTask/:userId",
    verifyUserLoginStatius,
    requireSelf,
    TaskController.AddTask
);
TaskRoutes.get(
    "/GetTasks/:userId",
    verifyUserLoginStatius,
    requireSelf,
    TaskController.GetTasks
);
TaskRoutes.put(
    "/UpdateTask/:userId",
    verifyUserLoginStatius,
    requireSelf,
    TaskController.UpdateTask
);
TaskRoutes.delete(
    "/DeleteTask/:TaskId",
    verifyUserLoginStatius,
    TaskController.DeleteTask
);



export default TaskRoutes;
