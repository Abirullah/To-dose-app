import Team from "../Modells/TeamModel.js";
import User from "../Modells/UserModle.js";
import { makeSlug } from "../Utils/slug.js";

const escapeRegex = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

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

    team.members.push({ user: user._id, role: "member" });
    team.joinRequests = team.joinRequests.filter(
      (r) => r.user.toString() !== user._id.toString()
    );
    await team.save();

    return res.status(201).json({ message: "Member added successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
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
