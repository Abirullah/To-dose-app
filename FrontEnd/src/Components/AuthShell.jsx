import { Link } from "react-router-dom";

const OrbBackground = () => (
  <div className="pointer-events-none fixed inset-0 overflow-hidden">
    <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-fuchsia-500/20 blur-3xl" />
    <div className="absolute top-32 -left-48 h-[420px] w-[420px] rounded-full bg-cyan-400/20 blur-3xl" />
    <div className="absolute bottom-0 right-0 h-[520px] w-[520px] rounded-full bg-indigo-500/20 blur-3xl" />
  </div>
);

export default function AuthShell({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-[#070A18] text-white">
      <OrbBackground />

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <Link to="/" className="mx-auto mb-6 flex items-center justify-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/10">
              <span className="text-sm font-black tracking-tight">TM</span>
            </div>
            <div className="text-sm font-black tracking-tight text-white">
              TaskMaster
            </div>
          </Link>

          <div className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur-xl sm:p-8">
            <h1 className="text-2xl font-black tracking-tight">{title}</h1>
            {subtitle ? (
              <p className="mt-2 text-sm text-white/60">{subtitle}</p>
            ) : null}

            <div className="mt-6">{children}</div>
          </div>

          <p className="mt-6 text-center text-xs text-white/40">
            Secure sessions • Clean UI • Fast workflows
          </p>
        </div>
      </div>
    </div>
  );
}

