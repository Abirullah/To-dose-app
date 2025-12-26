import React, { useEffect , useRef } from "react";
import ReactMarkdown from "react-markdown";
import AiSvg from "../../assets/ChatSvg.svg";
import { useState } from "react";

function AiFeatures() {
  const [loading, setLoading] = useState(false);
  const [UserPointText, setUserPointText] = useState(null);
  const bottomRef = useRef(null);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState();
  const [chatEachDayHistory, setchatEachDayHistory] = useState([]);

  const userId = localStorage.getItem("userId");
  const UserAuthToken = localStorage.getItem("authToken");
  

  let userMessage = "";

  const FeatchUserAIHistory = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/users/get-chats/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${UserAuthToken}`,
          },
        }
      );

       if (response.status === 401 || response.status === 403) {
         localStorage.removeItem("authToken");
         localStorage.removeItem("userId");
         window.location.href = "/AccountLogin";
         return;
       }
      const data = await response.json();
      setMessages(data);
      const MessagesArray = data.history.messages;
      setchatEachDayHistory(MessagesArray);

      const today = new Date();

      const TodayHistory = MessagesArray.filter((msg) => {
        const msgDate = msg.timestamp;

        return msgDate == `${today.getDate()}/${today.getMonth() + 1}`;
      });

      TodayHistory > 0 ? setMessages(TodayHistory[0].chats) : setMessages([]);
    } catch (error) {
      console.error("Error fetching AI chat history:", error);
    }
  };

  const askAI = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    userMessage = inputValue;
    setUserPointText(
      <div className="flex gap-3 my-4 text-gray-700 text-sm justify-end">
        <div className="bg-gray-100 px-3 py-2 rounded-lg max-w-[75%] leading-relaxed">
          <ReactMarkdown>{userMessage}</ReactMarkdown>
        </div>
        <div className="rounded-full bg-gray-100 border p-1 w-8 h-8 flex items-center justify-center">
          <span className="text-black font-bold text-xs">You</span>
        </div>
      </div>
    );
    setInputValue("");
    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:5000/users/chat/${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${UserAuthToken}`,
          },
          body: JSON.stringify({ message: userMessage }, 31),
        }
      );

      if (!response.ok) throw new Error("Network error", 34);
      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          AiReplayContant: data.reply || "No response from AI.",
          UserMessageContant: userMessage,
        },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          AiReplayContant: "Something went wrong, please try again.",
          UserMessageContant: userMessage,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  function AddThatTask(date) {
    const GetSoecificDayHistory = chatEachDayHistory.filter((msg) => {
      return msg.timestamp === date;
    });

    setMessages(GetSoecificDayHistory[0].chats);
  }
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  useEffect(() => {
    FeatchUserAIHistory();
  }, []);

  useEffect(() => {
    localStorage.setItem("AiChatHistory", JSON.stringify(messages));
  }, [messages]);

  localStorage.setItem("AiChatHistory", JSON.stringify(messages));

  return (
    <div className="flex w-full h-full justify-center items-center p-6">
      <div className="shadow-2xl flex flex-col justify-self-center align-middle shadow-black bg-white p-6 rounded-lg border border-gray-300 w-[15%] h-[90%]  mr-5 ">
        <h1 className="text-2xl font-bold text-center">Your Chat</h1>
        <ul className="text-black flex flex-col mt-4">
          {chatEachDayHistory.length > 0 ? (
            chatEachDayHistory.map((Element) => (
              <li
                onClick={() => AddThatTask(Element.timestamp)}
                key={Element.id || Element.timestamp}
                className=" p-2 hover:bg-blue-100 text-center font-bold hover:scale-115 cursor-pointer pr-4"
              >
                {Element.timestamp}
              </li>
            ))
          ) : (
            <p className="">No history</p>
          )}
        </ul>
      </div>
      <div className="shadow-2xl flex justify-self-center align-middle shadow-black bg-white p-6 rounded-lg border border-gray-300 w-[80%] h-[82%] flex-col transition-all z-100">
        {/* Header */}
        <div className="flex flex-col space-y-1.5 pb-4 border-b justify-items-center items-center">
          <h2 className="font-bold text-lg tracking-tight">
            Chat Bot For Task Master
          </h2>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto pr-2 mt-4">
          {messages && messages.length > 0 ? (
            messages.map((item, idx) => (
              <div key={item._id || idx}>
                {/* USER MESSAGE */}
                {item.UserMessageContant && (
                  <div className="flex gap-3 my-4 text-gray-700 text-sm justify-end">
                    <div className="bg-gray-100 px-3 py-2 rounded-lg max-w-[75%] leading-relaxed">
                      <ReactMarkdown>{item.UserMessageContant}</ReactMarkdown>
                    </div>
                    <div className="rounded-full bg-gray-100 border p-1 w-8 h-8 flex items-center justify-center">
                      <span className="text-black font-bold text-xs">You</span>
                    </div>
                  </div>
                )}

                {/* AI MESSAGE */}
                {item.AiReplayContant && (
                  <div className="flex gap-3 my-4 text-gray-700 text-sm">
                    <div className="rounded-full bg-gray-100 border p-1 w-8 h-8 flex items-center justify-center">
                      <span className="text-black font-bold text-xs">AI</span>
                    </div>
                    <div className="bg-gray-100 px-3 py-2 rounded-lg max-w-[75%] leading-relaxed">
                      <ReactMarkdown>{item.AiReplayContant}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-blue-950 font-bold text-3xl  text-center w-auto">
                Hello, how can I assist you?
              </p>
            </div>
          )}

          {loading && (
            <div>
              {UserPointText}
              <p className="text-gray-400 text-sm italic">Thinking...</p>
            </div>
          )}
          <div ref={bottomRef} />
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
