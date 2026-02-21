import AIChatHistory from "../Modells/AI chating history.js";
import User from "../Modells/UserModle.js";
import axios from "axios";
import { config } from "dotenv";

config();

const AI_PROVIDER =
  (process.env.AI_PROVIDER || "local").trim().toLowerCase() || "local";

const buildLocalReply = (message) => {
  const cleaned = String(message || "").trim();
  if (!cleaned) {
    return "Please share what you need help with.";
  }

  return [
    "Local AI mode is enabled, so this response is generated offline-friendly.",
    "",
    `You said: "${cleaned}"`,
    "",
    "Suggested next steps:",
    "1. Define the exact task outcome in one sentence.",
    "2. Break it into 3 small actions you can finish today.",
    "3. Pick the first action and start now.",
  ].join("\n");
};

const getAiReply = async (message) => {
  if (AI_PROVIDER === "cohere") {
    const cohereApiKey = (process.env.COHERE_API_KEY || "").trim();
    if (!cohereApiKey) {
      throw new Error("COHERE_API_KEY is missing while AI_PROVIDER=cohere.");
    }

    const response = await axios.post(
      "https://api.cohere.com/v2/chat",
      {
        model: "command-a-03-2025",
        messages: [
          {
            role: "user",
            content: [{ type: "text", text: message }],
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${cohereApiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const reply = response?.data?.message?.content?.[0]?.text;
    if (!reply) {
      throw new Error("Cohere returned an empty reply.");
    }
    return reply;
  }

  return buildLocalReply(message);
};

const AiFeature = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { message } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!message || message.trim() === "") {
      return res.status(400).json({ error: "Message is required" });
    }
    const aiReply = await getAiReply(message);

    const UserChatHeastory = await AIChatHistory.findOne({ userId });

    const today = `${new Date().getDate()}/${new Date().getMonth() + 1}`;

    // If history already exists
    if (UserChatHeastory) {
      // Get the last saved day entry
      let lastDay =
        UserChatHeastory.messages[UserChatHeastory.messages.length - 1];

      // If no day exists OR day has changed → create new day array
      if (!lastDay || lastDay.timestamp !== today) {
        UserChatHeastory.messages.push({
          timestamp: today,
          chats: [],
        });

        // Update lastDay to new entry
        lastDay =
          UserChatHeastory.messages[UserChatHeastory.messages.length - 1];
      }

      // Push today's chat message
      lastDay.chats.push({
        UserMessageContant: message,
        AiReplayContant: aiReply,
      });

      await UserChatHeastory.save();
    }

    // If NO history exists → create new one
    else {
      await AIChatHistory.create({
        userId,
        messages: [
          {
            timestamp: today,
            chats: [
              {
                UserMessageContant: message,
                AiReplayContant: aiReply,
              },
            ],
          },
        ],
      });
    }

    return res.json({
      reply: aiReply,
    });

  } catch (error) {
    console.log("AI service error:", error.response?.data || error.message);
    res.status(500).json({
      error: "AI service failed.",
      details: error.response?.data || error.message,
    });
  }
};

const GetAIChatHistory = async (req, res) => {
  try {
    const userId = req.params.userId;
    const userHistory = await AIChatHistory.findOne({ userId });

    if (!userHistory) {
      return res
        .status(404)
        .json({ message: "No chat history found for this user." });
    }
    res.json({ history: userHistory });
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve chat history." });
  }
};

export { AiFeature, GetAIChatHistory };
  

