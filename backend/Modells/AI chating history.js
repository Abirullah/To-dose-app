import mongoose from "mongoose";

const SingleChatSchema = new mongoose.Schema({
  UserMessageContant: { type: String, required: true },
  AiReplayContant: { type: String, required: true },
});

const DailyMessagesSchema = new mongoose.Schema({
  timestamp: { type: String, required: true },
  chats: {
    type: [SingleChatSchema],
    default: [],
  },
});

const AIChatHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  messages: {
    type: [DailyMessagesSchema],
    default: [],
  },
});

export default mongoose.model("AIChatHistory", AIChatHistorySchema);
