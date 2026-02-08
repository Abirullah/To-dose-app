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
        : tone === "bad"
          ? "bg-rose-500/15 text-rose-200 ring-rose-500/30"
          : "bg-white/10 text-white/70 ring-white/15";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${cls}`}>
      {children}
    </span>
  );
};

export default function AssignedTasksPage() {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [selected, setSelected] = useState(null);

  const [submissionText, setSubmissionText] = useState("");
  const [submissionFile, setSubmissionFile] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/team-tasks/assigned-to-me");
      setTasks(data?.tasks ?? []);
    } catch (e) {
      toast.error(e?.response?.data?.error || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const statusTone = (s) =>
    s === "completed"
      ? "good"
      : s === "submitted"
        ? "warn"
        : s === "missed"
          ? "bad"
          : "default";

  const sorted = useMemo(() => {
    return [...tasks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [tasks]);

  const open = (task) => {
    setSelected(task);
    setSubmissionText(task?.submission?.text || "");
    setSubmissionFile(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!selected) return;

    const form = new FormData();
    if (submissionText.trim()) form.append("submissionText", submissionText.trim());
    if (submissionFile) form.append("file", submissionFile);

    try {
      await api.post(`/team-tasks/${selected._id}/submit`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Submitted");
      setSelected(null);
      setSubmissionText("");
      setSubmissionFile(null);
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.error || "Submit failed");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-white">Assigned To Me</h1>
        <p className="mt-1 text-sm text-white/60">
          Tasks assigned by your team owners. You can only submit.
        </p>
      </div>

      {loading ? (
        <GlassCard>Loading…</GlassCard>
      ) : sorted.length === 0 ? (
        <GlassCard>
          <div className="text-sm text-white/70">No assigned tasks right now.</div>
        </GlassCard>
      ) : (
        <div className="grid gap-3">
          {sorted.map((t) => (
            <button key={t._id} type="button" className="text-left" onClick={() => open(t)}>
              <GlassCard className="transition hover:bg-white/7">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="truncate text-base font-black">{t.title}</div>
                    <div className="mt-1 text-sm text-white/60">{t.description}</div>
	                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/60">
	                      <span>
	                        <span className="font-bold">Team:</span> {t.team?.name || "—"}
	                      </span>
	                      <span>•</span>
	                      <span>
	                        <span className="font-bold">Owner:</span>{" "}
	                        {t.team?.owner?.name || t.team?.owner?.email || "—"}
	                      </span>
	                      <span>•</span>
	                      <span>
	                        <span className="font-bold">Deadline:</span>{" "}
	                        {new Date(t.deadline).toLocaleString()}
	                      </span>
	                    </div>
	                    {t.taskFileUrl ? (
	                      <div className="mt-2 text-xs font-black text-cyan-200">
	                        Task PDF attached
	                      </div>
	                    ) : null}
	                  </div>

                  <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                    <Chip tone={statusTone(t.status)}>{t.status}</Chip>
                    {t.submission?.submittedAt ? (
                      <div className="text-xs text-white/60">
                        Submitted {new Date(t.submission.submittedAt).toLocaleString()}
                      </div>
                    ) : (
                      <div className="text-xs text-white/60">Not submitted</div>
                    )}
                  </div>
                </div>
              </GlassCard>
            </button>
          ))}
        </div>
      )}

      {selected ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl bg-[#0B1026] p-6 ring-1 ring-white/10">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="truncate text-xl font-black">{selected.title}</div>
                <div className="mt-1 text-sm text-white/60">
                  Team: {selected.team?.name || "—"} • Deadline:{" "}
                  {new Date(selected.deadline).toLocaleString()}
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

	            <div className="mt-5 grid gap-3 md:grid-cols-3">
	              <div className="md:col-span-2">
	                <GlassCard className="p-4">
	                  <div className="text-xs font-bold text-white/60">Task Details</div>
	                  <div className="mt-2 whitespace-pre-wrap text-sm text-white/80">
	                    {selected.description}
	                  </div>
	                  {selected.taskFileUrl ? (
	                    <a
	                      href={selected.taskFileUrl}
	                      target="_blank"
	                      rel="noreferrer"
	                      className="mt-3 inline-flex rounded-xl bg-white/10 px-3 py-2 text-xs font-black text-white ring-1 ring-white/10 hover:bg-white/15"
	                    >
	                      Open Task PDF
	                    </a>
	                  ) : null}
	                </GlassCard>
	              </div>
              <div className="space-y-3">
                <GlassCard className="p-4">
                  <div className="text-xs font-bold text-white/60">Status</div>
                  <div className="mt-2">
                    <Chip tone={statusTone(selected.status)}>{selected.status}</Chip>
                  </div>
                </GlassCard>
                <GlassCard className="p-4">
                  <div className="text-xs font-bold text-white/60">Submission Types</div>
                  <div className="mt-2 text-sm text-white/70">Text + PDF upload</div>
                </GlassCard>
              </div>
            </div>

            <form className="mt-5 space-y-3" onSubmit={submit}>
              <textarea
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                placeholder="Write your submission…"
                className="min-h-[130px] w-full resize-none rounded-2xl bg-white/5 px-4 py-3 text-sm font-semibold text-white ring-1 ring-white/10 outline-none placeholder:text-white/40 focus:ring-white/25"
              />
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setSubmissionFile(e.target.files?.[0] || null)}
                  className="w-full rounded-2xl bg-white/5 px-4 py-3 text-sm font-semibold text-white ring-1 ring-white/10 file:mr-4 file:rounded-xl file:border-0 file:bg-white file:px-3 file:py-2 file:text-xs file:font-black file:text-[#070A18]"
                />
                {selected.submission?.fileUrl ? (
                  <a
                    href={selected.submission.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-2xl bg-white/10 px-4 py-3 text-xs font-black text-white ring-1 ring-white/10 hover:bg-white/15"
                  >
                    View PDF
                  </a>
                ) : null}
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-black text-[#070A18] ring-1 ring-white/20 transition hover:-translate-y-0.5"
              >
                Submit
              </button>
              <div className="text-xs text-white/50">
                Submit either text, PDF, or both.
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
