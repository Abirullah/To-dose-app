import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../lib/api";
import { getUserId } from "../../lib/authSession";

const GlassCard = ({ children, className = "" }) => (
  <div
    className={`rounded-2xl bg-white/5 p-5 ring-1 ring-white/10 backdrop-blur-xl ${className}`}
  >
    {children}
  </div>
);

export default function ProfilePage() {
  const userId = getUserId();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  const [name, setName] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [pw, setPw] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [savingPassword, setSavingPassword] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/users/GetUserProfile/${userId}`);
      setProfile(data.user);
      setName(data.user?.name || "");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const form = new FormData();
      form.append("name", name);
      if (avatarFile) form.append("file", avatarFile);

      const { data } = await api.post(`/users/UpdateUserProfile/${userId}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Profile updated");
      setProfile(data.user);
      setAvatarFile(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Profile update failed");
    } finally {
      setSavingProfile(false);
    }
  };

  const updatePassword = async (e) => {
    e.preventDefault();
    if (pw.newPassword !== pw.confirmNewPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setSavingPassword(true);
    try {
      await api.post(`/users/UpdatePassword/${userId}`, pw);
      toast.success("Password updated");
      setPw({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Password update failed");
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) return <GlassCard>Loading…</GlassCard>;
  if (!profile) return <GlassCard>Profile not found.</GlassCard>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-white">Profile</h1>
        <p className="mt-1 text-sm text-white/60">
          Update your name, avatar, and password.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <GlassCard className="md:col-span-2">
          <div className="text-sm font-black">Basic info</div>
          <form onSubmit={updateProfile} className="mt-4 space-y-3">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 overflow-hidden rounded-3xl bg-white/10 ring-1 ring-white/10">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <div className="flex-1">
                <label className="text-xs font-bold text-white/60">Avatar</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                  className="mt-1 w-full rounded-2xl bg-white/5 px-4 py-3 text-sm font-semibold text-white ring-1 ring-white/10 file:mr-4 file:rounded-xl file:border-0 file:bg-white file:px-3 file:py-2 file:text-xs file:font-black file:text-[#070A18]"
                />
                <div className="mt-1 text-xs text-white/40">
                  PNG/JPG recommended.
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-white/60">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-2xl bg-white/5 px-4 py-3 text-sm font-semibold text-white ring-1 ring-white/10 outline-none placeholder:text-white/40 focus:ring-white/25"
                placeholder="Your name"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-white/60">Email</label>
              <input
                value={profile.email || ""}
                disabled
                className="mt-1 w-full cursor-not-allowed rounded-2xl bg-white/5 px-4 py-3 text-sm font-semibold text-white/50 ring-1 ring-white/10"
              />
              <div className="mt-1 text-xs text-white/40">
                Email changes are disabled for now.
              </div>
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-black text-[#070A18] ring-1 ring-white/20 transition hover:-translate-y-0.5 disabled:opacity-60"
            >
              {savingProfile ? "Saving..." : "Save changes"}
            </button>
          </form>
        </GlassCard>

        <GlassCard>
          <div className="text-sm font-black">Change password</div>
          <form onSubmit={updatePassword} className="mt-4 space-y-3">
            <div>
              <label className="text-xs font-bold text-white/60">
                Current password
              </label>
              <input
                type="password"
                value={pw.currentPassword}
                onChange={(e) => setPw((p) => ({ ...p, currentPassword: e.target.value }))}
                className="mt-1 w-full rounded-2xl bg-white/5 px-4 py-3 text-sm font-semibold text-white ring-1 ring-white/10 outline-none placeholder:text-white/40 focus:ring-white/25"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-white/60">New password</label>
              <input
                type="password"
                value={pw.newPassword}
                onChange={(e) => setPw((p) => ({ ...p, newPassword: e.target.value }))}
                className="mt-1 w-full rounded-2xl bg-white/5 px-4 py-3 text-sm font-semibold text-white ring-1 ring-white/10 outline-none placeholder:text-white/40 focus:ring-white/25"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-white/60">
                Confirm new password
              </label>
              <input
                type="password"
                value={pw.confirmNewPassword}
                onChange={(e) =>
                  setPw((p) => ({ ...p, confirmNewPassword: e.target.value }))
                }
                className="mt-1 w-full rounded-2xl bg-white/5 px-4 py-3 text-sm font-semibold text-white ring-1 ring-white/10 outline-none placeholder:text-white/40 focus:ring-white/25"
                required
              />
            </div>

            <button
              type="submit"
              disabled={savingPassword}
              className="w-full rounded-2xl bg-white/10 px-4 py-3 text-sm font-black text-white ring-1 ring-white/10 hover:bg-white/15 disabled:opacity-60"
            >
              {savingPassword ? "Updating..." : "Update password"}
            </button>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}
