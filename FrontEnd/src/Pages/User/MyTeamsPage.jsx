import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

export default function MyTeamsPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState([]);

  const [showCreate, setShowCreate] = useState(false);
  const [teamName, setTeamName] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/teams/mine");
      setTeams(data?.teams ?? []);
    } catch (e) {
      toast.error(e?.response?.data?.error || "Failed to load teams");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createTeam = async (e) => {
    e.preventDefault();
    try {
      await api.post("/teams", { name: teamName });
      toast.success("Team created");
      setTeamName("");
      setShowCreate(false);
      await load();
    } catch (e2) {
      toast.error(e2?.response?.data?.error || "Create team failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">My Teams</h1>
          <p className="mt-1 text-sm text-white/60">
            Own a team, join a team, and assign work that gets done.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center justify-center rounded-2xl bg-white px-4 py-2.5 text-sm font-black text-[#070A18] shadow-lg shadow-white/10 ring-1 ring-white/20 transition hover:-translate-y-0.5"
        >
          + Create Team
        </button>
      </div>

      {loading ? (
        <GlassCard>Loading...</GlassCard>
      ) : teams.length === 0 ? (
        <GlassCard>
          <div className="text-sm text-white/70">No teams yet.</div>
          <div className="mt-2 text-xs text-white/50">
            Create a team, or use “Find Teams” to request to join.
          </div>
        </GlassCard>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {teams.map((t) => (
            <button
              key={t._id}
              type="button"
              onClick={() => navigate(`/dishboard/teams/${t._id}`)}
              className="text-left"
            >
              <GlassCard className="transition hover:bg-white/7">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="truncate text-lg font-black">{t.name}</div>
                    <div className="mt-1 truncate text-xs text-white/60">
                      Owner: {t.owner?.name || t.owner?.email || "—"}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Chip tone={t.myRole === "owner" ? "good" : "warn"}>
                      {t.myRole}
                    </Chip>
                    <div className="text-xs text-white/60">
                      {t.memberCount} member{t.memberCount === 1 ? "" : "s"}
                    </div>
                    {t.myRole === "owner" && t.pendingJoinRequests ? (
                      <div className="text-xs font-bold text-amber-200">
                        {t.pendingJoinRequests} request
                        {t.pendingJoinRequests === 1 ? "" : "s"}
                      </div>
                    ) : null}
                  </div>
                </div>
              </GlassCard>
            </button>
          ))}
        </div>
      )}

      {showCreate ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-[#0B1026] p-6 ring-1 ring-white/10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-lg font-black">Create Team</div>
                <div className="text-sm text-white/60">Name it. Invite people. Assign work.</div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="rounded-xl bg-white/5 p-2 text-white/70 ring-1 ring-white/10 hover:bg-white/10 hover:text-white"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <form className="mt-5 space-y-3" onSubmit={createTeam}>
              <input
                className="w-full rounded-2xl bg-white/5 px-4 py-3 text-sm font-semibold text-white ring-1 ring-white/10 outline-none placeholder:text-white/40 focus:ring-white/25"
                placeholder="Team name"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                required
              />
              <button
                type="submit"
                className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-black text-[#070A18] shadow-lg shadow-white/10 ring-1 ring-white/20 transition hover:-translate-y-0.5"
              >
                Create
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

