import express from "express";
import multer from "multer";
import os from "os";
import path from "path";
import { verifyUserLoginStatius } from "../Utils/VerifyUser.js";
import {
  createTeamTask,
  deleteTaskByOwner,
  listAssignedToMe,
  listTeamTasks,
  submitTask,
  updateTaskByOwner,
} from "../Controller/TeamAssignedTaskController.js";

const uploadDir = path.join(os.tmpdir(), "uploads");

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const TeamAssignedTaskRoutes = express.Router({ mergeParams: true });

TeamAssignedTaskRoutes.post(
  "/team/:teamId",
  verifyUserLoginStatius,
  upload.single("file"),
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
  upload.single("file"),
  updateTaskByOwner
);

TeamAssignedTaskRoutes.delete(
  "/:taskId",
  verifyUserLoginStatius,
  deleteTaskByOwner
);

export default TeamAssignedTaskRoutes;
