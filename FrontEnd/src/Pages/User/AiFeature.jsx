import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import api from "../../lib/api";

const GlassCard = ({ children, className = "" }) => (
  <div className={`rounded-2xl bg-white/5 ring-1 ring-white/10 backdrop-blur-xl ${className}`}>
    {children}
  </div>
);

export default function AiFeatures() {
  const userId = localStorage.getItem("userId");

  const bottomRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [days, setDays] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [messages, setMessages] = useState([]);

  const todayKey = useMemo(() => {
    const d = new Date();
    return `${d.getDate()}/${d.getMonth() + 1}`;
  }, []);

  const loadHistory = async () => {
    try {
      const { data } = await api.get(`/users/get-chats/${userId}`);
      const allDays = data?.history?.messages ?? [];
      setDays(allDays);

      const today = allDays.find((m) => m.timestamp === todayKey);
      const initial = today ? today.chats : [];
      setSelectedDay(today?.timestamp ?? todayKey);
      setMessages(initial);
    } catch {
      setDays([]);
      setSelectedDay(todayKey);
      setMessages([]);
    }
  };

  useEffect(() => {
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const pickDay = (dayKey) => {
    setSelectedDay(dayKey);
    const day = days.find((d) => d.timestamp === dayKey);
    setMessages(day?.chats ?? []);
  };

  const askAI = async (e) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text) return;

    setInputValue("");
    setLoading(true);
    setMessages((prev) => [
      ...prev,
      { UserMessageContant: text, AiReplayContant: "" },
    ]);

    try {
      const { data } = await api.post(`/users/chat/${userId}`, { message: text });
      setMessages((prev) => {
        const copy = [...prev];
        const last = copy[copy.length - 1];
        if (last && last.UserMessageContant === text && !last.AiReplayContant) {
          copy[copy.length - 1] = {
            UserMessageContant: text,
            AiReplayContant: data?.reply || "No response.",
          };
          return copy;
        }
        return [
          ...copy,
          { UserMessageContant: text, AiReplayContant: data?.reply || "No response." },
        ];
      });
      await loadHistory();
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          UserMessageContant: "",
          AiReplayContant: "Something went wrong. Try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <GlassCard className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-black text-white">Chat History</div>
            <div className="text-xs text-white/60">Pick a day.</div>
          </div>
          <button
            type="button"
            onClick={loadHistory}
            className="rounded-xl bg-white/5 px-3 py-2 text-xs font-black text-white/70 ring-1 ring-white/10 hover:bg-white/10 hover:text-white"
          >
            Refresh
          </button>
        </div>

        <div className="mt-4 max-h-[60vh] space-y-2 overflow-y-auto pr-1">
          {(days.length ? days : [{ timestamp: todayKey }]).map((d) => (
            <button
              key={d.timestamp}
              type="button"
              onClick={() => pickDay(d.timestamp)}
              className={`w-full rounded-xl px-3 py-2 text-left text-sm font-bold ring-1 transition ${
                selectedDay === d.timestamp
                  ? "bg-white text-[#070A18] ring-white/30"
                  : "bg-white/5 text-white/70 ring-white/10 hover:bg-white/10 hover:text-white"
              }`}
            >
              {d.timestamp}
            </button>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="flex min-h-[70vh] flex-col overflow-hidden">
        <div className="border-b border-white/10 p-4">
          <div className="text-sm font-black text-white">AI Chat</div>
          <div className="text-xs text-white/60">
            Ask anything. Keep it task-focused. Get answers fast.
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="grid h-full place-items-center text-center">
              <div>
                <div className="text-2xl font-black">What are we building today?</div>
                <div className="mt-1 text-sm text-white/60">
                  Try: “Break down my task into steps.”
                </div>
              </div>
            </div>
          ) : (
            messages.map((m, idx) => (
              <div key={m._id || idx} className="space-y-3">
                {m.UserMessageContant ? (
                  <div className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#070A18] shadow-lg shadow-white/10">
                      <ReactMarkdown>{m.UserMessageContant}</ReactMarkdown>
                    </div>
                  </div>
                ) : null}

                {m.AiReplayContant ? (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] rounded-2xl bg-white/5 px-4 py-3 text-sm text-white ring-1 ring-white/10">
                      <ReactMarkdown>{m.AiReplayContant}</ReactMarkdown>
                    </div>
                  </div>
                ) : null}
              </div>
            ))
          )}

          {loading ? (
            <div className="text-xs font-bold text-white/60">Thinking…</div>
          ) : null}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={askAI} className="border-t border-white/10 p-4">
          <div className="flex gap-2">
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type a message…"
              className="w-full rounded-2xl bg-white/5 px-4 py-3 text-sm font-semibold text-white ring-1 ring-white/10 outline-none placeholder:text-white/40 focus:ring-white/25"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-2xl bg-white px-4 py-3 text-sm font-black text-[#070A18] ring-1 ring-white/20 disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
