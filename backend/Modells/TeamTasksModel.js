import mongoose from "mongoose";

const TeamTaskSchema = new mongoose.Schema(
  {

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    Team: [
      {
        memberEmail: {
          type: String,
          required: true,
        },
        memberId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        TaskStatus: {
          type: String,
          default : "Pending"
          
        }
      },
    ],

    Tasks: [
      {
        taskTitle: {
          type: String,
          required: true,
        },
        taskDescription: {
          type: String,
          required: true,
        },
        status: {
          type: String,
          enum: ["pending", "in-progress", "completed"],
          default: "pending",
        },
        assignedTo: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        deadline: {
          type: Date,
        },
        completedAt: {
          type: Date,
        },
      },
    ],
  },
  { timestamps: true }
);

const TeamTaskModel = mongoose.model("TeamTask", TeamTaskSchema);

export default TeamTaskModel;
