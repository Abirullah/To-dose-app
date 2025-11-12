import mongoose from "mongoose";

const UserWorksSchema = new mongoose.Schema(
  {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        workTitle: {
            type: String,
            required: true
        },
        workDescription: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        worksComletionTime: {
            type: Date,
        },
        worksStatus: {
            type: String,
            enum: ['pending', 'in-progress', 'completed'],
            default: 'pending'
        }
  },
  { timestamps: true }
);
const UserWorksModel = mongoose.model("UserWorks", UserWorksSchema);

export default UserWorksModel;