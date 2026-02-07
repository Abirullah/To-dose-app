import { useState } from "react";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/api";
import AuthShell from "../Components/AuthShell";

export default function Registration() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    conformPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/users/Register", formData);
      toast.success("Registration successful! Please check your email for the OTP.");
      setLoading(false);
      setOtpStep(true);
      // Optionally redirect to OTP page:
    } catch (error) {
      toast.error(`Registration failed: ${error.response ? error.response.data.message : error.message}`);
      setLoading(false);
    }
  };

  if (otpStep) {
    // Optionally show OTP confirmation UI or redirect
    return (
      <AuthShell
        title="OTP sent"
        subtitle="Check your email, then confirm your OTP to activate your account."
      >
        <button
          className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-black text-[#070A18] shadow-lg shadow-white/10 ring-1 ring-white/20 transition hover:-translate-y-0.5"
          onClick={() =>
            navigate("/OTPconformation", { state: { Email: formData.email } })
          }
        >
          Go to OTP Confirmation
        </button>
        <p className="mt-4 text-center text-sm text-white/60">
          Wrong email?{" "}
          <button
            type="button"
            className="font-black text-white hover:underline"
            onClick={() => setOtpStep(false)}
          >
            Edit & resend
          </button>
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Register once. Then unlock private tasks, teams, and AI chat."
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-xs font-bold text-white/60">Name</label>
          <input
            type="text"
            name="name"
            placeholder="Your name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 w-full rounded-2xl bg-white/5 px-4 py-3 text-sm font-semibold text-white ring-1 ring-white/10 outline-none placeholder:text-white/40 focus:ring-white/25"
            autoComplete="name"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-white/60">Email</label>
          <input
            type="email"
            name="email"
            placeholder="you@email.com"
            value={formData.email}
            onChange={handleChange}
            required
            className="mt-1 w-full rounded-2xl bg-white/5 px-4 py-3 text-sm font-semibold text-white ring-1 ring-white/10 outline-none placeholder:text-white/40 focus:ring-white/25"
            autoComplete="email"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-white/60">Password</label>
          <input
            type="password"
            name="password"
            placeholder="Create a password"
            value={formData.password}
            onChange={handleChange}
            required
            className="mt-1 w-full rounded-2xl bg-white/5 px-4 py-3 text-sm font-semibold text-white ring-1 ring-white/10 outline-none placeholder:text-white/40 focus:ring-white/25"
            autoComplete="new-password"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-white/60">Confirm password</label>
          <input
            type="password"
            name="conformPassword"
            placeholder="Repeat password"
            value={formData.conformPassword}
            onChange={handleChange}
            required
            className="mt-1 w-full rounded-2xl bg-white/5 px-4 py-3 text-sm font-semibold text-white ring-1 ring-white/10 outline-none placeholder:text-white/40 focus:ring-white/25"
            autoComplete="new-password"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-black text-[#070A18] shadow-lg shadow-white/10 ring-1 ring-white/20 transition hover:-translate-y-0.5 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </button>

        <p className="pt-2 text-center text-sm text-white/60">
          Have an account?{" "}
          <Link className="font-black text-white hover:underline" to="/AccountLogin">
            Login
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
