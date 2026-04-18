"use client";
import Link from "next/link";
import Navbar from "./components/Navbar";

const features = [
  {
    num: "01",
    icon: "✦",
    title: "Real-time Collaboration",
    desc: "Draw, sketch, and ideate with your team simultaneously. See every stroke in real time.",
  },
  {
    num: "02",
    icon: "◈",
    title: "Smart Canvas",
    desc: "Pencil, shapes, arrows and more on a dark infinite canvas — built custom for CollabCanvas.",
  },
  {
    num: "03",
    icon: "⬡",
    title: "Instant Sharing",
    desc: "Create a room and share the link. Anyone with access can join and collaborate instantly.",
  },
];

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />

      {/* Hero */}
      <section style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "6rem 2rem 4rem", textAlign: "center", position: "relative", overflow: "hidden",
      }}>
        {/* Subtle radial glow */}
        <div style={{
          position: "absolute", top: "30%", left: "50%", transform: "translate(-50%, -50%)",
          width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{
          display: "inline-flex", alignItems: "center", gap: "0.5rem",
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: 20, padding: "0.3rem 1rem", marginBottom: "2rem",
          fontSize: "0.8rem", color: "var(--text-muted)",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
          Now in beta — free to use
        </div>

        <h1 style={{
          fontSize: "clamp(2.8rem, 7vw, 5.5rem)", fontWeight: 800, lineHeight: 1.05,
          letterSpacing: "-0.03em", marginBottom: "1.5rem", maxWidth: 800,
        }}>
          There is a Better Way{" "}
          <span style={{ color: "var(--accent)" }}>to Create</span>{" "}
          Together.
        </h1>

        <p style={{
          fontSize: "1.15rem", color: "var(--text-muted)", maxWidth: 520,
          lineHeight: 1.7, marginBottom: "2.5rem",
        }}>
          CollabCanvas is a real-time collaborative whiteboard. Sketch ideas, draw diagrams, and
          plan together — no matter where your team is.
        </p>

        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
          <Link href="/signup" style={{
            background: "var(--accent)", color: "#000", fontWeight: 700,
            padding: "0.75rem 2rem", borderRadius: 8, fontSize: "1rem",
            display: "flex", alignItems: "center", gap: "0.5rem", transition: "background 0.2s",
          }}>
            Get Started Free →
          </Link>
          <Link href="/signin" style={{
            background: "transparent", color: "var(--text)", fontWeight: 500,
            padding: "0.75rem 2rem", borderRadius: 8, fontSize: "1rem",
            border: "1px solid var(--border)", transition: "border-color 0.2s",
          }}>
            Sign In
          </Link>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "5rem 2rem", maxWidth: 1100, margin: "0 auto" }}>
        <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "3rem", textAlign: "center" }}>
          What you get
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
          {features.map((f) => (
            <div key={f.num} style={{
              background: "var(--bg-card)", border: "1px solid var(--border)",
              borderRadius: 14, padding: "2rem",
              transition: "border-color 0.25s, background 0.25s",
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(249,115,22,0.4)";
                (e.currentTarget as HTMLDivElement).style.background = "var(--bg-card-hover)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
                (e.currentTarget as HTMLDivElement).style.background = "var(--bg-card)";
              }}
            >
              <p style={{ color: "var(--text-subtle)", fontSize: "0.75rem", marginBottom: "1.2rem", letterSpacing: "0.1em" }}>/ {f.num}</p>
              <div style={{
                width: 48, height: 48, borderRadius: 10, marginBottom: "1.2rem",
                background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.4rem", color: "var(--accent)",
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "0.6rem" }}>{f.title}</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: "5rem 2rem", textAlign: "center",
        borderTop: "1px solid var(--border)",
      }}>
        <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", fontWeight: 800, marginBottom: "1rem", letterSpacing: "-0.02em" }}>
          Start drawing together
        </h2>
        <p style={{ color: "var(--text-muted)", marginBottom: "2rem", fontSize: "1rem" }}>
          Free forever. No credit card required.
        </p>
        <Link href="/signup" style={{
          background: "var(--accent)", color: "#000", fontWeight: 700,
          padding: "0.8rem 2.5rem", borderRadius: 8, fontSize: "1rem", display: "inline-block",
        }}>
          Create Your Canvas →
        </Link>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid var(--border)", padding: "1.5rem 2rem",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: "1rem",
      }}>
        <span style={{ fontSize: "0.85rem", color: "var(--text-subtle)" }}>
          © 2025 CollabCanvas
        </span>
        <span style={{ fontSize: "0.85rem", color: "var(--text-subtle)" }}>
          Built with Next.js + WebSockets
        </span>
      </footer>
    </div>
  );
}
