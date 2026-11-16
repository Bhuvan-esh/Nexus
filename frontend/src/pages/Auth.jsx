import React, { useState } from "react";
import { Mail, User, ShieldCheck, ArrowRight, AlertTriangle, CheckCircle, RefreshCw, Lock } from "lucide-react";
import {
  startEmailSignup,
  verifyEmailCode,
  completeSignupUsername,
  googleLoginStrict,
  credentialLogin,
} from "../services/api";

export function Auth({ onAuthSuccess }) {
  const [mainTab, setMainTab] = useState("signup"); // "signup" | "login"

  // Signup sub-steps: "email" -> "code" -> "username"
  const [signupStep, setSignupStep] = useState("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Form states
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [username, setUsername] = useState("");
  const [optionalPassword, setOptionalPassword] = useState("");
  const [codeHint, setCodeHint] = useState(null);

  // Login states
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [googleLoginEmail, setGoogleLoginEmail] = useState("");
  const [showGoogleLoginModal, setShowGoogleLoginModal] = useState(false);

  // ---------------- SIGN UP: STEP 1 (ENTER MAIL) ----------------
  const handleStartSignup = async (targetEmail) => {
    const mailToUse = targetEmail || email;
    if (!mailToUse.trim()) {
      setError("Please enter your email to receive a verification code.");
      return;
    }

    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await startEmailSignup(mailToUse.trim());
      setEmail(mailToUse.trim());
      setCodeHint(res.data?.code_hint || null);
      setSuccessMsg(`Verification code sent to ${mailToUse.trim()}! Check your mail.`);
      setSignupStep("code");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- SIGN UP: STEP 2 (VERIFY CODE) ----------------
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!verificationCode.trim()) {
      setError("Please enter the 6-digit code received on your email.");
      return;
    }

    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await verifyEmailCode(email, verificationCode.trim());
      setSuccessMsg("Code verified! Now choose your unique username to complete setup.");
      setSignupStep("username");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- SIGN UP: STEP 3 (CHOOSE USERNAME ONLY) ----------------
  const handleCompleteUsername = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError("Please enter your unique username.");
      return;
    }

    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await completeSignupUsername(
        email,
        username.trim(),
        optionalPassword || undefined
      );
      setSuccessMsg(`Welcome, @${username}! Logging you in...`);
      setTimeout(() => {
        onAuthSuccess(res.data);
      }, 500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- LOG IN: GOOGLE (STRICT: ONLY IF REGISTERED) ----------------
  const handleGoogleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!googleLoginEmail.trim()) {
      setError("Please enter your Google account email.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await googleLoginStrict(googleLoginEmail.trim());
      setShowGoogleLoginModal(false);
      onAuthSuccess(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- LOG IN: CREDENTIALS ----------------
  const handleCredentialLogin = async (e) => {
    e.preventDefault();
    if (!loginIdentifier.trim() || !loginPassword) {
      setError("Please enter your username/email and password.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await credentialLogin(loginIdentifier.trim(), loginPassword);
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
        {/* Header Branding */}
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
        <div className="flex bg-code p-1 rounded-xl border border-ink/8 mb-6">
          <button
            type="button"
            onClick={() => {
              setMainTab("signup");
              setError(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              mainTab === "signup"
                ? "bg-card text-ink shadow-sm"
                : "text-ink/60 hover:text-ink"
            }`}
          >
            Sign Up
          </button>
          <button
            type="button"
            onClick={() => {
              setMainTab("login");
              setError(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              mainTab === "login"
                ? "bg-card text-ink shadow-sm"
                : "text-ink/60 hover:text-ink"
            }`}
          >
            Log In
          </button>
        </div>

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
        {mainTab === "signup" && (
          <div>
            {/* ---------------- STEP 1: ENTER MAIL / GOOGLE ---------------- */}
            {signupStep === "email" && (
              <div className="space-y-4">
                {/* Google Sign Up Quick Trigger */}
                <button
                  type="button"
                  onClick={() => {
                    const promptEmail = window.prompt("Sign up with Google:\nEnter your Google Email address:");
                    if (promptEmail && promptEmail.trim()) {
                      handleStartSignup(promptEmail.trim());
                    }
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

                <div className="relative my-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-ink/8" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase font-mono">
                    <span className="bg-card px-2 text-ink/40">or enter your mail</span>
                  </div>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleStartSignup(email);
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-semibold text-ink/70 uppercase tracking-wider mb-1">
                      Enter your mail
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-ink/40 absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. bhuvanesh@example.com"
                        className="w-full bg-paper border border-ink/10 rounded-input py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-accent"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-accent text-card rounded-input text-xs font-semibold hover:opacity-90 shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? "Sending verification..." : "Get Verification Code"}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {/* ---------------- STEP 2: ENTER VERIFICATION CODE ---------------- */}
            {signupStep === "code" && (
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div className="p-3 bg-code rounded-lg text-xs font-mono text-ink/80 border border-ink/8">
                  We sent a 6-digit code to: <strong className="text-ink">{email}</strong>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink/70 uppercase tracking-wider mb-1">
                    Enter Verification Code
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
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-protected text-card rounded-input text-xs font-semibold hover:opacity-90 shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  {loading ? "Verifying..." : "Verify Code"}
                  <CheckCircle className="w-4 h-4" />
                </button>

                <div className="flex justify-between items-center text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => handleStartSignup(email)}
                    disabled={loading}
                    className="text-link hover:underline text-[11px] flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Resend code
                  </button>

                  <button
                    type="button"
                    onClick={() => setSignupStep("email")}
                    className="text-ink/50 hover:text-ink text-[11px]"
                  >
                    Change email
                  </button>
                </div>
              </form>
            )}

            {/* ---------------- STEP 3: CHOOSE USERNAME ONLY ---------------- */}
            {signupStep === "username" && (
              <form onSubmit={handleCompleteUsername} className="space-y-4">
                <div className="p-3 bg-protected/10 rounded-lg text-xs text-protected font-medium border border-protected/20">
                  ✓ Email verified! Now choose your unique username.
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink/70 uppercase tracking-wider mb-1">
                    Username (Must be unique)
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-ink/40 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. bhuvanesh"
                      className="w-full bg-paper border border-ink/10 rounded-input py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-accent"
                      autoFocus
                    />
                  </div>
                  <span className="text-[10px] text-ink/40 block mt-1">
                    This username will identify your transliterations and profile.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink/70 uppercase tracking-wider mb-1">
                    Password (Optional for direct login)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-ink/40 absolute left-3 top-3" />
                    <input
                      type="password"
                      value={optionalPassword}
                      onChange={(e) => setOptionalPassword(e.target.value)}
                      placeholder="Create a password"
                      className="w-full bg-paper border border-ink/10 rounded-input py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-ink text-card rounded-input text-xs font-semibold hover:bg-ink/90 shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  {loading ? "Completing setup..." : "Finish Registration & Enter NEXUS"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* ============================ TAB 2: LOG IN ============================== */}
        {/* ========================================================================= */}
        {mainTab === "login" && (
          <div className="space-y-4">
            {/* Google Log In Button (STRICT: ONLY IF REGISTERED) */}
            <button
              type="button"
              onClick={() => {
                setShowGoogleLoginModal(true);
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
            <p className="text-[10px] text-center text-ink/40 font-mono -mt-2">
              (Note: Google login only works if the email has already been registered)
            </p>

            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-ink/8" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-mono">
                <span className="bg-card px-2 text-ink/40">or log in with credentials</span>
              </div>
            </div>

            <form onSubmit={handleCredentialLogin} className="space-y-3">
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
          </div>
        )}
      </div>

      {/* Google Log In Modal (Prompts for Google email, checks if registered) */}
      {showGoogleLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-card border border-ink/10 rounded-card p-6 max-w-sm w-full shadow-2xl space-y-4">
            <h3 className="font-serif text-lg font-semibold text-ink">
              Sign In with Google
            </h3>
            <p className="text-xs text-ink/70">
              Per requirements, Google Sign-In strictly works <strong>only if your email has already been registered</strong>.
            </p>

            <form onSubmit={handleGoogleLoginSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] font-mono uppercase text-ink/50 mb-1">
                  Your Google Email
                </label>
                <input
                  type="email"
                  required
                  value={googleLoginEmail}
                  onChange={(e) => setGoogleLoginEmail(e.target.value)}
                  placeholder="your-google-email@gmail.com"
                  className="w-full bg-paper border border-ink/10 rounded-input p-2 text-xs text-ink focus:outline-none focus:border-accent"
                  autoFocus
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowGoogleLoginModal(false)}
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
    </div>
  );
}
