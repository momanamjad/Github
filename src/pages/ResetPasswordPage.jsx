import React, { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { apiClient } from "@/services/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setMessage("");

    if (!token) {
      setErrorMsg("Password reset token is missing. Please request a new link.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await apiClient("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password }),
      });
      setMessage(res.message || "Password reset successfully!");
      // Automatically redirect to home (login screen) after 3 seconds
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (err) {
      setErrorMsg(err.message || "Failed to reset password. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#0d1117] sm:bg-[#f6f8fa] text-[#24292f] dark:text-[#c9d1d9] font-sans p-4 sm:p-6">
      <div className="w-full max-w-[340px] sm:max-w-[440px] flex flex-col items-center">
        {/* Logo */}
        <div className="mb-6 text-[#24292f] dark:text-white">
          <Link to="/">
            <svg height="48" viewBox="0 0 16 16" version="1.1" width="48" fill="currentColor">
              <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.35 3.12.88 0 .48.01 1.03.01 1.24 0 .21-.15.46-.55.38A8.013 8.013 0 0 1 0 8c0-4.42 3.58-8 8-8z"></path>
            </svg>
          </Link>
        </div>

        <div className="w-full bg-transparent sm:bg-white sm:dark:bg-[#161b22] border-0 sm:border border-[#d0d7de] sm:dark:border-[#30363d] rounded-none sm:rounded-lg shadow-none sm:shadow-md p-2 sm:p-8">
          <h2 className="text-xl font-normal text-center mb-6 text-[#24292f] dark:text-white">
            Choose a new password
          </h2>

          {message && (
            <div className="mb-4 p-3 text-sm text-[#2da44e] bg-[#2da44e]/10 border border-[#2da44e]/30 rounded-md">
              {message} Redirecting to login...
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 p-3 text-sm text-[#ff7b72] bg-[#f85149]/10 border border-[#f85149]/30 rounded-md">
              {errorMsg}
            </div>
          )}

          {!message && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="block text-sm font-semibold mb-1.5 text-[#24292f] dark:text-white" htmlFor="password">
                  New password
                </Label>
                <Input
                  id="password"
                  type="password"
                  required
                  placeholder="New password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md focus:outline-none focus:border-[#0969da] dark:focus:border-[#58a6ff] text-sm text-[#1f2328] dark:text-white focus:ring-1 focus:ring-[#0969da] dark:focus:ring-[#58a6ff]"
                />
              </div>

              <div>
                <Label className="block text-sm font-semibold mb-1.5 text-[#24292f] dark:text-white" htmlFor="confirm-password">
                  Confirm new password
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  required
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md focus:outline-none focus:border-[#0969da] dark:focus:border-[#58a6ff] text-sm text-[#1f2328] dark:text-white focus:ring-1 focus:ring-[#0969da] dark:focus:ring-[#58a6ff]"
                />
              </div>

              <Button
                type="submit"
                disabled={loading || !token}
                className="w-full py-2 bg-[#238636] text-white text-sm font-semibold rounded-md hover:bg-[#2ea043] transition-colors focus:outline-none focus:ring-2 focus:ring-[#238636]/50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-h-[38px]"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  "Change password"
                )}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center text-sm border-t border-[#d0d7de] dark:border-[#30363d] pt-4">
            <p className="text-[#57606a] dark:text-[#8b949e]">
              Return to{" "}
              <Link
                to="/"
                className="text-[#0969da] dark:text-[#58a6ff] hover:underline cursor-pointer bg-transparent border-0 font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
