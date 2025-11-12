import React from "react";
import ReactMarkdown from "react-markdown";
import AiSvg from '../../assets/ChatSvg.svg'
import { useState } from "react";

function AiFeatures() {
  const [isOpen, setIsOpen] = useState(false);
  const [mouseOver, setMouseOver] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([
    { from: "ai", text: "Hi, how can I help you today?" },
  ]);
  const [loading, setLoading] = useState(false);

  const userId = localStorage.getItem("userId");

  const askAI = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setMessages((prev) => [...prev, { from: "user", text: inputValue }]);
    const userMessage = inputValue;
    setInputValue("");
    setLoading(true);

    try {
      const response = await fetch(`http://localhost:5000/users/chat/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer 9b2df06c568547adb57389ae3233c454`,
        },
        body: JSON.stringify({ message: userMessage  } , 31),
      });

      if (!response.ok) throw new Error("Network error" , 34);
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




  return (
    <>
     
      <div
        className="fixed right-10 bottom-7 cursor-pointer text-white z-50"
        onMouseEnter={() => setMouseOver(true)}
        onMouseLeave={() => setMouseOver(false)}
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 200 200"
          fill="none"
          className={`w-16 h-16 stroke-black fill-black transition-all duration-300 ${
            mouseOver ? "stroke-blue-500" : ""
          } hover:fill-blue-500 hover:drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]`}
        >
          <rect
            x="30"
            y="30"
            width="140"
            height="140"
            rx="25"
            strokeWidth="12"
            className="transition-colors duration-300"
          />
          {isOpen ? (
           
            <path
              d="M60 60 L140 140 M140 60 L60 140"
              stroke="white"
              strokeWidth="12"
              strokeLinecap="round"
              className="transition-colors duration-300"
            />
          ) : (
             
            <text
              x="100"
                y="125"
              textAnchor="middle"
              fontSize="80"
                fill="white"
                fontFamily="Arial, sans-serif"
            >AI</text>
            
          )}

          <g transform="translate(140,45)">
            <path
              d="M10 0 L13 7 L20 10 L13 13 L10 20 L7 13 L0 10 L7 7 Z"
              className="transition-colors duration-300"
            />
            <path
              d="M25 10 L27 14 L32 16 L27 18 L25 22 L23 18 L18 16 L23 14 Z"
              className="fill-gray-500 transition-colors duration-300 hover:fill-blue-400"
            />
          </g>
        </svg>
      </div>

      
      {isOpen && (
        <div className="fixed top-20 left-70 shadow-2xl shadow-black  mr-4 bg-white p-6 rounded-lg border border-gray-300 w-[1000px] h-[600px] flex flex-col transition-all z-100">
          {/* Header */}
          <div className="flex flex-col space-y-1.5 pb-4 border-b justify-items-center items-center">
            <h2 className="font-bold text-lg tracking-tight">Chat Bot For Task Master</h2>
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
      )}
    </>
  );
}

export default AiFeatures;

