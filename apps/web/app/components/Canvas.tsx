"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { apiFetch, WS_URL } from "../lib/api";

// ── Types ──────────────────────────────────────────────────────────────
type Tool = "pencil" | "rect" | "circle" | "line" | "arrow" | "eraser" | "select";

interface Point { x: number; y: number }

interface Shape {
  id: string;
  type: Tool;
  color: string;
  strokeWidth: number;
  points?: Point[];           // pencil / eraser
  x?: number; y?: number;    // rect, circle, line, arrow start
  w?: number; h?: number;    // rect
  rx?: number; ry?: number;  // circle radii
  x2?: number; y2?: number;  // line / arrow end
}

// ── Constants ──────────────────────────────────────────────────────────
const COLORS = ["#ffffff","#f97316","#ef4444","#facc15","#22c55e","#3b82f6","#a855f7","#ec4899","#000000"];
const WIDTHS = [2, 4, 8, 16];

const TOOLS: { id: Tool; label: string; icon: string }[] = [
  { id: "pencil",  label: "Pencil", icon: "✏️" },
  { id: "rect",    label: "Rect",   icon: "⬜" },
  { id: "circle",  label: "Circle", icon: "⭕" },
  { id: "line",    label: "Line",   icon: "╱" },
  { id: "arrow",   label: "Arrow",  icon: "↗" },
  { id: "eraser",  label: "Eraser", icon: "⌫" },
];

// ── Helpers ────────────────────────────────────────────────────────────
function uid() { return Math.random().toString(36).slice(2); }

function drawShape(ctx: CanvasRenderingContext2D, s: Shape, preview = false) {
  ctx.save();
  ctx.strokeStyle = s.type === "eraser" ? "#1e1e2e" : s.color;
  ctx.lineWidth   = s.strokeWidth;
  ctx.lineCap     = "round";
  ctx.lineJoin    = "round";
  if (preview) { ctx.globalAlpha = 0.7; }

  switch (s.type) {
    case "pencil":
    case "eraser": {
      if (!s.points || s.points.length < 2) break;
      ctx.beginPath();
      ctx.moveTo(s.points[0]!.x, s.points[0]!.y);
      for (let i = 1; i < s.points.length; i++) ctx.lineTo(s.points[i]!.x, s.points[i]!.y);
      ctx.stroke();
      break;
    }
    case "rect": {
      if (s.x == null || s.y == null || s.w == null || s.h == null) break;
      ctx.strokeRect(s.x, s.y, s.w, s.h);
      break;
    }
    case "circle": {
      if (s.x == null || s.y == null || s.rx == null || s.ry == null) break;
      ctx.beginPath();
      ctx.ellipse(s.x, s.y, Math.abs(s.rx), Math.abs(s.ry), 0, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    case "line": {
      if (s.x == null || s.y == null || s.x2 == null || s.y2 == null) break;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x2, s.y2);
      ctx.stroke();
      break;
    }
    case "arrow": {
      if (s.x == null || s.y == null || s.x2 == null || s.y2 == null) break;
      const dx = s.x2 - s.x, dy = s.y2 - s.y;
      const angle = Math.atan2(dy, dx);
      const len = 16 + s.strokeWidth * 2;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x2, s.y2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(s.x2, s.y2);
      ctx.lineTo(s.x2 - len * Math.cos(angle - 0.4), s.y2 - len * Math.sin(angle - 0.4));
      ctx.lineTo(s.x2 - len * Math.cos(angle + 0.4), s.y2 - len * Math.sin(angle + 0.4));
      ctx.closePath();
      ctx.fillStyle = s.color;
      ctx.fill();
      break;
    }
  }
  ctx.restore();
}

function redraw(ctx: CanvasRenderingContext2D, shapes: Shape[], preview?: Shape) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.fillStyle = "#1e1e2e";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  for (const s of shapes) drawShape(ctx, s);
  if (preview) drawShape(ctx, preview, true);
}

// ── Component ──────────────────────────────────────────────────────────
interface Props { slug: string; roomId: number }

