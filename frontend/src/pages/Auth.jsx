import React, { useState } from "react";
import { Mail, User, Lock, ShieldCheck, ArrowRight, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";
import {
  signUpUser,
  googleSignUp,
  verifyEmailCode,
  resendVerificationCode,
  loginUser,
  googleLoginStrict,
} from "../services/api";

export function Auth({ onAuthSuccess }) {
  const [activeTab, setActiveTab] = useState("signup"); // "signup" | "login" | "verify"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Sign Up Form Fields (All 4 upfront as requested)
  const [signupUsername, setSignupUsername] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");

  // Verification Code State
  const [targetEmail, setTargetEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  // Log In Form Fields
  const [loginIdentifier, setLoginIdentifier] = useState(""); // mail or unique username
  const [loginPassword, setLoginPassword] = useState("");

  // Google Log In Modal
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmail, setGoogleEmail] = useState("");

  // Google Sign Up Modal & Accounts State
  const [showGoogleSignUpModal, setShowGoogleSignUpModal] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState("");
  const [showCustomGoogleInput, setShowCustomGoogleInput] = useState(false);

  // Suggested / available Google accounts list
  const googleAccountsList = [
    { email: "bhuvanj06@gmail.com", name: "Bhuvan", avatar: "B" },
  ];

  // ---------------- GOOGLE SIGN UP SUBMIT ----------------
  const handleGoogleSignUp = async (selectedEmail) => {
    if (!selectedEmail || !selectedEmail.includes("@")) {
      setError("Please select or enter a valid Google email address.");
      return;
    }

    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await googleSignUp(selectedEmail.trim());

      setTargetEmail(selectedEmail.trim());
      setShowGoogleSignUpModal(false);
      setShowCustomGoogleInput(false);
      setCustomGoogleEmail("");

      const assignedUsername = res.data?.username || selectedEmail.split("@")[0];
      setSuccessMsg(`Verification code sent to ${selectedEmail.trim()}! Default username assigned: "${assignedUsername}".`);
      setActiveTab("verify");
      startCooldown();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- SIGN UP SUBMIT ----------------
  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (signupPassword !== signupConfirmPassword) {
      setError("Passwords do not match. Please verify both entries.");
      return;
    }

    setLoading(true);
    try {
      const res = await signUpUser({
        username: signupUsername.trim(),
        email: signupEmail.trim(),
        password: signupPassword,
        confirmPassword: signupConfirmPassword,
      });

      setTargetEmail(signupEmail.trim());
      setSuccessMsg(`Verification code sent to ${signupEmail.trim()}! Please check your email inbox.`);
      setActiveTab("verify");
      startCooldown();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- VERIFY CODE SUBMIT ----------------
  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (!verificationCode.trim()) {
      setError("Please enter the 6-digit verification code received on your email.");
      return;
    }

    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await verifyEmailCode({
        email: targetEmail,
        code: verificationCode.trim(),
      });
      setSuccessMsg("Email verified successfully! Logging you in...");
      setTimeout(() => {
        onAuthSuccess(res.data);
      }, 500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError(null);
    setLoading(true);
    try {
      const res = await resendVerificationCode(targetEmail);
      setSuccessMsg("A new verification code has been dispatched to your email inbox.");
      startCooldown();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startCooldown = () => {
    setResendCooldown(45);
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // ---------------- LOG IN SUBMIT ----------------
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    setLoading(true);
    try {
      const res = await loginUser({
        identifier: loginIdentifier.trim(),
        password: loginPassword,
      });
      onAuthSuccess(res.data);
    } catch (err) {
      if (err.needs_verification) {
        setTargetEmail(err.email);
        setError("Your email has not been verified yet. Please enter the code sent to your mail.");
        setActiveTab("verify");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // ---------------- GOOGLE SIGN IN SUBMIT (STRICT) ----------------
  const handleGoogleSubmit = async (e) => {
    e.preventDefault();
    if (!googleEmail.trim()) {
      setError("Please enter your Google account email.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await googleLoginStrict(googleEmail.trim());
      setShowGoogleModal(false);
      onAuthSuccess(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-paper relative overflow-hidden">
      <div className="w-full max-w-md bg-card rounded-2xl border border-ink/8 p-7 sm:p-8 shadow-card relative z-10 animate-fade-in">
        {/* Top Header Branding */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-paper border border-ink/8 shadow-sm flex items-center justify-center mx-auto mb-3">
            <span className="font-serif text-2xl font-bold text-accent">A</span>
            <span className="font-kannada text-xl font-bold text-ink ml-0.5">ಕ</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-ink tracking-tight mb-1">
            NEXUS
          </h2>

          {/* Requested Headline */}
          <p className="text-sm font-serif italic text-accent font-medium">
            "Breaking Language Barriers, Connecting Meaning"
          </p>
        </div>

        {/* Tab Switcher: Sign Up vs Log In */}
        {activeTab !== "verify" && (
          <div className="flex bg-code p-1 rounded-xl border border-ink/8 mb-6">
            <button
              type="button"
              onClick={() => {
                setActiveTab("signup");
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "signup"
                  ? "bg-card text-ink shadow-sm"
                  : "text-ink/60 hover:text-ink"
              }`}
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("login");
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "login"
                  ? "bg-card text-ink shadow-sm"
                  : "text-ink/60 hover:text-ink"
              }`}
            >
              Log In
            </button>
          </div>
        )}

        {/* Error and Success Alerts */}
        {error && (
          <div className="mb-4 flex items-start gap-2 p-3 rounded-lg bg-attention/10 border border-attention/30 text-ink text-xs font-medium">
            <AlertTriangle className="w-4 h-4 text-attention flex-shrink-0 mt-0.5" />
            <span className="flex-1">{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 flex items-start gap-2 p-3 rounded-lg bg-protected/10 border border-protected/30 text-ink text-xs font-medium">
            <CheckCircle className="w-4 h-4 text-protected flex-shrink-0 mt-0.5" />
            <span className="flex-1">{successMsg}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* =========================== TAB 1: SIGN UP ============================== */}
        {/* ========================================================================= */}
        {activeTab === "signup" && (
          <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
            {/* 1. Username */}
            <div>
              <label className="block text-xs font-semibold text-ink/70 uppercase tracking-wider mb-1">
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-ink/40 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={signupUsername}
                  onChange={(e) => setSignupUsername(e.target.value)}
                  placeholder="e.g. bhuvanesh"
                  className="w-full bg-paper border border-ink/10 rounded-input py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            {/* 2. Enter your mail */}
            <div>
              <label className="block text-xs font-semibold text-ink/70 uppercase tracking-wider mb-1">
                Enter your mail
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-ink/40 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-paper border border-ink/10 rounded-input py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            {/* 3. Password */}
            <div>
              <label className="block text-xs font-semibold text-ink/70 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-ink/40 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-paper border border-ink/10 rounded-input py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            {/* 4. Confirm password */}
            <div>
              <label className="block text-xs font-semibold text-ink/70 uppercase tracking-wider mb-1">
                Confirm password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-ink/40 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={signupConfirmPassword}
                  onChange={(e) => setSignupConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-paper border border-ink/10 rounded-input py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-accent text-card rounded-input text-xs font-semibold hover:opacity-90 shadow-sm transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? "Sending verification..." : "Sign Up & Send Verification Code"}
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Divider */}
            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-ink/8" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-mono">
                <span className="bg-card px-2 text-ink/40">or</span>
              </div>
            </div>

            {/* Sign up with Google */}
            <button
              type="button"
              onClick={() => {
                setShowGoogleSignUpModal(true);
                setError(null);
              }}
              className="w-full py-2.5 bg-paper border border-ink/10 rounded-input text-xs font-semibold text-ink hover:bg-card hover:border-ink/20 shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Sign up with Google
            </button>
          </form>
        )}

        {/* ========================================================================= */}
        {/* ======================= VERIFICATION CODE SCREEN ======================== */}
        {/* ========================================================================= */}
        {activeTab === "verify" && (
          <form onSubmit={handleVerifySubmit} className="space-y-4 animate-fade-in">
            <div className="p-3 bg-code rounded-lg text-xs font-mono text-ink/80 border border-ink/8">
              Verification code dispatched to: <strong className="text-ink">{targetEmail}</strong>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink/70 uppercase tracking-wider mb-1">
                Enter 6-Digit Verification Code
              </label>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 text-ink/40 absolute left-3 top-3" />
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="123456"
                  className="w-full bg-paper border border-ink/10 rounded-input py-2.5 pl-9 pr-3 text-lg font-mono font-bold tracking-widest text-ink focus:outline-none focus:border-accent text-center"
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-protected text-card rounded-input text-xs font-semibold hover:opacity-90 shadow-sm transition-all flex items-center justify-center gap-2"
            >
              {loading ? "Verifying..." : "Verify & Complete Log In"}
              <CheckCircle className="w-4 h-4" />
            </button>

            <div className="flex justify-between items-center text-xs pt-1">
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0 || loading}
                className={`flex items-center gap-1 font-medium ${
                  resendCooldown > 0 ? "text-ink/40" : "text-link hover:underline"
                }`}
              >
                <RefreshCw className="w-3 h-3" />
                {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend code"}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("login")}
                className="text-ink/50 hover:text-ink text-xs underline"
              >
                Back to Login
              </button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* ============================ TAB 2: LOG IN ============================== */}
        {/* ========================================================================= */}
        {activeTab === "login" && (
          <div className="space-y-4">
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              {/* 1. Enter your mail / Username */}
              <div>
                <label className="block text-xs font-semibold text-ink/70 uppercase tracking-wider mb-1">
                  Enter your mail / Username
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-ink/40 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="Username or email"
                    className="w-full bg-paper border border-ink/10 rounded-input py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              {/* 2. Enter your password */}
              <div>
                <label className="block text-xs font-semibold text-ink/70 uppercase tracking-wider mb-1">
                  Enter your password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-ink/40 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-paper border border-ink/10 rounded-input py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-ink text-card rounded-input text-xs font-semibold hover:bg-ink/90 shadow-sm transition-all flex items-center justify-center gap-2 mt-2"
              >
                {loading ? "Logging in..." : "Log In"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-ink/8" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-mono">
                <span className="bg-card px-2 text-ink/40">or</span>
              </div>
            </div>

            {/* Sign in with Google (STRICT: only works if mail already registered) */}
            <div>
              <button
                type="button"
                onClick={() => {
                  setShowGoogleModal(true);
                  setError(null);
                }}
                className="w-full py-2.5 bg-paper border border-ink/10 rounded-input text-xs font-semibold text-ink hover:bg-card hover:border-ink/20 shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Sign in with Google
              </button>
              <p className="text-[10px] text-center text-ink/40 font-mono mt-1">
                (Only works if the mail has already been registered)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Google Log In Modal (Prompts for Google email, checks if registered) */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-card border border-ink/10 rounded-card p-6 max-w-sm w-full shadow-2xl space-y-4">
            <h3 className="font-serif text-lg font-semibold text-ink">
              Sign In with Google
            </h3>
            <p className="text-xs text-ink/70">
              Google Sign-In strictly functions <strong>only if your email has already been registered</strong> in NEXUS.
            </p>

            <form onSubmit={handleGoogleSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] font-mono uppercase text-ink/50 mb-1">
                  Your Google Email
                </label>
                <input
                  type="email"
                  required
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  placeholder="your-google-email@gmail.com"
                  className="w-full bg-paper border border-ink/10 rounded-input p-2 text-xs text-ink focus:outline-none focus:border-accent"
                  autoFocus
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowGoogleModal(false)}
                  className="px-3 py-1.5 rounded-input text-xs font-medium text-ink/60 hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-1.5 rounded-input text-xs font-semibold bg-accent text-card hover:opacity-90 transition-opacity"
                >
                  {loading ? "Verifying..." : "Verify & Log In"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Google Sign Up Modal (Shows list of accounts you can register with) */}
      {showGoogleSignUpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-card border border-ink/10 rounded-card p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="text-center">
              <svg className="w-8 h-8 mx-auto mb-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <h3 className="font-serif text-lg font-semibold text-ink">
                Choose an account
              </h3>
              <p className="text-xs text-ink/60">
                to sign up and register for NEXUS
              </p>
            </div>

            <p className="text-[11px] text-ink/70 bg-paper p-2.5 rounded-lg border border-ink/8 leading-relaxed">
              <strong>Mandatory verification:</strong> A 6-digit code will be sent to your email. Your username will automatically default to your email address handle.
            </p>

            {/* List of Mails to Register With */}
            <div className="space-y-2">
              <span className="block text-[10px] font-mono uppercase text-ink/40 tracking-wider">
                Select an account:
              </span>
              {googleAccountsList.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  disabled={loading}
                  onClick={() => handleGoogleSignUp(acc.email)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-ink/10 hover:border-accent hover:bg-paper transition-all text-left group"
                >
                  <div className="w-8 h-8 rounded-full bg-accent/15 text-accent font-bold text-sm flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    {acc.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-ink truncate">{acc.name}</p>
                    <p className="text-[11px] text-ink/60 truncate">{acc.email}</p>
                  </div>
                  <span className="text-[10px] font-mono text-accent bg-accent/10 px-1.5 py-0.5 rounded">
                    @{acc.email.split("@")[0]}
                  </span>
                </button>
              ))}

              {/* Use Another Google Account Toggle */}
              {!showCustomGoogleInput ? (
                <button
                  type="button"
                  onClick={() => setShowCustomGoogleInput(true)}
                  className="w-full py-2 px-3 text-xs text-ink/60 hover:text-ink border border-dashed border-ink/15 rounded-xl hover:bg-paper transition-all text-center font-medium"
                >
                  + Use another Google account
                </button>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleGoogleSignUp(customGoogleEmail);
                  }}
                  className="p-3 bg-paper rounded-xl border border-ink/10 space-y-2"
                >
                  <label className="block text-[10px] font-mono uppercase text-ink/50">
                    Enter Google Mail
                  </label>
                  <input
                    type="email"
                    required
                    value={customGoogleEmail}
                    onChange={(e) => setCustomGoogleEmail(e.target.value)}
                    placeholder="your-name@gmail.com"
                    className="w-full bg-card border border-ink/10 rounded-input p-2 text-xs text-ink focus:outline-none focus:border-accent"
                    autoFocus
                  />
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowCustomGoogleInput(false)}
                      className="px-2.5 py-1 text-xs text-ink/50 hover:text-ink"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-3 py-1 bg-accent text-card text-xs font-semibold rounded-input hover:opacity-90"
                    >
                      {loading ? "Sending..." : "Register & Send Code"}
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowGoogleSignUpModal(false);
                  setShowCustomGoogleInput(false);
                }}
                className="px-3 py-1.5 rounded-input text-xs font-medium text-ink/60 hover:text-ink"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
