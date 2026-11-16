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
  try {
    const res = await fetch(`${BASE_URL}/api/transliterate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error(`Transliteration request failed: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.error("Transliterate error:", err);
    throw err;
  }
}

export { BASE_URL };
