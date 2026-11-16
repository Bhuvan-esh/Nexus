/**
 * API Service wrapper for NEXUS Backend
 */

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function checkHealth() {
  try {
    const res = await fetch(`${BASE_URL}/api/health`);
    if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.warn("Backend not reachable:", err.message);
    return { status: "offline" };
  }
}

export async function transliterateText(text) {
  const res = await fetch(`${BASE_URL}/api/transliterate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Transliteration failed");
  }
  return await res.json();
}

// ---------------- Authentication APIs ----------------

// Sign Up asking upfront:
// - Username
// - Enter your mail
// - Password
// - Confirm password
export async function signUpUser({ username, email, password, confirmPassword }) {
  const res = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username,
      email,
      password,
      confirm_password: confirmPassword,
    }),
  });
  const data = await res.json().catch(() => ({ detail: res.statusText }));
  if (!res.ok) {
    throw new Error(data.detail || "Sign up failed");
  }
  return data;
}

// Verification: User enters 6-digit code received on mail
export async function verifyEmailCode({ email, code }) {
  const res = await fetch(`${BASE_URL}/api/auth/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });
  const data = await res.json().catch(() => ({ detail: res.statusText }));
  if (!res.ok) {
    throw new Error(data.detail || "Verification code is invalid or expired.");
  }
  return data;
}

export async function resendVerificationCode(email) {
  const res = await fetch(`${BASE_URL}/api/auth/resend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = await res.json().catch(() => ({ detail: res.statusText }));
  if (!res.ok) {
    throw new Error(data.detail || "Failed to resend code");
  }
  return data;
}

// Log In:
// - Enter your mail / Username (unique username)
// - Enter your password
export async function loginUser({ identifier, password }) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, password }),
  });
  const data = await res.json().catch(() => ({ detail: res.statusText }));
  if (!res.ok) {
    if (res.status === 403 && data.detail?.needs_verification) {
      const err = new Error(data.detail.message || "Please verify your email.");
      err.needs_verification = true;
      err.email = data.detail.email;
      err.username = data.detail.username;
      throw err;
    }
    throw new Error(typeof data.detail === "string" ? data.detail : "Login failed");
  }
  return data;
}

// Sign in with Google: ONLY works if the mail has already been registered!
export async function googleLoginStrict(email) {
  const res = await fetch(`${BASE_URL}/api/auth/google-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = await res.json().catch(() => ({ detail: res.statusText }));
  if (!res.ok) {
    throw new Error(data.detail || "Google Log In failed.");
  }
  return data;
}

export async function getCurrentUser(token) {
  if (!token) return null;
  const res = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  return await res.json();
}

export { BASE_URL };
