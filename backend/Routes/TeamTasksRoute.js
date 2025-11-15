import express from "express";
import {
  AddTask,
  UpdateTasks,
  updateUsersInTask,
  getTeamTaskDetails,
  DeleteTask,
  TaskSubmission
} from "../Controller/TeamTaskController.js";
import { verifyUserLoginStatius } from "../Utils/VerifyUser.js";

import multer from "multer";

const upload = multer({ dest: "ToDosApp/" });

const TeamTasks = express.Router({ mergeParams: true });


TeamTasks.post(
    "/AddTasks/:userId",
    verifyUserLoginStatius,
    AddTask
);

TeamTasks.post(
    '/UpdateTask/:id',
    verifyUserLoginStatius,
    UpdateTasks

)

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
    "/TaskSubmission/:userId",
    verifyUserLoginStatius,
    upload.single("file"),
  TaskSubmission
);

export default TeamTasks;
