import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import api from "../../lib/api";

const SectionTitle = ({ title, subtitle }) => (
  <div className="mb-6">
    <h1 className="text-2xl font-black tracking-tight text-white">{title}</h1>
    {subtitle ? <p className="mt-1 text-sm text-white/60">{subtitle}</p> : null}
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

const GlassCard = ({ children, className = "" }) => (
  <div className={`rounded-2xl bg-white/5 p-5 ring-1 ring-white/10 backdrop-blur-xl ${className}`}>
    {children}
  </div>
);

const toLocalInputValue = (dateValue) => {
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
};

export default function PrivateTasksPage() {
  const userId = localStorage.getItem("userId");

  const [loading, setLoading] = useState(true);
  const [collectionId, setCollectionId] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("pending");

  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    workTitle: "",
    workDescription: "",
    worksComletionTime: "",
  });

  const [selected, setSelected] = useState(null);
  const [editDue, setEditDue] = useState("");

  const refresh = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/tasks/GetTasks/${userId}`);
      const doc = Array.isArray(data) ? data[0] : null;
      const list = doc?.WorkCollection ?? [];
      setCollectionId(doc?._id ?? null);
      setTasks(list);
    } catch (e) {
      toast.error(e?.response?.data?.error || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const computed = useMemo(() => {
    const now = Date.now();
    const list = tasks.map((t) => {
      const due = new Date(t.worksComletionTime).getTime();
      const isOverdue = !Number.isNaN(due) && due < now && t.worksStatus !== "completed";
      const uiStatus = isOverdue ? "missed" : t.worksStatus;
      return { ...t, __uiStatus: uiStatus };
    });

    const counts = list.reduce(
      (acc, t) => {
        acc[t.__uiStatus] = (acc[t.__uiStatus] || 0) + 1;
        return acc;
      },
      { pending: 0, "in-progress": 0, completed: 0, missed: 0 }
    );

    const filtered =
      filter === "all" ? list : list.filter((t) => t.__uiStatus === filter);

    return { list, counts, filtered };
  }, [tasks, filter]);

  const updateTask = async (task, patch) => {
    if (!collectionId) return;
    try {
      await api.put(`/tasks/UpdateTask/${userId}`, {
        TaskId: task._id,
        TaskMasterId: collectionId,
        workTitle: patch.workTitle ?? task.workTitle,
        workDescription: patch.workDescription ?? task.workDescription,
        worksComletionTime: patch.worksComletionTime ?? task.worksComletionTime,
        worksStatus: patch.worksStatus ?? task.worksStatus,
      });
      await refresh();
    } catch (e) {
      toast.error(e?.response?.data?.error || e?.response?.data || "Update failed");
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/DeleteTask/${taskId}`);
      toast.success("Task deleted");
      setSelected(null);
      await refresh();
    } catch (e) {
      toast.error(e?.response?.data || "Delete failed");
    }
  };

  const createTask = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/tasks/AddTask/${userId}`, createForm);
      toast.success("Task created");
      setShowCreate(false);
      setCreateForm({ workTitle: "", workDescription: "", worksComletionTime: "" });
      await refresh();
    } catch (err) {
      toast.error(err?.response?.data?.error || err?.response?.data?.message || "Create failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SectionTitle
          title="Private Tasks"
          subtitle="Your personal work — clean, fast, and on time."
        />
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center justify-center rounded-2xl bg-white px-4 py-2.5 text-sm font-black text-[#070A18] shadow-lg shadow-white/10 ring-1 ring-white/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-white/15"
        >
          + New Task
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <GlassCard className="p-4">
          <div className="text-xs font-bold text-white/60">Pending</div>
          <div className="mt-1 text-2xl font-black">{computed.counts["pending"]}</div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="text-xs font-bold text-white/60">In Progress</div>
          <div className="mt-1 text-2xl font-black">{computed.counts["in-progress"]}</div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="text-xs font-bold text-white/60">Completed</div>
          <div className="mt-1 text-2xl font-black">{computed.counts["completed"]}</div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="text-xs font-bold text-white/60">Missed</div>
          <div className="mt-1 text-2xl font-black">{computed.counts["missed"]}</div>
        </GlassCard>
      </div>

      <GlassCard className="p-3">
        <div className="flex flex-wrap gap-2">
          {[
            { k: "pending", label: "Pending" },
            { k: "in-progress", label: "In progress" },
            { k: "completed", label: "Completed" },
            { k: "missed", label: "Missed" },
            { k: "all", label: "All" },
          ].map((t) => (
            <button
              key={t.k}
              type="button"
              onClick={() => setFilter(t.k)}
              className={`rounded-xl px-3 py-2 text-sm font-bold ring-1 transition ${
                filter === t.k
                  ? "bg-white text-[#070A18] ring-white/30"
                  : "bg-white/5 text-white/70 ring-white/10 hover:bg-white/10 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </GlassCard>

      <div className="grid gap-3">
        {loading ? (
          <GlassCard>Loading...</GlassCard>
        ) : computed.filtered.length === 0 ? (
          <GlassCard>
            <div className="text-sm text-white/70">No tasks in this view.</div>
          </GlassCard>
        ) : (
          computed.filtered.map((t) => {
            const status = t.__uiStatus;
            const tone =
              status === "completed"
                ? "good"
                : status === "in-progress"
                  ? "warn"
                  : status === "missed"
                    ? "bad"
                    : "default";
            return (
              <button
                key={t._id}
                type="button"
                onClick={() => {
                  setSelected(t);
                  setEditDue(toLocalInputValue(t.worksComletionTime));
                }}
                className="text-left"
              >
                <GlassCard className="transition hover:bg-white/7">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="truncate text-base font-black">{t.workTitle}</div>
                      <div className="mt-1 line-clamp-2 text-sm text-white/60">
                        {t.workDescription}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Chip tone={tone}>{status}</Chip>
                      <div className="text-xs text-white/60">
                        Due {new Date(t.worksComletionTime).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </button>
            );
          })
        )}
      </div>

      {/* Create modal */}
      {showCreate ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-[#0B1026] p-6 ring-1 ring-white/10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-lg font-black">New Task</div>
                <div className="text-sm text-white/60">
                  Keep it clear. Keep it doable.
                </div>
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

            <form className="mt-5 space-y-3" onSubmit={createTask}>
              <input
                className="w-full rounded-2xl bg-white/5 px-4 py-3 text-sm font-semibold text-white ring-1 ring-white/10 outline-none placeholder:text-white/40 focus:ring-white/25"
                placeholder="Title"
                value={createForm.workTitle}
                onChange={(e) =>
                  setCreateForm((p) => ({ ...p, workTitle: e.target.value }))
                }
                required
              />
              <textarea
                className="min-h-[120px] w-full resize-none rounded-2xl bg-white/5 px-4 py-3 text-sm font-semibold text-white ring-1 ring-white/10 outline-none placeholder:text-white/40 focus:ring-white/25"
                placeholder="Description"
                value={createForm.workDescription}
                onChange={(e) =>
                  setCreateForm((p) => ({ ...p, workDescription: e.target.value }))
                }
                required
              />
              <div>
                <label className="text-xs font-bold text-white/60">Due</label>
                <input
                  type="datetime-local"
                  className="mt-1 w-full rounded-2xl bg-white/5 px-4 py-3 text-sm font-semibold text-white ring-1 ring-white/10 outline-none focus:ring-white/25"
                  value={createForm.worksComletionTime}
                  onChange={(e) =>
                    setCreateForm((p) => ({
                      ...p,
                      worksComletionTime: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-black text-[#070A18] shadow-lg shadow-white/10 ring-1 ring-white/20 transition hover:-translate-y-0.5"
              >
                Create Task
              </button>
            </form>
          </div>
        </div>
      ) : null}

      {/* Details modal */}
      {selected ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl bg-[#0B1026] p-6 ring-1 ring-white/10">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="truncate text-xl font-black">{selected.workTitle}</div>
                <div className="mt-1 text-sm text-white/60">
                  Created {new Date(selected.createdAt).toLocaleString()}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-xl bg-white/5 p-2 text-white/70 ring-1 ring-white/10 hover:bg-white/10 hover:text-white"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="md:col-span-2">
                <GlassCard className="p-4">
                  <div className="text-xs font-bold text-white/60">Description</div>
                  <div className="mt-2 whitespace-pre-wrap text-sm text-white/80">
                    {selected.workDescription}
                  </div>
                </GlassCard>
              </div>
              <div className="space-y-3">
                <GlassCard className="p-4">
                  <div className="text-xs font-bold text-white/60">Status</div>
                  <div className="mt-2">
                    <Chip
                      tone={
                        selected.__uiStatus === "completed"
                          ? "good"
                          : selected.__uiStatus === "in-progress"
                            ? "warn"
                            : selected.__uiStatus === "missed"
                              ? "bad"
                              : "default"
                      }
                    >
                      {selected.__uiStatus}
                    </Chip>
                  </div>
                </GlassCard>

                <GlassCard className="p-4">
                  <div className="text-xs font-bold text-white/60">Due</div>
                  <input
                    type="datetime-local"
                    className="mt-2 w-full rounded-2xl bg-white/5 px-3 py-2 text-sm font-semibold text-white ring-1 ring-white/10 outline-none focus:ring-white/25"
                    value={editDue}
                    onChange={(e) => setEditDue(e.target.value)}
                  />
                  <button
                    type="button"
                    className="mt-3 w-full rounded-2xl bg-white/10 px-3 py-2 text-sm font-black text-white ring-1 ring-white/10 hover:bg-white/15"
                    onClick={() =>
                      updateTask(selected, { worksComletionTime: editDue })
                        .then(() => setSelected(null))
                        .catch(() => {})
                    }
                  >
                    Update Due Date
                  </button>
                </GlassCard>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {selected.__uiStatus === "pending" ? (
                <button
                  type="button"
                  className="rounded-2xl bg-amber-500/15 px-4 py-2 text-sm font-black text-amber-100 ring-1 ring-amber-500/30 hover:bg-amber-500/20"
                  onClick={() =>
                    updateTask(selected, { worksStatus: "in-progress" }).then(() =>
                      setSelected(null)
                    )
                  }
                >
                  Start
                </button>
              ) : null}

              {selected.__uiStatus === "in-progress" ? (
                <button
                  type="button"
                  className="rounded-2xl bg-emerald-500/15 px-4 py-2 text-sm font-black text-emerald-100 ring-1 ring-emerald-500/30 hover:bg-emerald-500/20"
                  onClick={() =>
                    updateTask(selected, { worksStatus: "completed" }).then(() =>
                      setSelected(null)
                    )
                  }
                >
                  Mark Completed
                </button>
              ) : null}

              {selected.__uiStatus === "missed" ? (
                <button
                  type="button"
                  className="rounded-2xl bg-white/10 px-4 py-2 text-sm font-black text-white ring-1 ring-white/10 hover:bg-white/15"
                  onClick={() =>
                    updateTask(selected, { worksStatus: "pending" }).then(() =>
                      setSelected(null)
                    )
                  }
                >
                  Move Back To Pending
                </button>
              ) : null}

              {selected.__uiStatus !== "completed" ? (
                <button
                  type="button"
                  className="rounded-2xl bg-rose-500/15 px-4 py-2 text-sm font-black text-rose-100 ring-1 ring-rose-500/30 hover:bg-rose-500/20"
                  onClick={() => deleteTask(selected._id)}
                >
                  Delete
                </button>
              ) : (
                <button
                  type="button"
                  className="rounded-2xl bg-rose-500/15 px-4 py-2 text-sm font-black text-rose-100 ring-1 ring-rose-500/30 hover:bg-rose-500/20"
                  onClick={() => deleteTask(selected._id)}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

