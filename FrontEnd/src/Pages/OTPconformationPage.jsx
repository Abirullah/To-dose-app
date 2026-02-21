import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from "react-toastify";
import api from "../lib/api";
import AuthShell from "../Components/AuthShell";

function OTPconformationPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const lastAutoSubmittedOtpRef = useRef("");
    const [verifying, setVerifying] = useState(false);
    const [FormData, setFormData] = useState({
            email: location.state?.Email || "",
             otp: ""
    })
    const handleChange = (e) =>{
        const nextValue =
          e.target.name === "otp"
            ? String(e.target.value || "").replace(/\D/g, "").slice(0, 6)
            : e.target.value;
        setFormData({ ...FormData, [e.target.name]: nextValue });
    }

    const verifyOtp = async (otp) => {
        if (!FormData.email || !otp || otp.length < 6 || verifying) return;
        setVerifying(true);
        try {
            const response = await api.post('/users/VerifyOTP', {
                email: FormData.email,
                otp
            });
            console.log('Server Response:', response.data);
            // here i want to redirect to login page
            toast.success("OTP verified successfully! You can now log in.");
            navigate("/AccountLogin", { replace: true });
        } catch (error) {
            console.error('Error during OTP verification:', error.response ? error.response.data : error.message);
            toast.error(`OTP verification failed: ${error.response ? error.response.data.message : error.message}`);
        } finally {
            setVerifying(false);
        }
    }

    const handleSubmit = async (e) =>{
        e.preventDefault();
        await verifyOtp(FormData.otp);
    }

    useEffect(() => {
      if (!FormData.email || FormData.otp.length !== 6 || verifying) return;
      if (lastAutoSubmittedOtpRef.current === FormData.otp) return;
      lastAutoSubmittedOtpRef.current = FormData.otp;
      verifyOtp(FormData.otp);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [FormData.otp, FormData.email, verifying]);


    return (
      <AuthShell
        title="Confirm OTP"
        subtitle={`We sent a code to ${FormData.email || "your email"}.`}
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-bold text-white/60">OTP</label>
            <input
              type="text"
              placeholder="Enter OTP"
              name="otp"
              value={FormData.otp}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-2xl bg-white/5 px-4 py-3 text-center font-mono text-lg font-black tracking-[0.35em] text-white ring-1 ring-white/10 outline-none placeholder:text-white/30 focus:ring-white/25"
              inputMode="numeric"
            />
          </div>

	          <button
	            type="submit"
                disabled={verifying || FormData.otp.length < 6}
	            className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-black text-[#070A18] shadow-lg shadow-white/10 ring-1 ring-white/20 transition hover:-translate-y-0.5"
	          >
	            {verifying ? "Verifying..." : "Verify OTP"}
	          </button>

          <p className="pt-2 text-center text-sm text-white/60">
            Back to{" "}
            <button
              type="button"
              onClick={() => navigate("/AccountLogin")}
              className="font-black text-white hover:underline"
            >
              Login
            </button>
          </p>
        </form>
      </AuthShell>
    )
}

export default OTPconformationPage
