import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

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
      await axios.post("http://localhost:5000/users/Register", formData);
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-cyan-50 font-sans p-4">
        <div className="w-full max-w-sm sm:max-w-md">
          <div className="bg-white p-8 sm:p-12 rounded-2xl shadow-2xl text-center">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">OTP Sent</h1>
            <p className="text-gray-600 mb-2">Check your email for the OTP to verify your account.</p>
            <button
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl mt-4"
              onClick={() => navigate("/OTPconformation", { state: { Email: formData.email } })}
            >
              Go to OTP Confirmation
            </button>
          </div>
        </div>
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-cyan-50 font-sans p-4">
      <div className="w-full max-w-sm sm:max-w-md">
        <div className="bg-white p-8 sm:p-12 rounded-2xl shadow-2xl">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 text-center">Register</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl"
            />
            <input
              type="password"
              name="conformPassword"
              placeholder="Confirm Password"
              value={formData.conformPassword}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl"
            />
            <button
              type="submit"
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl"
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>
          <p className="justify-center mt-2 align-middle">Have an account? <a className="text-blue-700" href="http://localhost:5173/AccountLogin">Login</a></p>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}