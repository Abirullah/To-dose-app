import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../lib/api";
import AuthShell from "../Components/AuthShell";


export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
   
  const navigate = useNavigate();
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
     const response= await api.post("/users/Login", formData);
      toast.success("Login successful!");
      setLoading(false);
      
      const { token } = response.data
      const { user } = response.data;

      localStorage.setItem("authToken", token);
      localStorage.setItem("userId", user[0]._id);
      
      navigate("/dishboard")

    } catch (error) {
      if (
        error.response &&
        error.response.data.message === "Please verify your email before logging in"
      ) {
        toast.info("Please verify your email before logging in. Redirecting...")
        setTimeout(() => {
          navigate("/OTPconformation", { state: { Email: formData.email } });
        }, 3000);
        setLoading(false);
        return; 
      }
      toast.error(`Login failed: ${error.response ? error.response.data.message : error.message} `);
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Login to manage private work, team tasks, and submissions."
    >
      <form onSubmit={handleSubmit} className="space-y-3">
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
            placeholder="Your password"
            value={formData.password}
            onChange={handleChange}
            required
            className="mt-1 w-full rounded-2xl bg-white/5 px-4 py-3 text-sm font-semibold text-white ring-1 ring-white/10 outline-none placeholder:text-white/40 focus:ring-white/25"
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-black text-[#070A18] shadow-lg shadow-white/10 ring-1 ring-white/20 transition hover:-translate-y-0.5 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="pt-2 text-center text-sm text-white/60">
          Don’t have an account?{" "}
          <Link className="font-black text-white hover:underline" to="/AccountRegistration">
            Register
          </Link>
        </p>
      </form>
    </AuthShell>


  );
}
