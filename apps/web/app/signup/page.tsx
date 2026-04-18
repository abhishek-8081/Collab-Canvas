"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../lib/api";

export default function SignUp() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiFetch("/signup", {
        method: "POST",
        body: JSON.stringify(form),
      });
      // Auto sign in after signup
      const data = await apiFetch("/signin", {
        method: "POST",
        body: JSON.stringify({ username: form.username, password: form.password }),
      });
      localStorage.setItem("token", data.token);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh", background: "var(--bg)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "2rem",
    }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "2.5rem", justifyContent: "center" }}>
          <span style={{
            width: 32, height: 32, borderRadius: 8, background: "var(--accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, color: "#000", fontSize: "1rem",
          }}>C</span>
          <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>CollabCanvas</span>
        </Link>

        <div style={{
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: 16, padding: "2.5rem",
        }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.4rem" }}>Create an account</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "2rem" }}>
            Join CollabCanvas — it&apos;s free
          </p>

          {error && (
            <div style={{
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 8, padding: "0.75rem 1rem", marginBottom: "1.5rem",
              color: "#ef4444", fontSize: "0.875rem",
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
            <div>
              <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block", marginBottom: "0.4rem" }}>
                Full Name
              </label>
              <input
                type="text" required placeholder="Your name" minLength={2}
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                style={inputStyle}
                onFocus={e => (e.currentTarget.style.borderColor = "var(--accent)")}
                onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block", marginBottom: "0.4rem" }}>
                Email
              </label>
              <input
                type="email" required placeholder="you@example.com"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                style={inputStyle}
                onFocus={e => (e.currentTarget.style.borderColor = "var(--accent)")}
                onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block", marginBottom: "0.4rem" }}>
                Password
              </label>
              <input
                type="password" required placeholder="••••••••" minLength={6}
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                style={inputStyle}
                onFocus={e => (e.currentTarget.style.borderColor = "var(--accent)")}
                onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")}
              />
            </div>
            <button type="submit" disabled={loading} style={{
              background: loading ? "var(--border)" : "var(--accent)",
              color: loading ? "var(--text-muted)" : "#000",
              fontWeight: 700, padding: "0.75rem", borderRadius: 8,
              border: "none", cursor: loading ? "not-allowed" : "pointer",
              fontSize: "0.95rem", marginTop: "0.5rem", transition: "background 0.2s",
            }}>
              {loading ? "Creating account…" : "Create Account →"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", marginTop: "1.5rem", color: "var(--text-muted)", fontSize: "0.875rem" }}>
          Already have an account?{" "}
          <Link href="/signin" style={{ color: "var(--accent)", fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", background: "var(--bg)", border: "1px solid var(--border)",
  borderRadius: 8, padding: "0.65rem 1rem", color: "var(--text)",
  fontSize: "0.95rem", outline: "none", transition: "border-color 0.2s",
};
