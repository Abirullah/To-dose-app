import { NavLink, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import api from "../../lib/api";

const NavItem = ({ to, label, icon }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition ${
        isActive
          ? "bg-white/15 text-white shadow-sm ring-1 ring-white/20"
          : "text-white/70 hover:text-white hover:bg-white/10"
      }`
    }
  >
    <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 ring-1 ring-white/10 group-hover:bg-white/15">
      {icon}
    </span>
    <span className="truncate">{label}</span>
  </NavLink>
);

const Icon = ({ path }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={path} />
  </svg>
);

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const token = localStorage.getItem("authToken");
  const userId = localStorage.getItem("userId");

  const navItems = useMemo(
    () => [
      { to: "private", label: "Private Tasks", icon: <Icon path="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" /> },
      { to: "assigned", label: "Assigned To Me", icon: <Icon path="M9 12l2 2 4-4M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /> },
      { to: "teams", label: "My Teams", icon: <Icon path="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H2v-2a4 4 0 014-4h1m10-4a4 4 0 10-8 0 4 4 0 008 0z" /> },
      { to: "find-teams", label: "Find Teams", icon: <Icon path="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z" /> },
      { to: "ai", label: "AI Chat", icon: <Icon path="M12 20l9-5-9-5-9 5 9 5zM12 12V4" /> },
      { to: "profile", label: "Profile", icon: <Icon path="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" /> },
    ],
    []
  );

  useEffect(() => {
    if (!token || !userId) return;
    let mounted = true;

    const load = async () => {
      try {
        await api.post("/users/verify-token");
        const { data } = await api.get(`/users/GetUserProfile/${userId}`);
        if (mounted) setProfile(data.user);
      } finally {
        if (mounted) setLoadingProfile(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [token, userId]);

  if (!token || !userId) {
    return <Navigate to="/AccountLogin" replace state={{ from: location.pathname }} />;
  }

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    navigate("/AccountLogin", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#070A18] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="absolute top-32 -left-48 h-[420px] w-[420px] rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[520px] w-[520px] rounded-full bg-indigo-500/20 blur-3xl" />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 h-full w-[285px] border-r border-white/10 bg-white/5 backdrop-blur-xl transition-transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/10">
              <span className="text-sm font-black tracking-tight">TM</span>
            </div>
            <div>
              <div className="text-sm font-extrabold leading-none">TaskMaster</div>
              <div className="text-xs text-white/60">Work. Team. Ship.</div>
            </div>
          </div>
          <button
            type="button"
            className="md:hidden rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close"
          >
            <Icon path="M6 18L18 6M6 6l12 12" />
          </button>
        </div>

        <nav className="px-3">
          <div className="space-y-2">
            {navItems.map((item) => (
              <NavItem key={item.to} to={item.to} label={item.label} icon={item.icon} />
            ))}
          </div>
        </nav>

        <div className="mt-auto px-4 py-5">
          <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/10">
                {profile?.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : null}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-bold">
                  {loadingProfile ? "Loading..." : profile?.name || "User"}
                </div>
                <div className="truncate text-xs text-white/60">
                  {profile?.email || ""}
                </div>
              </div>
            </div>
            <NavLink
              to="profile"
              className="mt-4 block w-full rounded-xl bg-white/5 px-3 py-2 text-center text-sm font-semibold text-white/80 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white"
            >
              Edit Profile
            </NavLink>
            <button
              type="button"
              onClick={logout}
              className="mt-4 w-full rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white/80 ring-1 ring-white/10 transition hover:bg-white/15 hover:text-white"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="md:pl-[285px]">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-black/10 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <button
              type="button"
              className="md:hidden inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white/80 ring-1 ring-white/10 hover:bg-white/15 hover:text-white"
              onClick={() => setSidebarOpen(true)}
            >
              <Icon path="M4 6h16M4 12h16M4 18h16" />
              Menu
            </button>
            <div className="text-sm font-bold text-white/80">
              {new Date().toLocaleDateString(undefined, {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
