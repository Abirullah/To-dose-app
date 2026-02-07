import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../lib/api";


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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-cyan-50 font-sans p-4">
      <div className="w-full max-w-sm sm:max-w-md">
        <div className="bg-white p-8 sm:p-12 rounded-2xl shadow-2xl">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 text-center">Login</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
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
            <button
              type="submit"
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
          <p className="text-center mt-4">
             Don't have an account?
            <Link className="text-blue-700" to="/AccountRegistration"> Register</Link>
        </p>
      </div>
      </div>
      
      
    </div>


  );
}
