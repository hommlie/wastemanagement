import React, { useState } from "react";
import { BASE_URL } from "../services/api";
import { toast } from "react-toastify";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpMode, setOtpMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ------------------------------------
  // Normal Login Handler
  // ------------------------------------
const handleLogin = async (e) => {
  e.preventDefault();
  if (!email || !password) {
    toast.error("Please enter email & password");
    return;
  }

  try {
    setLoading(true);

    const res = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok || !data.success) {
      toast.error(data.message || "Login failed");
      return;
    }

    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("access", JSON.stringify(data.access || []));;
    toast.success("Login successful!");

    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 800);

  } catch (err) {
    toast.error("Network or server error");
    setLoading(false);
  }
};
  // ------------------------------------
  // OTP SEND Handler
  // ------------------------------------
  const handleSendOTP = async () => {
    if (!email) {
      toast.error("Enter email first!");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${BASE_URL}/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok || !data.success) {
        toast.error(data.message || "Failed to send OTP");
        return;
      }

      toast.success("OTP sent to your email!");
      setOtpMode(true);
    } catch (error) {
      toast.error("Network or server error");
      setLoading(false);
    }
  };

  // ------------------------------------
  // Verify OTP Handler
  // ------------------------------------
  const handleVerifyOTP = async () => {
    if (!otp) {
      toast.error("Enter your OTP");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${BASE_URL}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok || !data.success) {
        toast.error(data.message || "Invalid OTP");
        return;
      }

      localStorage.setItem("user", JSON.stringify(data.user));
      toast.success("Login successful!");

      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 800);

    } catch (error) {
      toast.error("Network or server error");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* LEFT INFO SECTION */}
      <div
        className="md:flex w-full flex-col items-center justify-center text-white p-10 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://kswmp.org/wp-content/uploads/2022/03/component2.jpg')",
        }}
      >
        <h1 className="text-4xl font-bold mb-4 drop-shadow-lg">
          Welcome to Waste<br /> Management Portal
        </h1>
        <p className="text-lg opacity-90 mb-2 drop-shadow-md">
          Empowering Clean & Eco-Friendly Solutions
        </p>
        <p className="text-md font-semibold drop-shadow-md">Admin Dashboard</p>
      </div>

      {/* RIGHT LOGIN SECTION */}
      <div className="w-1/2 md:w-1/2 flex items-center justify-center bg-white p-6">
        <div className="w-full max-w-md bg-white shadow-xl p-8 rounded-xl">

          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            {otpMode ? "Login with OTP" : "Login"}
          </h2>

          {/* NORMAL LOGIN FORM */}
          {!otpMode && (
            <form className="space-y-4" onSubmit={handleLogin}>
              {/* Email */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="Enter email"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Password with show/hide */}
              <div className="relative">
                <label className="block text-sm text-gray-700 mb-1">Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                {/* Eye button */}
                <button
                  type="button"
                  className="absolute right-3 top-9 h-5 w-5 text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                </button>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full text-white py-2 rounded-lg flex justify-center items-center mt-4
                  ${loading ? "bg-gray-500" : "bg-green-700 hover:bg-green-800"}`}
              >
                {loading ? <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : "Login"}
              </button>

              {/* Switch to OTP Login */}
              <p className="text-center text-sm mt-3">
                <button
                  type="button"
                  onClick={handleSendOTP}
                  className="text-green-700 hover:underline"
                >
                  Login using OTP
                </button>
              </p>
            </form>
          )}

          {/* OTP LOGIN FORM */}
          {otpMode && (
            <div className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100"
                  readOnly
                />
              </div>

              {/* OTP */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">Enter OTP</label>
                <input
                  type="number"
                  placeholder="Enter OTP"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>

              {/* Verify OTP */}
              <button
                type="button"
                disabled={loading}
                onClick={handleVerifyOTP}
                className={`w-full text-white py-2 rounded-lg flex justify-center items-center mt-4
                  ${loading ? "bg-gray-500" : "bg-green-700 hover:bg-green-800"}`}
              >
                {loading ? <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : "Verify OTP"}
              </button>

              {/* Back to normal login */}
              <p className="text-center text-sm mt-3">
                <button
                  type="button"
                  onClick={() => setOtpMode(false)}
                  className="text-blue-600 hover:underline"
                >
                  Back to Password Login
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
