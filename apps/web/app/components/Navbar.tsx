"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(!!localStorage.getItem("token"));
  }, []);

  function signOut() {
    localStorage.removeItem("token");
    router.push("/");
  }

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 2rem", height: "60px",
      background: "rgba(10,10,10,0.85)", backdropFilter: "blur(12px)",
      borderBottom: "1px solid var(--border)",
    }}>
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 700, fontSize: "1.1rem" }}>
        <span style={{
          width: 28, height: 28, borderRadius: 6,
          background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "0.9rem", fontWeight: 800, color: "#000",
        }}>C</span>
        CollabCanvas
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
        {loggedIn ? (
          <>
            <Link href="/dashboard" style={{ color: "var(--text-muted)", fontSize: "0.9rem", transition: "color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--text)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}>
              Dashboard
            </Link>
            <button onClick={signOut} style={{
              background: "transparent", border: "1px solid var(--border)",
              color: "var(--text-muted)", padding: "0.4rem 1rem",
              borderRadius: 6, cursor: "pointer", fontSize: "0.85rem", transition: "all 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}>
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link href="/signin" style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--text)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}>
              Sign In
            </Link>
            <Link href="/signup" style={{
              background: "var(--accent)", color: "#000", fontWeight: 600,
              padding: "0.4rem 1.1rem", borderRadius: 6, fontSize: "0.85rem", transition: "background 0.2s",
            }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--accent-hover)")}
              onMouseLeave={e => (e.currentTarget.style.background = "var(--accent)")}>
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
