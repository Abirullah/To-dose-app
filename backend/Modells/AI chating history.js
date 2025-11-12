import moongose from "mongoose";
const AIChatHistorySchema = new moongose.Schema(
  {
        userId: {
          type: moongose.Schema.Types.ObjectId,
          ref: "User",
          required: true
        },
        messages: [
            {
                role: { type: String, enum: ['user', 'assistant'], required: true },
                content: { type: String, required: true },
                timestamp: { type: Date, default: Date.now }
            }
        ]
  },
  { timestamps: true }
);

const AIChatHistoryModel = moongose.model("AIChatHistory", AIChatHistorySchema);

export default AIChatHistoryModel;