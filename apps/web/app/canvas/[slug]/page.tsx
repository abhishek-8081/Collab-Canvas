"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "../../lib/api";

const Canvas = dynamic(() => import("../../components/CollabCanvasBoard"), {
  ssr: false,
  loading: () => <LoadingCanvas />,
});

interface Room { id: number; slug: string; createdAt: string }

function LoadingCanvas() {
  return (
    <div style={{
      width: "100%", height: "100%", display: "flex", alignItems: "center",
      justifyContent: "center", background: "#1e1e2e", flexDirection: "column", gap: "1rem",
    }}>
      <div style={{
        width: 40, height: 40, border: "3px solid #2a2a3a",
        borderTop: "3px solid var(--accent)", borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
      <p style={{ color: "#555", fontSize: "0.875rem" }}>Loading canvas…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function CanvasPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("token")) { router.push("/signin"); return; }
    apiFetch(`/room/${slug}`)
      .then(d => setRoom(d.room))
      .catch(() => setError("Room not found"));
  }, [slug, router]);

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (error) return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "1rem" }}>
      <p style={{ color: "#ef4444", fontWeight: 700 }}>Room not found</p>
      <Link href="/dashboard" style={{ color: "var(--accent)", fontSize: "0.9rem" }}>← Back to Dashboard</Link>
    </div>
  );

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>

      {/* Top Bar */}
      <div style={{
        height: 50, flexShrink: 0, display: "flex", alignItems: "center",
        justifyContent: "space-between", padding: "0 1rem",
        background: "#0f0f15", borderBottom: "1px solid #2a2a3a", zIndex: 20,
      }}>
        {/* Left */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link href="/dashboard" style={{ color: "#555", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.3rem" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#888")}
            onMouseLeave={e => (e.currentTarget.style.color = "#555")}>
            ← Back
          </Link>
          <div style={{ width: 1, height: 18, background: "#2a2a3a" }} />
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{
              width: 24, height: 24, borderRadius: 6,
              background: "rgba(249,115,22,0.15)", border: "1px solid rgba(249,115,22,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem",
            }}>◈</span>
            <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "#ddd" }}>{slug}</span>
          </div>
        </div>

        {/* Center logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: 800, fontSize: "0.95rem", color: "#ddd" }}>
          <span style={{
            width: 26, height: 26, borderRadius: 6, background: "var(--accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 900, color: "#000", fontSize: "0.75rem",
          }}>C</span>
          CollabCanvas
        </Link>

        {/* Right */}
        <button onClick={copyLink} style={{
          background: copied ? "rgba(34,197,94,0.15)" : "transparent",
          border: `1px solid ${copied ? "rgba(34,197,94,0.4)" : "#2a2a3a"}`,
          color: copied ? "#22c55e" : "#666",
          padding: "0.35rem 1rem", borderRadius: 8,
          cursor: "pointer", fontSize: "0.8rem", fontWeight: 600,
          transition: "all 0.2s",
        }}>
          {copied ? "✓ Copied!" : "Share Link"}
        </button>
      </div>

      {/* Canvas */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        {room ? <Canvas slug={slug} roomId={room.id} /> : <LoadingCanvas />}
      </div>
    </div>
  );
}
