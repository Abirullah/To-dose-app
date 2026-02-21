import AIChatHistory from "../Modells/AI chating history.js";
import User from "../Modells/UserModle.js";
import axios from "axios";
import { config } from "dotenv";

config();

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
          Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

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
        AiReplayContant: response.data.message.content[0].text,
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
                AiReplayContant: response.data.message.content[0].text,
              },
            ],
          },
        ],
      });
    }

    return res.json({
      reply: response.data.message.content[0].text,
    });

  } catch (error) {
    console.log("Cohere API Error:", error.response?.data || error.message);
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
  


