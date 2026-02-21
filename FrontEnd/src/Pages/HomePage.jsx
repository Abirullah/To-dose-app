import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/api";
import { getAuthToken } from "../lib/authSession";

const FeatureCard = ({ title, desc }) => (
  <div className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur-xl">
    <div className="text-sm font-black">{title}</div>
    <div className="mt-2 text-sm text-white/60">{desc}</div>
  </div>
);

export default function HomePage() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);

  const openDashboard = async () => {
    const authToken = getAuthToken();
    if (!authToken) {
      navigate("/AccountLogin");
      return;
    }

    setChecking(true);
    try {
      await api.post("/users/verify-token");
      navigate("/dishboard");
    } catch {
      navigate("/AccountLogin");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070A18] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="absolute top-32 -left-48 h-[420px] w-[420px] rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[520px] w-[520px] rounded-full bg-indigo-500/20 blur-3xl" />
      </div>

      <header className="relative z-10 border-b border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/10">
              <span className="text-sm font-black tracking-tight">TM</span>
            </div>
            <div className="text-sm font-black tracking-tight">TaskMaster</div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              to="/AccountLogin"
              className="rounded-2xl bg-white/5 px-4 py-2 text-sm font-black text-white/80 ring-1 ring-white/10 hover:bg-white/10 hover:text-white"
            >
              Login
            </Link>
            <Link
              to="/AccountRegistration"
              className="rounded-2xl bg-white px-4 py-2 text-sm font-black text-[#070A18] ring-1 ring-white/20 transition hover:-translate-y-0.5"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-16">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-black text-white/70 ring-1 ring-white/10">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Private + Team workflows
            </div>

            <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight sm:text-5xl">
              Manage tasks with a{" "}
              <span className="bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-indigo-300 bg-clip-text text-transparent">
                clean, sexy
              </span>{" "}
              dashboard.
            </h1>

            <p className="mt-4 text-base text-white/60">
              Private tasks, AI chat, teams, owner-assigned work, and submissions
              (text + PDF). Built to look premium and feel fast.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={openDashboard}
                disabled={checking}
                className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-black text-[#070A18] shadow-lg shadow-white/10 ring-1 ring-white/20 transition hover:-translate-y-0.5 disabled:opacity-60"
              >
                {checking ? "Checking session..." : "Open Dashboard"}
              </button>

              <Link
                to="/dishboard/find-teams"
                className="inline-flex items-center justify-center rounded-2xl bg-white/5 px-5 py-3 text-sm font-black text-white/80 ring-1 ring-white/10 hover:bg-white/10 hover:text-white"
              >
                Find Teams
              </Link>
            </div>

            <div className="mt-6 text-xs text-white/40">
              Owner-only controls for teams • Member-only submissions • Deadline
              validation
            </div>
          </div>

          <div className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur-xl">
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  title: "Private Tasks",
                  desc: "Create, start, complete. Clean timeline and status.",
                },
                { title: "AI Chat", desc: "Ask questions, get breakdowns, move faster." },
                { title: "Teams", desc: "Create teams, approve requests, add members." },
                { title: "Submissions", desc: "Submit work as text and/or PDF file." },
              ].map((c) => (
                <div
                  key={c.title}
                  className="rounded-2xl bg-black/20 p-4 ring-1 ring-white/10"
                >
                  <div className="text-sm font-black">{c.title}</div>
                  <div className="mt-1 text-xs text-white/60">{c.desc}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-2xl bg-gradient-to-r from-fuchsia-500/15 via-cyan-500/15 to-indigo-500/15 p-4 ring-1 ring-white/10">
              <div className="text-xs font-black text-white/80">
                Your flow in 30 seconds
              </div>
              <div className="mt-2 grid gap-2 text-sm text-white/70">
                <div>1) Create team / request to join</div>
                <div>2) Owner assigns tasks to members</div>
                <div>3) Member submits text/PDF → done</div>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-14 grid gap-3 md:grid-cols-3">
          <FeatureCard
            title="Owner permissions"
            desc="Only owners can add members and assign tasks."
          />
          <FeatureCard
            title="Account validation"
            desc="Member email must already exist as an account."
          />
          <FeatureCard
            title="Deadline enforcement"
            desc="Past deadlines are blocked and missed tasks are flagged."
          />
        </section>
      </main>
    </div>
  );
}
