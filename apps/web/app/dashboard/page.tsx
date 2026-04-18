"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../components/Navbar";
import { apiFetch } from "../lib/api";

interface Room {
  id: number;
  slug: string;
  createdAt: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [joinSlug, setJoinSlug] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/signin"); return; }
    fetchRooms();
  }, []);

  useEffect(() => {
    if (showCreate) setTimeout(() => inputRef.current?.focus(), 50);
  }, [showCreate]);

  async function fetchRooms() {
    try {
      const data = await apiFetch("/rooms");
      setRooms(data.rooms);
    } catch {
      router.push("/signin");
    } finally {
      setLoading(false);
    }
  }

  async function createRoom(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!newRoomName.trim()) return;
    setCreating(true);
    try {
      await apiFetch("/room", { method: "POST", body: JSON.stringify({ name: newRoomName.trim() }) });
      setNewRoomName("");
      setShowCreate(false);
      fetchRooms();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create room");
    } finally {
      setCreating(false);
    }
  }

  async function joinRoom(e: React.FormEvent) {
    e.preventDefault();
    if (!joinSlug.trim()) return;
    try {
      const data = await apiFetch(`/room/${joinSlug.trim()}`);
      router.push(`/canvas/${data.room.slug}`);
    } catch {
      setError("Room not found");
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "6rem 2rem 4rem" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 800, letterSpacing: "-0.02em" }}>Your Canvases</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.3rem" }}>
              Create or join a room to start drawing
            </p>
          </div>
          <button onClick={() => { setShowCreate(true); setError(""); }} style={{
            background: "var(--accent)", color: "#000", fontWeight: 700,
            padding: "0.6rem 1.4rem", borderRadius: 8, border: "none",
            cursor: "pointer", fontSize: "0.9rem",
          }}>
            + New Canvas
          </button>
        </div>

        {/* Create Room Modal */}
        {showCreate && (
          <div style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem",
          }} onClick={() => setShowCreate(false)}>
            <div style={{
              background: "var(--bg-card)", border: "1px solid var(--border)",
              borderRadius: 16, padding: "2rem", width: "100%", maxWidth: 400,
            }} onClick={e => e.stopPropagation()}>
              <h2 style={{ fontWeight: 800, marginBottom: "1.5rem" }}>Create New Canvas</h2>
              {error && <p style={{ color: "#ef4444", fontSize: "0.875rem", marginBottom: "1rem" }}>{error}</p>}
              <form onSubmit={createRoom} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <input
                  ref={inputRef} placeholder="Canvas name (e.g. project-alpha)"
                  value={newRoomName} required minLength={3} maxLength={20}
                  onChange={e => setNewRoomName(e.target.value)}
                  style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = "var(--accent)")}
                  onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")}
                />
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <button type="button" onClick={() => setShowCreate(false)} style={{
                    flex: 1, background: "transparent", border: "1px solid var(--border)",
                    color: "var(--text-muted)", padding: "0.65rem", borderRadius: 8, cursor: "pointer",
                  }}>Cancel</button>
                  <button type="submit" disabled={creating} style={{
                    flex: 1, background: "var(--accent)", color: "#000", fontWeight: 700,
                    padding: "0.65rem", borderRadius: 8, border: "none", cursor: "pointer",
                  }}>
                    {creating ? "Creating…" : "Create →"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Join Room */}
        <div style={{
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: 12, padding: "1.25rem 1.5rem", marginBottom: "2rem",
          display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap",
        }}>
          <span style={{ color: "var(--text-muted)", fontSize: "0.9rem", whiteSpace: "nowrap" }}>Join a canvas:</span>
          <form onSubmit={joinRoom} style={{ display: "flex", gap: "0.75rem", flex: 1, minWidth: 200 }}>
            <input
              placeholder="Enter room name / slug"
              value={joinSlug}
              onChange={e => { setJoinSlug(e.target.value); setError(""); }}
              style={{ ...inputStyle, flex: 1, margin: 0 }}
              onFocus={e => (e.currentTarget.style.borderColor = "var(--accent)")}
              onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")}
            />
            <button type="submit" style={{
              background: "transparent", border: "1px solid var(--accent)",
              color: "var(--accent)", padding: "0.6rem 1.2rem", borderRadius: 8,
              cursor: "pointer", fontWeight: 600, fontSize: "0.875rem", whiteSpace: "nowrap",
            }}>Join →</button>
          </form>
          {error && !showCreate && <p style={{ color: "#ef4444", fontSize: "0.8rem", width: "100%" }}>{error}</p>}
        </div>

        {/* Rooms Grid */}
        {loading ? (
          <div style={{ color: "var(--text-muted)", textAlign: "center", padding: "3rem" }}>Loading…</div>
        ) : rooms.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "5rem 2rem",
            border: "1px dashed var(--border)", borderRadius: 16,
            color: "var(--text-muted)",
          }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>✦</div>
            <p style={{ fontWeight: 600, marginBottom: "0.5rem" }}>No canvases yet</p>
            <p style={{ fontSize: "0.875rem" }}>Create your first canvas to start collaborating</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.25rem" }}>
            {rooms.map(room => (
              <Link key={room.id} href={`/canvas/${room.slug}`} style={{
                background: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: 12, padding: "1.5rem", display: "block",
                transition: "border-color 0.2s, background 0.2s",
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(249,115,22,0.5)";
                  (e.currentTarget as HTMLElement).style.background = "var(--bg-card-hover)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                  (e.currentTarget as HTMLElement).style.background = "var(--bg-card)";
                }}
              >
                <div style={{
                  width: "100%", height: 100, borderRadius: 8, marginBottom: "1rem",
                  background: "linear-gradient(135deg, rgba(249,115,22,0.08), rgba(249,115,22,0.02))",
                  border: "1px solid rgba(249,115,22,0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.8rem",
                }}>
                  ◈
                </div>
                <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: "0.3rem" }}>{room.slug}</h3>
                <p style={{ fontSize: "0.8rem", color: "var(--text-subtle)" }}>
                  Created {new Date(room.createdAt).toLocaleDateString()}
                </p>
                <p style={{ fontSize: "0.8rem", color: "var(--accent)", marginTop: "0.75rem", fontWeight: 600 }}>
                  Open Canvas →
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: "var(--bg)", border: "1px solid var(--border)",
  borderRadius: 8, padding: "0.6rem 1rem", color: "var(--text)",
  fontSize: "0.9rem", outline: "none", transition: "border-color 0.2s", width: "100%",
};
