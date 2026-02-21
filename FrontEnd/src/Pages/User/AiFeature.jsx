import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import api from "../../lib/api";
import { getUserId } from "../../lib/authSession";

const GlassCard = ({ children, className = "" }) => (
  <div className={`rounded-2xl bg-white/5 ring-1 ring-white/10 backdrop-blur-xl ${className}`}>
    {children}
  </div>
);

const parseDayKey = (key) => {
  const parts = String(key || "").split("/");
  const day = Number(parts[0]);
  const month = Number(parts[1]);
  if (!day || !month) return null;
  const year = new Date().getFullYear();
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
};

const clamp = (value, max = 70) => {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
};

export default function AiFeatures() {
  const userId = getUserId();

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

  const yesterdayKey = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
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

  const displayDays = useMemo(() => {
    const list = (days?.length ? days : [{ timestamp: todayKey, chats: [] }]).map((d) => {
      const date = parseDayKey(d.timestamp);
      const chats = Array.isArray(d.chats) ? d.chats : [];
      const last = chats[chats.length - 1];
      const lastText =
        last?.UserMessageContant || last?.AiReplayContant || "";

      const label =
        d.timestamp === todayKey
          ? "Today"
          : d.timestamp === yesterdayKey
            ? "Yesterday"
            : date
              ? date.toLocaleDateString(undefined, { month: "short", day: "numeric" })
              : d.timestamp;

      const meta = `${chats.length} message${chats.length === 1 ? "" : "s"}`;

      return {
        key: d.timestamp,
        label,
        raw: d.timestamp,
        dateValue: date?.getTime?.() ?? 0,
        meta,
        preview: clamp(lastText, 64),
      };
    });

    return list.sort((a, b) => b.dateValue - a.dateValue);
  }, [days, todayKey, yesterdayKey]);

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
      <GlassCard className="p-4 flex flex-col lg:sticky lg:top-24 lg:h-[calc(100vh-10rem)]">
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

        <div className="mt-4 flex-1 space-y-2 overflow-y-auto pr-1">
          {displayDays.map((d) => (
            <button
              key={d.key}
              type="button"
              onClick={() => pickDay(d.key)}
              className={`w-full rounded-2xl px-3 py-3 text-left ring-1 transition ${
                selectedDay === d.key
                  ? "bg-white text-[#070A18] ring-white/30"
                  : "bg-white/5 text-white/70 ring-white/10 hover:bg-white/10 hover:text-white"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-black">{d.label}</div>
                  <div className={`mt-1 text-xs ${selectedDay === d.key ? "text-black/60" : "text-white/50"}`}>
                    {d.preview || "No messages yet"}
                  </div>
                </div>
                <div className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-black ring-1 ${
                  selectedDay === d.key
                    ? "bg-black/5 text-black/60 ring-black/10"
                    : "bg-white/5 text-white/60 ring-white/10"
                }`}>
                  {d.meta}
                </div>
              </div>
            </button>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="flex min-h-[70vh] flex-col overflow-hidden lg:h-[calc(100vh-10rem)]">
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
