import express from "express";
import AIChatHistoryModel from "../Modells/AI chating history.js";
import User from "../Modells/UserModle.js";
import axios from "axios";
import { config } from "dotenv";

config();

const AiFeature = async (req, res) => {
  try {
   const  userId = req.params.userId;

    const user = await
      User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }


    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are an AI that writes clear, formatted answers using paragraphs and bullet points (no markdown symbols).",
          },
          { role: "user", content: message },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000", 
          "X-Title": "My Chatbot App",
        },
      }
    );

    AIChatHistoryModel.create({
      userId: user._id,
      messages: [
        { role: "user", content: message },
        { role: "assistant", content: response.data.choices[0].message.content },
      ],
    });


    res.json({ reply: response.data.choices[0].message.content });
  } catch (error) {
    console.error("AI API Error:", error.response?.data || error.message);
    res.status(500).json({ error: "AI service failed." });
  }
};


export { AiFeature };
