import express from "express";
import { verifyUserLoginStatius } from "../Utils/VerifyUser.js";
import {
  addMemberByEmail,
  createTeam,
  deleteTeam,
  decideJoinRequest,
  getMyTeams,
  getTeamDetails,
  requestToJoin,
  searchTeams,
} from "../Controller/TeamController.js";

const TeamRoutes = express.Router({ mergeParams: true });

TeamRoutes.post("/", verifyUserLoginStatius, createTeam);
TeamRoutes.get("/mine", verifyUserLoginStatius, getMyTeams);
TeamRoutes.get("/search", verifyUserLoginStatius, searchTeams);
TeamRoutes.get("/:teamId", verifyUserLoginStatius, getTeamDetails);
TeamRoutes.delete("/:teamId", verifyUserLoginStatius, deleteTeam);

TeamRoutes.post("/:teamId/join-requests", verifyUserLoginStatius, requestToJoin);
TeamRoutes.patch(
  "/:teamId/join-requests/:requestId",
  verifyUserLoginStatius,
  decideJoinRequest
);

TeamRoutes.post("/:teamId/members", verifyUserLoginStatius, addMemberByEmail);

export default TeamRoutes;
