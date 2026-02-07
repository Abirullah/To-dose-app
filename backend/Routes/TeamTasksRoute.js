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
import { requireSelf } from "../MiddleWears/RequireSelf.js";

import multer from "multer";

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 },
});

const TeamTasks = express.Router({ mergeParams: true });


TeamTasks.post(
    "/AddTasks/:userId",
    verifyUserLoginStatius,
    requireSelf,
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
    requireSelf,
    getTeamTaskDetails
)

TeamTasks.delete(
    "/DeleteTask/:userId",
    verifyUserLoginStatius,
    requireSelf,
    DeleteTask)

TeamTasks.post(
    "/TaskSubmission/:userId",
    verifyUserLoginStatius,
    requireSelf,
    upload.single("file"),
  TaskSubmission
);

export default TeamTasks;
