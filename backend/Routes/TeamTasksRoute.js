import express from "express";
import {
  AddTask,
  updateUsersInTask,
    getTeamTaskDetails,
    DeleteTask,
  TaskReplay
} from "../Controller/TeamTaskController.js";
import { verifyUserLoginStatius } from "../Utils/VerifyUser.js";

const TeamTasks = express.Router({ mergeParams: true });


TeamTasks.post(
    "/AddTasks/:userId",
    verifyUserLoginStatius,
    AddTask
);
TeamTasks.post(
    "/UpdateTaskUsers/:id",
    verifyUserLoginStatius,
    updateUsersInTask
)

TeamTasks.get(
    '/getTeamTaskDetails/:userId',
    verifyUserLoginStatius,
    getTeamTaskDetails
)

TeamTasks.delete(
    "/DeleteTask/:userId",
    verifyUserLoginStatius,
    DeleteTask)

TeamTasks.post(
    '/TaskReplay/:userId', verifyUserLoginStatius,
    TaskReplay
)

export default TeamTasks;
