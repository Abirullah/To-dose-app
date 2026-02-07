import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import api from "../../lib/api";

const GlassCard = ({ children, className = "" }) => (
  <div className={`rounded-2xl bg-white/5 p-5 ring-1 ring-white/10 backdrop-blur-xl ${className}`}>
    {children}
  </div>
);

const Chip = ({ children, tone = "default" }) => {
  const cls =
    tone === "good"
      ? "bg-emerald-500/15 text-emerald-200 ring-emerald-500/30"
      : tone === "warn"
        ? "bg-amber-500/15 text-amber-200 ring-amber-500/30"
        : "bg-white/10 text-white/70 ring-white/15";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${cls}`}>
      {children}
    </span>
  );
};

export default function FindTeamsPage() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState([]);

  const canSearch = useMemo(() => q.trim().length >= 2, [q]);

  useEffect(() => {
    if (!canSearch) {
      setTeams([]);
      return;
    }

    const handle = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/teams/search?q=${encodeURIComponent(q.trim())}`);
        setTeams(data?.teams ?? []);
      } catch (e) {
        toast.error(e?.response?.data?.error || "Search failed");
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(handle);
  }, [q, canSearch]);

  const requestJoin = async (teamId) => {
    try {
      await api.post(`/teams/${teamId}/join-requests`, { message: "" });
      toast.success("Join request sent");
      setTeams((prev) =>
        prev.map((t) => (t._id === teamId ? { ...t, hasPendingRequest: true } : t))
      );
    } catch (e) {
      toast.error(e?.response?.data?.error || "Request failed");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-white">Find Teams</h1>
        <p className="mt-1 text-sm text-white/60">
          Search a team by name and send a request to join.
        </p>
      </div>

      <GlassCard>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by team name…"
            className="w-full rounded-2xl bg-white/5 px-4 py-3 text-sm font-semibold text-white ring-1 ring-white/10 outline-none placeholder:text-white/40 focus:ring-white/25"
          />
          <div className="text-xs font-bold text-white/60">
            {loading ? "Searching…" : canSearch ? `${teams.length} result(s)` : "Type 2+ chars"}
          </div>
        </div>
      </GlassCard>

      {teams.length === 0 ? (
        <GlassCard>
          <div className="text-sm text-white/70">
            {canSearch ? "No teams found." : "Start typing to search."}
          </div>
        </GlassCard>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {teams.map((t) => (
            <GlassCard key={t._id} className="transition hover:bg-white/7">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="truncate text-lg font-black">{t.name}</div>
                  <div className="mt-1 truncate text-xs text-white/60">
                    Owner: {t.owner?.name || t.owner?.email || "—"}
                  </div>
                  <div className="mt-2 text-xs text-white/60">
                    {t.memberCount} member{t.memberCount === 1 ? "" : "s"}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  {t.isMember ? <Chip tone="good">member</Chip> : null}
                  {t.hasPendingRequest ? <Chip tone="warn">pending</Chip> : null}

                  {!t.isMember && !t.hasPendingRequest ? (
                    <button
                      type="button"
                      onClick={() => requestJoin(t._id)}
                      className="rounded-2xl bg-white px-4 py-2 text-xs font-black text-[#070A18] ring-1 ring-white/20 transition hover:-translate-y-0.5"
                    >
                      Request to Join
                    </button>
                  ) : null}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}

