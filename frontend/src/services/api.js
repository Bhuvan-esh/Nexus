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

// ---------------- 3-Step Authentication APIs ----------------

// Step 1: User enters email / Google signup email -> code sent to mail
export async function startEmailSignup(email) {
  const res = await fetch(`${BASE_URL}/api/auth/start-signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = await res.json().catch(() => ({ detail: res.statusText }));
  if (!res.ok) {
    throw new Error(data.detail || "Failed to start sign up.");
  }
  return data;
}

// Step 2: User enters verification code received on mail
export async function verifyEmailCode(email, code) {
  const res = await fetch(`${BASE_URL}/api/auth/verify-code`, {
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

// Step 3: Once verified, user chooses their unique username
export async function completeSignupUsername(email, username, password) {
  const res = await fetch(`${BASE_URL}/api/auth/complete-signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, username, password }),
  });
  const data = await res.json().catch(() => ({ detail: res.statusText }));
  if (!res.ok) {
    throw new Error(data.detail || "Failed to finalize registration.");
  }
  return data;
}

// Google Log In: ONLY works if the email has already been registered!
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

// Standard Login with Username / Email + Password
export async function credentialLogin(identifier, password) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, password }),
  });
  const data = await res.json().catch(() => ({ detail: res.statusText }));
  if (!res.ok) {
    throw new Error(data.detail || "Login failed.");
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
