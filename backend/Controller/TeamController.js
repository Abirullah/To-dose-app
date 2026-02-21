import Team from "../Modells/TeamModel.js";
import User from "../Modells/UserModle.js";
import { makeSlug } from "../Utils/slug.js";
import TeamAssignedTask from "../Modells/TeamAssignedTaskModel.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../Utils/sendEmail.js";

const escapeRegex = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const INVITE_TOKEN_SECRET =
  process.env.INVITE_TOKEN_SECRET ||
  process.env.JWT_SECRET_KEY ||
  process.env.SECRET_KEY ||
  "";
const INVITE_EXPIRES_IN = process.env.TEAM_INVITE_EXPIRES_IN || "7d";

const normalizeBaseUrl = (value = "") =>
  String(value).trim().replace(/\/+$/, "");

const getBackendBaseUrl = (req) => {
  const explicit = normalizeBaseUrl(process.env.BACKEND_BASE_URL);
  if (explicit) return explicit;
  const host = req.get("x-forwarded-host") || req.get("host") || "localhost:5000";
  const protocol = req.get("x-forwarded-proto") || req.protocol || "http";
  return `${protocol}://${host}`;
};

const getFrontendBaseUrl = (req) => {
  const explicit = normalizeBaseUrl(process.env.FRONTEND_URL);
  if (explicit) return explicit;
  const requestOrigin = normalizeBaseUrl(req.get("origin"));
  if (requestOrigin) return requestOrigin;
  return "https://abirafriditaskmaster.vercel.app";
};

const getInviteExpiryDateFromToken = (token) => {
  const decoded = jwt.decode(token);
  if (decoded?.exp) return new Date(decoded.exp * 1000);
  return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
};

const buildFrontendInviteRedirectUrl = (req, teamId, status, reason = "") => {
  const frontendBaseUrl = getFrontendBaseUrl(req);
  const target = teamId
    ? `${frontendBaseUrl}/dishboard/teams/${teamId}`
    : `${frontendBaseUrl}/dishboard/teams`;
  const url = new URL(target);
  url.searchParams.set("invite", status);
  if (reason) url.searchParams.set("reason", reason);
  return url.toString();
};

const respondInviteResult = (req, res, payload) => {
  const { teamId, status, reason = "", httpStatus = 200, message = "" } = payload;
  if (req.method === "GET") {
    return res.redirect(
      302,
      buildFrontendInviteRedirectUrl(req, teamId, status, reason)
    );
  }
  if (message) return res.status(httpStatus).json({ message, status });
  return res.status(httpStatus).json({ error: reason || "Invitation failed", status });
};

