import express from "express";
import multer from "multer";
import { verifyUserLoginStatius } from "../Utils/VerifyUser.js";
import {
  createTeamTask,
  deleteTaskByOwner,
  listAssignedToMe,
  listTeamTasks,
  submitTask,
  updateTaskByOwner,
} from "../Controller/TeamAssignedTaskController.js";

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 },
});

const TeamAssignedTaskRoutes = express.Router({ mergeParams: true });

TeamAssignedTaskRoutes.post(
  "/team/:teamId",
  verifyUserLoginStatius,
  createTeamTask
);
TeamAssignedTaskRoutes.get(
  "/team/:teamId",
  verifyUserLoginStatius,
  listTeamTasks
);
TeamAssignedTaskRoutes.get(
  "/assigned-to-me",
  verifyUserLoginStatius,
  listAssignedToMe
);

TeamAssignedTaskRoutes.post(
  "/:taskId/submit",
  verifyUserLoginStatius,
  upload.single("file"),
  submitTask
);

TeamAssignedTaskRoutes.patch(
  "/:taskId",
  verifyUserLoginStatius,
  updateTaskByOwner
);

TeamAssignedTaskRoutes.delete(
  "/:taskId",
  verifyUserLoginStatius,
  deleteTaskByOwner
);

export default TeamAssignedTaskRoutes;

