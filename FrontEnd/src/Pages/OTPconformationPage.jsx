import { useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from "react-toastify";
import api from "../lib/api";

function OTPconformationPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [FormData, setFormData] = useState({
            email: location.state?.Email || "",
             otp: ""
    })
    const handleChange = (e) =>{
        setFormData({ ...FormData, [e.target.name]: e.target.value });
    }
    const handleSubmit = async (e) =>{
        e.preventDefault();
        console.log(FormData);
        try {
            const response = await api.post('/users/VerifyOTP', {
                ...FormData
            });
            console.log('Server Response:', response.data);
            // here i want to redirect to login page
            toast.success("OTP verified successfully! You can now log in.");
            navigate("/AccountLogin", { replace: true });
        } catch (error) {
            console.error('Error during OTP verification:', error.response ? error.response.data : error.message);
            toast.error(`OTP verification failed: ${error.response ? error.response.data.message : error.message}`);
        }
    }


    return (
            <div className="min-h-screen relative flex items-center justify-center bg-gradient-to-r from-blue-50 to-cyan-50 font-sans p-4">
            <div className="relative w-full max-w-sm sm:max-w-md">
                {/* A well-defined card for the OTP form */}
                <div className="bg-white p-8 sm:p-12 rounded-2xl shadow-2xl transition-all duration-700 ease-in-out transform scale-100 opacity-100">
                    <div className="text-center mb-6">
                        <p className="text-lg text-gray-600 mb-2">We have sent an OTP to</p>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 break-words">
                            
                            {FormData.email}
                        </h1>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <input
                            type="text"
                            placeholder="Enter OTP"
                            name="otp"
                            value={FormData.otp}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 outline-none transition-all duration-200 text-center text-lg tracking-widest font-mono"
                        />
                        <button
                            type="submit"
                            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md transition-colors duration-300 transform hover:scale-105"
                        >
                            Submit
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default OTPconformationPage
