import Team from "../Modells/TeamModel.js";
import User from "../Modells/UserModle.js";
import TeamAssignedTask from "../Modells/TeamAssignedTaskModel.js";
import uploadToCloudinary from "../Utils/Cloudnary.js";
import fs from "fs";
import { sendEmail } from "../Utils/sendEmail.js";

const toDate = (value) => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const [y, m, d] = trimmed.split("-").map(Number);
      return new Date(y, m - 1, d, 23, 59, 59, 999);
    }
  }
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

const requireFutureDate = (value, label) => {
  const d = toDate(value);
  if (!d) return { ok: false, error: `${label} is invalid` };
  if (d.getTime() <= Date.now())
    return { ok: false, error: `${label} must be in the future` };
  return { ok: true, date: d };
};

const getTodayRange = () => {
  const now = new Date();
  const start = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
    0
  );
  const end = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999
  );
  return { start, end };
};

const sendDueTodayReminderForAssignedTasks = async (userId, teamId = null) => {
  const { start, end } = getTodayRange();

  const query = {
    assignedTo: userId,
    status: { $in: ["assigned", "submitted"] },
    deadline: { $gte: start, $lte: end },
    $or: [
      { deadlineReminderSentAt: { $exists: false } },
      { deadlineReminderSentAt: null },
      { deadlineReminderSentAt: { $lt: start } },
      { deadlineReminderSentAt: { $gt: end } },
    ],
  };

  if (teamId) query.team = teamId;

  const tasks = await TeamAssignedTask.find(query).populate("team", "name");
  if (!tasks.length) return;

  const user = await User.findById(userId).select("name email");
  if (!user?.email) return;

  const items = tasks
    .map(
      (task) =>
        `<li><b>${task.title}</b> (${task.team?.name || "Team task"}) - due ${new Date(
          task.deadline
        ).toLocaleString()}</li>`
    )
    .join("");

  await sendEmail({
    to: user.email,
    subject: "Reminder: Team task deadlines today",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h3>Hello ${user.name || "there"},</h3>
        <p>You have team tasks due today and not completed yet:</p>
        <ul>${items}</ul>
        <p>Please submit or complete them today.</p>
      </div>
    `,
  });

  await TeamAssignedTask.updateMany(
    { _id: { $in: tasks.map((task) => task._id) } },
    { $set: { deadlineReminderSentAt: new Date() } }
  );
};

export const createTeamTask = async (req, res) => {
  try {
    const teamId = req.params.teamId;
    const { title, description, deadline, assignedToEmail, assignedToUserId } =
      req.body;

    if (!title || !String(title).trim()) {
      return res.status(400).json({ error: "Task title is required" });
    }

    const deadlineCheck = requireFutureDate(deadline, "Deadline");
    if (!deadlineCheck.ok) {
      return res.status(400).json({ error: deadlineCheck.error });
    }

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ error: "Team not found" });

    if (team.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Only the owner can assign tasks" });
    }

    let assignedUser = null;
    if (assignedToUserId) {
      assignedUser = await User.findById(assignedToUserId);
    } else if (assignedToEmail) {
      assignedUser = await User.findOne({
        email: String(assignedToEmail).trim().toLowerCase(),
      });
    } else {
      return res
        .status(400)
        .json({ error: "assignedToEmail or assignedToUserId is required" });
    }

    if (!assignedUser) {
      return res.status(404).json({ error: "Assigned user not found" });
    }
    if (!assignedUser.verified) {
      return res.status(403).json({ error: "Assigned user is not verified" });
    }

    const isMember = team.members.some(
      (m) => m.user.toString() === assignedUser._id.toString()
    );
    if (!isMember) {
      return res
        .status(400)
        .json({ error: "User is not a member of this team" });
    }

    let taskFileUrl = "";
    if (req.file) {
      if (req.file.mimetype !== "application/pdf") {
        try {
          fs.unlinkSync(req.file.path);
        } catch {
          // ignore
        }
        return res.status(400).json({ error: "Only PDF uploads are allowed" });
      }
      taskFileUrl = await uploadToCloudinary(req.file.path, {
        folder: "ToDosApp/team-task-files",
        resource_type: "raw",
      });
    }

    const task = await TeamAssignedTask.create({
      team: team._id,
      createdBy: req.user._id,
      assignedTo: assignedUser._id,
      title: String(title).trim(),
      description: String(description ?? "").trim(),
      taskFileUrl,
      deadline: deadlineCheck.date,
    });

    return res.status(201).json({ task });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const listTeamTasks = async (req, res) => {
  try {
    const teamId = req.params.teamId;
    const userId = req.user._id.toString();

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ error: "Team not found" });

    const isMember = team.members.some((m) => m.user.toString() === userId);
    if (!isMember) return res.status(403).json({ error: "Not a team member" });

    await TeamAssignedTask.updateMany(
      { team: teamId, status: "assigned", deadline: { $lt: new Date() } },
      { $set: { status: "missed" } }
    );

    const isOwner = team.owner.toString() === userId;

    const query = isOwner
      ? { team: teamId }
      : { team: teamId, assignedTo: req.user._id };

    const tasks = await TeamAssignedTask.find(query)
      .populate("assignedTo", "name email avatarUrl")
      .populate("createdBy", "name email avatarUrl")
      .sort({ createdAt: -1 });

    if (!isOwner) {
      sendDueTodayReminderForAssignedTasks(req.user._id, teamId).catch((error) => {
        console.error("Team task reminder failed:", error.message);
      });
    }

    return res.status(200).json({ tasks });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const listAssignedToMe = async (req, res) => {
  try {
    const userId = req.user._id;

    await TeamAssignedTask.updateMany(
      { assignedTo: userId, status: "assigned", deadline: { $lt: new Date() } },
      { $set: { status: "missed" } }
    );

    const tasks = await TeamAssignedTask.find({ assignedTo: userId })
      .populate({
        path: "team",
        select: "name slug owner",
        populate: { path: "owner", select: "name email avatarUrl" },
      })
      .populate("createdBy", "name email avatarUrl")
      .sort({ createdAt: -1 });

    sendDueTodayReminderForAssignedTasks(userId).catch((error) => {
      console.error("Assigned task reminder failed:", error.message);
    });

    return res.status(200).json({ tasks });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const submitTask = async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const submissionText = String(
      req.body?.submissionText ?? req.body?.text ?? ""
    ).trim();

    const task = await TeamAssignedTask.findById(taskId);
    if (!task) return res.status(404).json({ error: "Task not found" });

    if (task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Not allowed to submit this task" });
    }

    let fileUrl = "";
    if (req.file) {
      if (req.file.mimetype !== "application/pdf") {
        try {
          fs.unlinkSync(req.file.path);
        } catch {
          // ignore
        }
        return res.status(400).json({ error: "Only PDF uploads are allowed" });
      }
      fileUrl = await uploadToCloudinary(req.file.path, {
        folder: "ToDosApp/submissions",
        resource_type: "raw",
      });
    }

    if (!submissionText && !fileUrl) {
      return res.status(400).json({ error: "Text or PDF submission required" });
    }

    task.submission = {
      text: submissionText || task.submission?.text || "",
      fileUrl: fileUrl || task.submission?.fileUrl || "",
      submittedAt: new Date(),
    };
    task.status = "submitted";

    await task.save();

    return res.status(200).json({ message: "Submitted", task });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateTaskByOwner = async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const { title, description, deadline, assignedToEmail, assignedToUserId } =
      req.body;

    const task = await TeamAssignedTask.findById(taskId);
    if (!task) return res.status(404).json({ error: "Task not found" });

    const team = await Team.findById(task.team);
    if (!team) return res.status(404).json({ error: "Team not found" });

    if (team.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Only owner can edit tasks" });
    }

    if (title !== undefined) {
      if (!String(title).trim()) {
        return res.status(400).json({ error: "Title cannot be empty" });
      }
      task.title = String(title).trim();
    }

    if (description !== undefined) {
      task.description = String(description ?? "").trim();
    }

    if (deadline !== undefined) {
      const deadlineCheck = requireFutureDate(deadline, "Deadline");
      if (!deadlineCheck.ok) {
        return res.status(400).json({ error: deadlineCheck.error });
      }
      task.deadline = deadlineCheck.date;
      task.deadlineReminderSentAt = undefined;
      if (task.status === "missed") task.status = "assigned";
    }

    if (assignedToEmail || assignedToUserId) {
      let assignedUser = null;
      if (assignedToUserId) assignedUser = await User.findById(assignedToUserId);
      else {
        assignedUser = await User.findOne({
          email: String(assignedToEmail).trim().toLowerCase(),
        });
      }
      if (!assignedUser) {
        return res.status(404).json({ error: "Assigned user not found" });
      }
      const isMember = team.members.some(
        (m) => m.user.toString() === assignedUser._id.toString()
      );
      if (!isMember) {
        return res
          .status(400)
          .json({ error: "User is not a member of this team" });
      }
      task.assignedTo = assignedUser._id;
    }

    if (req.file) {
      if (req.file.mimetype !== "application/pdf") {
        try {
          fs.unlinkSync(req.file.path);
        } catch {
          // ignore
        }
        return res.status(400).json({ error: "Only PDF uploads are allowed" });
      }
      task.taskFileUrl = await uploadToCloudinary(req.file.path, {
        folder: "ToDosApp/team-task-files",
        resource_type: "raw",
      });
    }

    await task.save();

    return res.status(200).json({ message: "Task updated", task });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteTaskByOwner = async (req, res) => {
  try {
    const taskId = req.params.taskId;

    const task = await TeamAssignedTask.findById(taskId);
    if (!task) return res.status(404).json({ error: "Task not found" });

    const team = await Team.findById(task.team);
    if (!team) return res.status(404).json({ error: "Team not found" });

    if (team.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Only owner can delete tasks" });
    }

    await TeamAssignedTask.deleteOne({ _id: taskId });

    return res.status(200).json({ message: "Task deleted" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
