import express from "express";
import { verifyUserLoginStatius } from "../Utils/VerifyUser.js";
import TaskController from "../Controller/TaskController.js";

const TaskRoutes = express.Router({ mergeParams: true });

// Task routes

TaskRoutes.post("/AddTask/:userId", TaskController.AddTask);
// TaskRoutes.get("/GetTasks/:userId", TaskController.GetTasks);
// TaskRoutes.put("/UpdateTask/:taskId", TaskController.UpdateTask);
// TaskRoutes.delete("/DeleteTask/:taskId", TaskController.DeleteTask);



export default TaskRoutes;