export default function Canvas({ slug, roomId }: Props) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const wsRef      = useRef<WebSocket | null>(null);
  const shapesRef  = useRef<Shape[]>([]);
  const drawing    = useRef(false);
  const current    = useRef<Shape | null>(null);
  const isRemote   = useRef(false);

  const [tool,        setTool]        = useState<Tool>("pencil");
  const [color,       setColor]       = useState("#ffffff");
  const [width,       setWidth]       = useState(3);
  const [wsStatus,    setWsStatus]    = useState<"connecting"|"connected"|"disconnected">("connecting");
  const [, setUndoStack] = useState<Shape[][]>([]);

  // ── Canvas sizing ──────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current!;
    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      redraw(canvas.getContext("2d")!, shapesRef.current);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  // ── WebSocket + load shapes ────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx    = canvas.getContext("2d")!;

    apiFetch(`/shapes/${roomId}`).then(data => {
      if (data.elements?.length) {
        shapesRef.current = data.elements;
        redraw(ctx, shapesRef.current);
      }
    }).catch(() => {});

    const token = localStorage.getItem("token") || "";
    const ws = new WebSocket(`${WS_URL}?token=${token}`);
    wsRef.current = ws;

    ws.onopen  = () => { ws.send(JSON.stringify({ type: "join_room", roomId })); setWsStatus("connected"); };
    ws.onclose = () => setWsStatus("disconnected");
    ws.onerror = () => setWsStatus("disconnected");

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === "draw" && msg.roomId === roomId) {
        isRemote.current = true;
        shapesRef.current = msg.elements;
        redraw(ctx, shapesRef.current);
        isRemote.current = false;
      }
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "leave_room", roomId }));
      }
      ws.close();
    };
  }, [roomId]);

  // ── Broadcast helper ───────────────────────────────────────────────
  const broadcast = useCallback((shapes: Shape[]) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "draw", roomId, elements: shapes }));
    }
  }, [roomId]);

  // ── Mouse helpers ──────────────────────────────────────────────────
  function getPos(e: React.MouseEvent): Point {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  function onMouseDown(e: React.MouseEvent) {
    if (e.button !== 0) return;
    drawing.current = true;
    const p = getPos(e);
    const base = { id: uid(), type: tool, color: tool === "eraser" ? "#1e1e2e" : color, strokeWidth: tool === "eraser" ? width * 5 : width };

    switch (tool) {
      case "pencil": case "eraser": current.current = { ...base, points: [p] }; break;
      case "rect":   current.current = { ...base, x: p.x, y: p.y, w: 0, h: 0 }; break;
      case "circle": current.current = { ...base, x: p.x, y: p.y, rx: 0, ry: 0 }; break;
      case "line":   current.current = { ...base, x: p.x, y: p.y, x2: p.x, y2: p.y }; break;
      case "arrow":  current.current = { ...base, x: p.x, y: p.y, x2: p.x, y2: p.y }; break;
    }
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!drawing.current || !current.current) return;
    const p = getPos(e);
    const s = current.current;
    const ctx = canvasRef.current!.getContext("2d")!;

    switch (s.type) {
      case "pencil": case "eraser": s.points = [...(s.points || []), p]; break;
      case "rect":   s.w = p.x - (s.x ?? 0); s.h = p.y - (s.y ?? 0); break;
      case "circle": {
        // store origin in points[0], compute center+radii from origin each move
        const ox = s.points?.[0]?.x ?? s.x ?? p.x;
        const oy = s.points?.[0]?.y ?? s.y ?? p.y;
        if (!s.points) s.points = [{ x: ox, y: oy }];
        s.rx = (p.x - ox) / 2;
        s.ry = (p.y - oy) / 2;
        s.x  = ox + s.rx;
        s.y  = oy + s.ry;
        break;
      }
      case "line": case "arrow": s.x2 = p.x; s.y2 = p.y; break;
    }
    redraw(ctx, shapesRef.current, s);
  }

  function onMouseUp() {
    if (!drawing.current || !current.current) return;
    drawing.current = false;
    const s = current.current;
    current.current = null;
    const next = [...shapesRef.current, s];
    setUndoStack(u => [...u, shapesRef.current]);
    shapesRef.current = next;
    redraw(canvasRef.current!.getContext("2d")!, next);
    broadcast(next);
  }

  // ── Undo / Clear ───────────────────────────────────────────────────
  function undo() {
    setUndoStack(u => {
      if (!u.length) return u;
      const prev = u[u.length - 1]!;
      shapesRef.current = prev;
      redraw(canvasRef.current!.getContext("2d")!, prev);
      broadcast(prev);
      return u.slice(0, -1);
    });
  }

  function clearCanvas() {
    setUndoStack(u => [...u, shapesRef.current]);
    shapesRef.current = [];
    redraw(canvasRef.current!.getContext("2d")!, []);
    broadcast([]);
  }

  return (
    <div style={{ display: "flex", height: "100%", background: "#13131a" }}>

      {/* ── Left Toolbar ── */}
      <div style={{
        width: 64, display: "flex", flexDirection: "column", alignItems: "center",
        padding: "1rem 0", gap: "0.25rem",
        background: "#0f0f15", borderRight: "1px solid #2a2a3a",
        flexShrink: 0,
      }}>
        {/* Tools */}
        {TOOLS.map(t => (
          <button key={t.id} title={t.label} onClick={() => setTool(t.id)} style={{
            width: 40, height: 40, borderRadius: 8, border: "none", cursor: "pointer",
            background: tool === t.id ? "rgba(249,115,22,0.2)" : "transparent",
            outline: tool === t.id ? "1.5px solid var(--accent)" : "none",
            fontSize: "1.1rem", display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.15s",
          }}>
            {t.icon}
          </button>
        ))}

        <div style={{ width: 32, height: 1, background: "#2a2a3a", margin: "0.5rem 0" }} />

        {/* Colors */}
        {COLORS.map(c => (
          <button key={c} title={c} onClick={() => setColor(c)} style={{
            width: 22, height: 22, borderRadius: "50%", border: "none", cursor: "pointer",
            background: c,
            outline: color === c ? "2px solid var(--accent)" : "1.5px solid rgba(255,255,255,0.15)",
            outlineOffset: 1, transition: "all 0.15s",
          }} />
        ))}

        <div style={{ width: 32, height: 1, background: "#2a2a3a", margin: "0.5rem 0" }} />

        {/* Stroke widths */}
        {WIDTHS.map(w => (
          <button key={w} title={`${w}px`} onClick={() => setWidth(w)} style={{
            width: 40, height: 28, borderRadius: 6, border: "none", cursor: "pointer",
            background: width === w ? "rgba(249,115,22,0.2)" : "transparent",
            outline: width === w ? "1.5px solid var(--accent)" : "none",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{ width: 20, height: w, borderRadius: w, background: color, maxHeight: 16 }} />
          </button>
        ))}

        <div style={{ flex: 1 }} />

        {/* Undo */}
        <button title="Undo (Ctrl+Z)" onClick={undo} style={iconBtnStyle}>↩</button>
        {/* Clear */}
        <button title="Clear canvas" onClick={clearCanvas} style={{ ...iconBtnStyle, color: "#ef4444", marginBottom: "0.5rem" }}>🗑</button>
      </div>

      {/* ── Canvas ── */}
      <div style={{ flex: 1, position: "relative" }}>
        {/* Status */}
        <div style={{
          position: "absolute", top: 10, right: 10, zIndex: 10,
          display: "flex", alignItems: "center", gap: "0.4rem",
          background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
          border: "1px solid #2a2a3a", borderRadius: 20,
          padding: "0.25rem 0.75rem", fontSize: "0.72rem", color: "#888",
          pointerEvents: "none",
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: wsStatus === "connected" ? "#22c55e" : wsStatus === "connecting" ? "#f97316" : "#ef4444",
            display: "inline-block",
          }} />
          {wsStatus === "connected" ? slug : wsStatus === "connecting" ? "Connecting…" : "Disconnected — refresh"}
        </div>

        {/* Tool hint */}
        <div style={{
          position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)",
          background: "rgba(0,0,0,0.5)", borderRadius: 20, padding: "0.25rem 1rem",
          fontSize: "0.72rem", color: "#555", pointerEvents: "none",
        }}>
          {tool.charAt(0).toUpperCase() + tool.slice(1)} · {width}px
        </div>

        <canvas
          ref={canvasRef}
          style={{ display: "block", width: "100%", height: "100%", cursor: tool === "eraser" ? "cell" : "crosshair" }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        />
      </div>
    </div>
  );
}

const iconBtnStyle: React.CSSProperties = {
  width: 40, height: 36, borderRadius: 8, border: "none", cursor: "pointer",
  background: "transparent", fontSize: "1rem",
  display: "flex", alignItems: "center", justifyContent: "center",
  color: "#888", transition: "color 0.15s",
};
