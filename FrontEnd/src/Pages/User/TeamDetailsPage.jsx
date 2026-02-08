import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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
        : tone === "bad"
          ? "bg-rose-500/15 text-rose-200 ring-rose-500/30"
          : "bg-white/10 text-white/70 ring-white/15";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${cls}`}>
      {children}
    </span>
  );
};

export default function TeamDetailsPage() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState(null);
  const [tasks, setTasks] = useState([]);

  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    deadline: "",
    assignedToUserId: "",
  });
  const [taskPdf, setTaskPdf] = useState(null);

  const isOwner = useMemo(() => {
    return team?.owner?._id?.toString() === userId?.toString();
  }, [team, userId]);

  const load = async () => {
    setLoading(true);
    try {
      const [{ data: teamRes }, { data: taskRes }] = await Promise.all([
        api.get(`/teams/${teamId}`),
        api.get(`/team-tasks/team/${teamId}`),
      ]);
      setTeam(teamRes?.team ?? null);
      setTasks(taskRes?.tasks ?? []);
    } catch (e) {
      toast.error(e?.response?.data?.error || "Failed to load team");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId]);

  const addMember = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/teams/${teamId}/members`, { email: newMemberEmail });
      toast.success("Member added");
      setNewMemberEmail("");
      await load();
    } catch (e2) {
      toast.error(e2?.response?.data?.error || "Failed to add member");
    }
  };

  const decide = async (requestId, action) => {
    try {
      await api.patch(`/teams/${teamId}/join-requests/${requestId}`, { action });
      toast.success(action === "accept" ? "Member accepted" : "Request rejected");
      await load();
    } catch (e) {
      toast.error(e?.response?.data?.error || "Failed to update request");
    }
  };

  const createTask = async (e) => {
    e.preventDefault();
    try {
      const form = new FormData();
      form.append("title", taskForm.title);
      form.append("description", taskForm.description);
      form.append("deadline", taskForm.deadline);
      form.append("assignedToUserId", taskForm.assignedToUserId);
      if (taskPdf) form.append("file", taskPdf);

      await api.post(`/team-tasks/team/${teamId}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Task assigned");
      setTaskForm({ title: "", description: "", deadline: "", assignedToUserId: "" });
      setTaskPdf(null);
      await load();
    } catch (e2) {
      toast.error(e2?.response?.data?.error || "Failed to create task");
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await api.delete(`/team-tasks/${taskId}`);
      toast.success("Task deleted");
      await load();
    } catch (e) {
      toast.error(e?.response?.data?.error || "Delete failed");
    }
  };

  const deleteTeam = async () => {
    const ok = window.confirm(
      "Delete this team? This will remove the team and all its assigned tasks."
    );
    if (!ok) return;

    try {
      await api.delete(`/teams/${teamId}`);
      toast.success("Team deleted");
      navigate("/dishboard/teams", { replace: true });
    } catch (e) {
      toast.error(e?.response?.data?.error || "Failed to delete team");
    }
  };

  if (loading) return <GlassCard>Loading…</GlassCard>;
  if (!team) return <GlassCard>Team not found.</GlassCard>;

  const pendingRequests = (team.joinRequests ?? []).filter((r) => r.status === "pending");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">{team.name}</h1>
          <div className="mt-1 text-sm text-white/60">
            <span className="font-bold">Slug:</span> {team.slug} •{" "}
            <span className="font-bold">Owner:</span> {team.owner?.name || team.owner?.email}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Chip tone={isOwner ? "good" : "warn"}>{isOwner ? "owner" : "member"}</Chip>
          <Link
            to="/dishboard/assigned"
            className="rounded-2xl bg-white px-4 py-2.5 text-sm font-black text-[#070A18] ring-1 ring-white/20 transition hover:-translate-y-0.5"
          >
            Assigned Tasks →
          </Link>
          {isOwner ? (
            <button
              type="button"
              onClick={deleteTeam}
              className="rounded-2xl bg-rose-500/15 px-4 py-2.5 text-sm font-black text-rose-100 ring-1 ring-rose-500/30 hover:bg-rose-500/20"
            >
              Delete Team
            </button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <GlassCard className="md:col-span-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-black">Members</div>
            <div className="text-xs text-white/60">{team.members.length} total</div>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {team.members.map((m) => (
              <div
                key={m.user?._id || m.user}
                className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-black">
                      {m.user?.name || "User"}
                    </div>
                    <div className="truncate text-xs text-white/60">
                      {m.user?.email || ""}
                    </div>
                  </div>
                  <Chip tone={m.role === "owner" ? "good" : "default"}>{m.role}</Chip>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <div className="space-y-3">
          {isOwner ? (
            <GlassCard>
              <div className="text-sm font-black">Add Member</div>
              <div className="mt-1 text-xs text-white/60">
                Email must already have an account.
              </div>
              <form className="mt-4 space-y-3" onSubmit={addMember}>
                <input
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder="member@email.com"
                  type="email"
                  className="w-full rounded-2xl bg-white/5 px-4 py-3 text-sm font-semibold text-white ring-1 ring-white/10 outline-none placeholder:text-white/40 focus:ring-white/25"
                  required
                />
                <button
                  type="submit"
                  className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-black text-[#070A18] ring-1 ring-white/20 transition hover:-translate-y-0.5"
                >
                  Add
                </button>
              </form>
            </GlassCard>
          ) : null}

          {isOwner ? (
            <GlassCard>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-black">Join Requests</div>
                  <div className="text-xs text-white/60">Approve or reject.</div>
                </div>
                <Chip tone={pendingRequests.length ? "warn" : "default"}>
                  {pendingRequests.length}
                </Chip>
              </div>

              <div className="mt-4 space-y-2">
                {pendingRequests.length === 0 ? (
                  <div className="text-sm text-white/70">No pending requests.</div>
                ) : (
                  pendingRequests.map((r) => (
                    <div
                      key={r._id}
                      className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-black">
                            {r.user?.name || "User"}
                          </div>
                          <div className="truncate text-xs text-white/60">
                            {r.user?.email || ""}
                          </div>
                          {r.message ? (
                            <div className="mt-2 text-xs text-white/60">
                              “{r.message}”
                            </div>
                          ) : null}
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="rounded-xl bg-emerald-500/15 px-3 py-2 text-xs font-black text-emerald-100 ring-1 ring-emerald-500/30 hover:bg-emerald-500/20"
                            onClick={() => decide(r._id, "accept")}
                          >
                            Accept
                          </button>
                          <button
                            type="button"
                            className="rounded-xl bg-rose-500/15 px-3 py-2 text-xs font-black text-rose-100 ring-1 ring-rose-500/30 hover:bg-rose-500/20"
                            onClick={() => decide(r._id, "reject")}
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </GlassCard>
          ) : null}
        </div>
      </div>

      {isOwner ? (
        <GlassCard>
          <div className="text-lg font-black">Assign a Task</div>
          <div className="mt-1 text-sm text-white/60">
            Owner can assign tasks to team members (text/PDF submission supported).
          </div>

          <form className="mt-5 grid gap-3 md:grid-cols-2" onSubmit={createTask}>
            <input
              value={taskForm.title}
              onChange={(e) => setTaskForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="Task title"
              className="w-full rounded-2xl bg-white/5 px-4 py-3 text-sm font-semibold text-white ring-1 ring-white/10 outline-none placeholder:text-white/40 focus:ring-white/25"
              required
            />
            <select
              value={taskForm.assignedToUserId}
              onChange={(e) =>
                setTaskForm((p) => ({ ...p, assignedToUserId: e.target.value }))
              }
              className="w-full rounded-2xl bg-white/5 px-4 py-3 text-sm font-semibold text-white ring-1 ring-white/10 outline-none focus:ring-white/25"
              required
            >
              <option value="" className="bg-[#0B1026]">
                Assign to…
              </option>
              {team.members
                .filter((m) => m.role !== "owner")
                .map((m) => (
                  <option key={m.user?._id} value={m.user?._id} className="bg-[#0B1026]">
                    {m.user?.name || m.user?.email}
                  </option>
                ))}
            </select>

            <textarea
              value={taskForm.description}
              onChange={(e) =>
                setTaskForm((p) => ({ ...p, description: e.target.value }))
              }
              placeholder="Task description"
              className="min-h-[110px] w-full resize-none rounded-2xl bg-white/5 px-4 py-3 text-sm font-semibold text-white ring-1 ring-white/10 outline-none placeholder:text-white/40 focus:ring-white/25 md:col-span-2"
            />

            <div className="md:col-span-2">
              <label className="text-xs font-bold text-white/60">
                Task PDF (optional)
              </label>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setTaskPdf(e.target.files?.[0] || null)}
                className="mt-1 w-full rounded-2xl bg-white/5 px-4 py-3 text-sm font-semibold text-white ring-1 ring-white/10 file:mr-4 file:rounded-xl file:border-0 file:bg-white file:px-3 file:py-2 file:text-xs file:font-black file:text-[#070A18]"
              />
              <div className="mt-1 text-xs text-white/40">
                Upload a PDF brief/instructions for the member.
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-bold text-white/60">Deadline</label>
              <input
                type="datetime-local"
                value={taskForm.deadline}
                onChange={(e) =>
                  setTaskForm((p) => ({ ...p, deadline: e.target.value }))
                }
                className="mt-1 w-full rounded-2xl bg-white/5 px-4 py-3 text-sm font-semibold text-white ring-1 ring-white/10 outline-none focus:ring-white/25"
                required
              />
            </div>

            <button
              type="submit"
              className="md:col-span-2 w-full rounded-2xl bg-white px-4 py-3 text-sm font-black text-[#070A18] ring-1 ring-white/20 transition hover:-translate-y-0.5"
            >
              Assign
            </button>
          </form>
        </GlassCard>
      ) : null}

      <GlassCard>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-lg font-black">Tasks</div>
            <div className="text-sm text-white/60">
              {isOwner ? "All tasks in this team." : "Tasks assigned to you in this team."}
            </div>
          </div>
          <div className="text-xs text-white/60">{tasks.length} total</div>
        </div>

        <div className="mt-4 grid gap-3">
          {tasks.length === 0 ? (
            <div className="text-sm text-white/70">No tasks yet.</div>
          ) : (
            tasks.map((t) => {
              const tone =
                t.status === "completed"
                  ? "good"
                  : t.status === "submitted"
                    ? "warn"
                    : t.status === "missed"
                      ? "bad"
                      : "default";
              return (
                <div
                  key={t._id}
                  className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="truncate text-base font-black">{t.title}</div>
                      <div className="mt-1 text-sm text-white/60">{t.description}</div>
	                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/60">
	                        <span>
	                          <span className="font-bold">Assigned:</span>{" "}
	                          {t.assignedTo?.name || t.assignedTo?.email || "—"}
	                        </span>
	                        <span>•</span>
	                        <span>
	                          <span className="font-bold">Deadline:</span>{" "}
	                          {new Date(t.deadline).toLocaleString()}
	                        </span>
	                      </div>
	                      {t.taskFileUrl ? (
	                        <a
	                          href={t.taskFileUrl}
	                          target="_blank"
	                          rel="noreferrer"
	                          className="mt-3 inline-flex rounded-xl bg-white/10 px-3 py-2 text-xs font-black text-white ring-1 ring-white/10 hover:bg-white/15"
	                        >
	                          Open Task PDF
	                        </a>
	                      ) : null}
	                      {t.submission?.text || t.submission?.fileUrl ? (
	                        <div className="mt-3 rounded-2xl bg-black/20 p-3 ring-1 ring-white/10">
	                          <div className="text-xs font-black text-white/70">
	                            Submission
	                          </div>
                          {t.submission?.text ? (
                            <div className="mt-1 whitespace-pre-wrap text-sm text-white/80">
                              {t.submission.text}
                            </div>
                          ) : null}
                          {t.submission?.fileUrl ? (
                            <a
                              href={t.submission.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-2 inline-flex rounded-xl bg-white/10 px-3 py-2 text-xs font-black text-white ring-1 ring-white/10 hover:bg-white/15"
                            >
                              Open PDF
                            </a>
                          ) : null}
                        </div>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                      <Chip tone={tone}>{t.status}</Chip>
                      {isOwner ? (
                        <button
                          type="button"
                          className="rounded-xl bg-rose-500/15 px-3 py-2 text-xs font-black text-rose-100 ring-1 ring-rose-500/30 hover:bg-rose-500/20"
                          onClick={() => deleteTask(t._id)}
                        >
                          Delete
                        </button>
                      ) : null}
                      {!isOwner && t.status !== "submitted" ? (
                        <Link
                          to="/dishboard/assigned"
                          className="rounded-xl bg-white/10 px-3 py-2 text-xs font-black text-white ring-1 ring-white/10 hover:bg-white/15"
                        >
                          Submit →
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </GlassCard>
    </div>
  );
}
