import mongoose from "mongoose";


const WorkDetails = new mongoose.Schema({
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
            required : true
        },
        worksStatus: {
            type: String,
            enum: ['pending', 'in-progress', 'completed', 'missed'],
            default: 'pending'
    },
        deadlineReminderSentAt: {
            type: Date
        }
});

const UserWorksSchema = new mongoose.Schema(
  {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
      WorkCollection: [WorkDetails]
       
  },
  { timestamps: true }
);
const UserWorksModel = mongoose.model("UserWorks", UserWorksSchema);

export default UserWorksModel;
