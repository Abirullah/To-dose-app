import mongoose from "mongoose";

const SubmissionSchema = new mongoose.Schema(
  {
    text: { type: String, default: "" },
    fileUrl: { type: String, default: "" },
    submittedAt: { type: Date },
  },
  { _id: false }
);

const TeamAssignedTaskSchema = new mongoose.Schema(
  {
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    taskFileUrl: {
      type: String,
      default: "",
    },
    deadline: {
      type: Date,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["assigned", "submitted", "completed", "missed"],
      default: "assigned",
      index: true,
    },
    deadlineReminderSentAt: {
      type: Date,
    },
    submission: {
      type: SubmissionSchema,
      default: () => ({}),
    },
  },
  { timestamps: true }
);

const TeamAssignedTaskModel = mongoose.model(
  "TeamAssignedTask",
  TeamAssignedTaskSchema
);

export default TeamAssignedTaskModel;
