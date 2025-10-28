import { config } from "dotenv";
import OpenAI from "openai";

config();

const apiKey = process.env.OPENAI_API_KEY.trim();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY.trim(),
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3000",
    "X-Title": "My Chatbot App",
  },
});

console.log("Loaded API key:", apiKey ? "Yes" : "No");

const AiFeature = async (req, res) => {
  try {
    // Optional: Check Authorization header matches your expected token
    // Example:
    const authHeader = req.headers.authorization || "";
    const expectedToken = "9b2df06c568547adb57389ae3233c454"; // match frontend token
    if (
      !authHeader.startsWith("Bearer ") ||
      authHeader.slice(7) !== expectedToken
    ) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // make sure this model is available on your account
      messages: [
        {
          role: "system",
          content:
            "You are an AI that writes clear, well-formatted answers using proper paragraphs, headings, and bullet points (no markdown symbols like ** or #).",
        },
        { role: "user", content: message },
      ],
    });

    res.json({ reply: completion.choices[0].message.content });
  } catch (error) {
    console.error("AI API Error:", error);
    res.status(500).json({ error: "AI service failed." });
  }
};

export { AiFeature };
