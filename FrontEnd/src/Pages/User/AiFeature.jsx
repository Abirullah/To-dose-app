import React, { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import AiSvg from "../../assets/ChatSvg.svg";
import { useState } from "react";

function AiFeatures() {
  const [loading, setLoading] = useState(false);
  const userId = localStorage.getItem("userId");
  const messageHistory = localStorage.getItem("AiChatHistory");

  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState(() => {
    return messageHistory
      ? JSON.parse(messageHistory)
      : [{ from: "ai", text: "Hi, how can I help you today?" }];
  });


  const askAI = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setMessages((prev) => [...prev, { from: "user", text: inputValue }]);
    const userMessage = inputValue;
    setInputValue("");
    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:5000/users/chat/${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer 9b2df06c568547adb57389ae3233c454`,
          },
          body: JSON.stringify({ message: userMessage }, 31),
        }
      );

      if (!response.ok) throw new Error("Network error", 34);
      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        { from: "ai", text: data.reply || "No response from AI." },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { from: "ai", text: "Something went wrong, please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const FeatchUserAIHistory = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/users/get-chats/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer 9b2df06c568547adb57389ae3233c454`,
          },
        }
      );
      const data = await response.json();
     
      const PrivousChatHistory =   data.history.messages

      PrivousChatHistory.map((msg) => {
        console.log(msg);
        console.log("date", msg.timestamp);
        console.log("date", msg._id);
        console.log("chatdata", msg.chats);
        
      });
      
    } catch (error) {
      console.error("Error fetching AI chat history:", error);
    }
  };

  useEffect(() => {
    FeatchUserAIHistory();
  }, []);

  useEffect(() => {
    localStorage.setItem("AiChatHistory", JSON.stringify(messages));
  }, [messages]);

  localStorage.setItem("AiChatHistory", JSON.stringify(messages));

  return (
    <div className="flex w-full h-full justify-center items-center p-6">
      <div className="shadow-2xl flex justify-self-center align-middle shadow-black bg-white p-6 rounded-lg border border-gray-300 w-[15%] h-[90%]  mr-5 "></div>
      <div className="shadow-2xl flex justify-self-center align-middle shadow-black bg-white p-6 rounded-lg border border-gray-300 w-[80%] h-[82%] flex-col transition-all z-100">
        {/* Header */}
        <div className="flex flex-col space-y-1.5 pb-4 border-b justify-items-center items-center">
          <h2 className="font-bold text-lg tracking-tight">
            Chat Bot For Task Master
          </h2>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto pr-2 mt-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 my-4 text-gray-700 text-sm ${
                msg.from === "user" ? "justify-end" : ""
              }`}
            >
              {msg.from === "ai" && (
                <div className="rounded-full bg-gray-100 border p-1 w-8 h-8 flex items-center justify-center">
                  <span className="text-black font-bold text-xs">AI</span>
                </div>
              )}
              <div className="bg-gray-100 px-3 py-2 rounded-lg max-w-[75%] leading-relaxed">
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
              {msg.from === "user" && (
                <div className="rounded-full bg-gray-100 border p-1 w-8 h-8 flex items-center justify-center">
                  <span className="text-black font-bold text-xs">You</span>
                </div>
              )}
            </div>
          ))}
          {loading && (
            <p className="text-gray-400 text-sm italic">Thinking...</p>
          )}
        </div>

        {/* Input */}
        <form
          onSubmit={askAI}
          className="flex items-center justify-center w-full space-x-2 border-t pt-4"
        >
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400"
            placeholder="Type your message"
          />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium text-white bg-black hover:bg-gray-800 h-10 px-4 py-2 transition disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default AiFeatures;