export const createTeam = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: "Team name is required" });
    }

    const teamName = String(name).trim();

    let createdTeam = null;
    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        createdTeam = await Team.create({
          name: teamName,
          slug: makeSlug(teamName),
          owner: req.user._id,
          members: [{ user: req.user._id, role: "owner" }],
        });
        break;
      } catch (error) {
        if (error?.code === 11000) continue;
        throw error;
      }
    }

    if (!createdTeam) {
      return res.status(500).json({ error: "Failed to create team" });
    }

    return res.status(201).json({ team: createdTeam });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getMyTeams = async (req, res) => {
  try {
    const userId = req.user._id;

    const teams = await Team.find({ "members.user": userId })
      .populate("owner", "name email avatarUrl")
      .sort({ createdAt: -1 });

    const shaped = teams.map((t) => ({
      _id: t._id,
      name: t.name,
      slug: t.slug,
      owner: t.owner,
      memberCount: t.members.length,
      myRole: t.owner?._id?.toString() === userId.toString() ? "owner" : "member",
      pendingJoinRequests:
        t.owner?._id?.toString() === userId.toString()
          ? t.joinRequests.filter((r) => r.status === "pending").length
          : 0,
    }));

    return res.status(200).json({ teams: shaped });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const searchTeams = async (req, res) => {
  try {
    const q = String(req.query.q ?? "").trim();
    if (!q) return res.status(200).json({ teams: [] });

    const safe = escapeRegex(q);
    const query = {
      $or: [
        { name: { $regex: safe, $options: "i" } },
        { slug: { $regex: safe, $options: "i" } },
      ],
    };

    const userId = req.user._id.toString();

    const teams = await Team.find(query)
      .populate("owner", "name email avatarUrl")
      .limit(20)
      .sort({ createdAt: -1 });

    const shaped = teams.map((t) => ({
      _id: t._id,
      name: t.name,
      slug: t.slug,
      owner: t.owner,
      memberCount: t.members.length,
      isMember: t.members.some((m) => m.user.toString() === userId),
      hasPendingRequest: t.joinRequests.some(
        (r) => r.user.toString() === userId && r.status === "pending"
      ),
    }));

    return res.status(200).json({ teams: shaped });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getTeamDetails = async (req, res) => {
  try {
    const teamId = req.params.teamId;
    const userId = req.user._id.toString();

    const team = await Team.findOne({ _id: teamId, "members.user": userId })
      .populate("owner", "name email avatarUrl")
      .populate("members.user", "name email avatarUrl")
      .populate("joinRequests.user", "name email avatarUrl");

    if (!team) return res.status(404).json({ error: "Team not found" });

    const isOwner = team.owner?._id?.toString() === userId;

    return res.status(200).json({
      team: {
        _id: team._id,
        name: team.name,
        slug: team.slug,
        owner: team.owner,
        members: team.members,
        joinRequests: isOwner ? team.joinRequests : undefined,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const requestToJoin = async (req, res) => {
  try {
    const teamId = req.params.teamId;
    const userId = req.user._id;

    const { message } = req.body;
    const reqMessage = String(message ?? "").slice(0, 500);

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ error: "Team not found" });

    if (team.members.some((m) => m.user.toString() === userId.toString())) {
      return res.status(409).json({ error: "You are already a member" });
    }

    const existing = team.joinRequests.find(
      (r) => r.user.toString() === userId.toString()
    );

    if (existing?.status === "pending") {
      return res.status(409).json({ error: "Join request already pending" });
    }

    if (existing && existing.status !== "accepted") {
      existing.status = "pending";
      existing.message = reqMessage;
      existing.createdAt = new Date();
      existing.decidedAt = undefined;
    } else if (!existing) {
      team.joinRequests.push({ user: userId, message: reqMessage });
    } else {
      return res.status(409).json({ error: "Already accepted" });
    }

    await team.save();

    return res.status(201).json({ message: "Join request sent" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const addMemberByEmail = async (req, res) => {
  try {
    const teamId = req.params.teamId;
    const { email } = req.body;

    if (!email || !String(email).trim()) {
      return res.status(400).json({ error: "Member email is required" });
    }

    const memberEmail = String(email).trim().toLowerCase();

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ error: "Team not found" });

    if (team.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Only the owner can add members" });
    }

    const user = await User.findOne({ email: memberEmail });
    if (!user) {
      return res.status(404).json({ error: "No account found for this email" });
    }
    if (!user.verified) {
      return res
        .status(403)
        .json({ error: "User exists but is not verified" });
    }

    if (team.members.some((m) => m.user.toString() === user._id.toString())) {
      return res.status(409).json({ error: "User is already a member" });
    }

    if (!INVITE_TOKEN_SECRET) {
      return res.status(500).json({
        error:
          "Invite token secret is not configured. Set INVITE_TOKEN_SECRET (or JWT_SECRET_KEY).",
      });
    }

    const existingPendingInvite = (team.invitations || []).find(
      (inv) =>
        inv.email === memberEmail &&
        inv.status === "pending" &&
        (!inv.expiresAt || inv.expiresAt.getTime() > Date.now())
    );
    if (existingPendingInvite) {
      return res.status(409).json({ error: "Invitation is already pending for this user" });
    }

    for (const inv of team.invitations || []) {
      const sameUser =
        inv.user?.toString?.() === user._id.toString() || inv.email === memberEmail;
      if (sameUser && inv.status === "pending") {
        inv.status = "revoked";
        inv.respondedAt = new Date();
      }
    }

    const invitationToken = jwt.sign(
      {
        type: "team_invitation",
        teamId: team._id.toString(),
        invitedUserId: user._id.toString(),
        invitedEmail: memberEmail,
        ownerId: req.user._id.toString(),
      },
      INVITE_TOKEN_SECRET,
      { expiresIn: INVITE_EXPIRES_IN }
    );

    team.invitations.push({
      email: memberEmail,
      user: user._id,
      invitedBy: req.user._id,
      token: invitationToken,
      expiresAt: getInviteExpiryDateFromToken(invitationToken),
    });
    await team.save();

    const backendBaseUrl = getBackendBaseUrl(req);
    const acceptUrl = `${backendBaseUrl}/teams/invitations/accept?token=${encodeURIComponent(
      invitationToken
    )}`;

    try {
      await sendEmail({
        to: user.email,
        subject: `Invitation to join "${team.name}"`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.5;">
            <h2>Team Invitation</h2>
            <p>${req.user.name || "A team owner"} invited you to join <b>${team.name}</b>.</p>
            <p>Click the button below to accept this invitation:</p>
            <p>
              <a href="${acceptUrl}" style="display:inline-block;padding:10px 16px;background:#0b5fff;color:#fff;text-decoration:none;border-radius:8px;">
                Accept Invitation
              </a>
            </p>
            <p>If you cannot click the button, open this link:</p>
            <p><a href="${acceptUrl}">${acceptUrl}</a></p>
          </div>
        `,
      });
    } catch (mailError) {
      team.invitations = (team.invitations || []).filter(
        (inv) => inv.token !== invitationToken
      );
      await team.save();
      throw mailError;
    }

    return res.status(201).json({ message: "Invitation email sent successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const acceptTeamInvitationByToken = async (req, res) => {
  try {
    if (!INVITE_TOKEN_SECRET) {
      return respondInviteResult(req, res, {
        teamId: "",
        status: "failed",
        reason: "invite_secret_missing",
        httpStatus: 500,
      });
    }

    const token = String(req.query.token || req.body?.token || "").trim();
    if (!token) {
      return respondInviteResult(req, res, {
        teamId: "",
        status: "failed",
        reason: "missing_token",
        httpStatus: 400,
      });
    }

    let payload;
    try {
      payload = jwt.verify(token, INVITE_TOKEN_SECRET);
    } catch {
      return respondInviteResult(req, res, {
        teamId: "",
        status: "failed",
        reason: "invalid_or_expired_token",
        httpStatus: 400,
      });
    }

    if (payload?.type !== "team_invitation" || !payload?.teamId) {
      return respondInviteResult(req, res, {
        teamId: "",
        status: "failed",
        reason: "invalid_invitation_payload",
        httpStatus: 400,
      });
    }

    const team = await Team.findById(payload.teamId);
    if (!team) {
      return respondInviteResult(req, res, {
        teamId: payload.teamId,
        status: "failed",
        reason: "team_not_found",
        httpStatus: 404,
      });
    }

    const invitation = (team.invitations || []).find((inv) => inv.token === token);
    if (!invitation) {
      return respondInviteResult(req, res, {
        teamId: team._id.toString(),
        status: "failed",
        reason: "invitation_not_found",
        httpStatus: 404,
      });
    }

    if (invitation.status === "accepted") {
      return respondInviteResult(req, res, {
        teamId: team._id.toString(),
        status: "accepted",
        message: "Invitation already accepted",
      });
    }

    if (invitation.status !== "pending") {
      return respondInviteResult(req, res, {
        teamId: team._id.toString(),
        status: "failed",
        reason: "invitation_not_pending",
        httpStatus: 409,
      });
    }

    if (invitation.expiresAt && invitation.expiresAt.getTime() <= Date.now()) {
      invitation.status = "expired";
      invitation.respondedAt = new Date();
      await team.save();
      return respondInviteResult(req, res, {
        teamId: team._id.toString(),
        status: "failed",
        reason: "invitation_expired",
        httpStatus: 409,
      });
    }

    const invitedUser =
      (invitation.user
        ? await User.findById(invitation.user)
        : await User.findOne({ email: invitation.email })) || null;

    if (!invitedUser || !invitedUser.verified) {
      return respondInviteResult(req, res, {
        teamId: team._id.toString(),
        status: "failed",
        reason: "invited_user_not_ready",
        httpStatus: 409,
      });
    }

    const alreadyMember = team.members.some(
      (m) => m.user.toString() === invitedUser._id.toString()
    );
    if (!alreadyMember) {
      team.members.push({ user: invitedUser._id, role: "member" });
    }

    invitation.status = "accepted";
    invitation.respondedAt = new Date();
    team.joinRequests = (team.joinRequests || []).filter(
      (request) => request.user.toString() !== invitedUser._id.toString()
    );

    await team.save();

    return respondInviteResult(req, res, {
      teamId: team._id.toString(),
      status: "accepted",
      message: "Invitation accepted",
    });
  } catch (error) {
    return respondInviteResult(req, res, {
      teamId: "",
      status: "failed",
      reason: "server_error",
      httpStatus: 500,
      message: error.message,
    });
  }
};

export const decideJoinRequest = async (req, res) => {
  try {
    const teamId = req.params.teamId;
    const requestId = req.params.requestId;
    const { action } = req.body;

    if (!["accept", "reject"].includes(String(action))) {
      return res.status(400).json({ error: "Invalid action" });
    }

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ error: "Team not found" });

    if (team.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "Only the owner can manage requests" });
    }

    const request = team.joinRequests.id(requestId);
    if (!request) return res.status(404).json({ error: "Request not found" });

    if (request.status !== "pending") {
      return res.status(409).json({ error: "Request already decided" });
    }

    if (action === "accept") {
      const alreadyMember = team.members.some(
        (m) => m.user.toString() === request.user.toString()
      );
      if (!alreadyMember) {
        team.members.push({ user: request.user, role: "member" });
      }
      request.status = "accepted";
      request.decidedAt = new Date();
    } else {
      request.status = "rejected";
      request.decidedAt = new Date();
    }

    await team.save();

    return res.status(200).json({ message: "Request updated" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteTeam = async (req, res) => {
  try {
    const teamId = req.params.teamId;

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ error: "Team not found" });

    if (team.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Only the owner can delete this team" });
    }

    await TeamAssignedTask.deleteMany({ team: teamId });
    await Team.deleteOne({ _id: teamId });

    return res.status(200).json({ message: "Team deleted" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
