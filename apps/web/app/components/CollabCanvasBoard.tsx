"use client";
import { useEffect, useRef, useCallback, useState } from "react";
import { Excalidraw, MainMenu, WelcomeScreen } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import { WS_URL, apiFetch } from "../lib/api";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type API = any;

interface Props {
  slug: string;
  roomId: number;
}

export default function CollabCanvasBoard({ slug, roomId }: Props) {
  const [api, setApi] = useState<API>(null);
  const wsRef       = useRef<WebSocket | null>(null);
  const isRemote    = useRef(false);
  const debounce    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [status, setStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");

  useEffect(() => {
    if (!api) return;

    apiFetch(`/shapes/${roomId}`)
      .then(d => { if (d.elements?.length) api.updateScene({ elements: d.elements }); })
      .catch(() => {});

    const token = localStorage.getItem("token") || "";
    const ws = new WebSocket(`${WS_URL}?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "join_room", roomId }));
      setStatus("connected");
    };
    ws.onclose = () => setStatus("disconnected");
    ws.onerror = () => setStatus("disconnected");
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === "draw" && msg.roomId === roomId) {
        isRemote.current = true;
        api.updateScene({ elements: msg.elements });
        setTimeout(() => { isRemote.current = false; }, 60);
      }
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN)
        ws.send(JSON.stringify({ type: "leave_room", roomId }));
      ws.close();
    };
  }, [api, roomId]);

  const onChange = useCallback((elements: unknown[]) => {
    if (isRemote.current) return;
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN)
        wsRef.current.send(JSON.stringify({ type: "draw", roomId, elements }));
    }, 80);
  }, [roomId]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* Live badge */}
      <div style={{
        position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)",
        zIndex: 10, display: "flex", alignItems: "center", gap: "0.4rem",
        background: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)",
        border: "1px solid rgba(0,0,0,0.1)", borderRadius: 20,
        padding: "0.2rem 0.8rem", fontSize: "0.72rem", color: "#555",
        pointerEvents: "none", boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
      }}>
        <span style={{
          width: 6, height: 6, borderRadius: "50%", display: "inline-block",
          background: status === "connected" ? "#22c55e" : status === "connecting" ? "#f97316" : "#ef4444",
        }} />
        {status === "connected" ? `CollabCanvas · ${slug}` : status === "connecting" ? "Connecting…" : "Disconnected — refresh"}
      </div>

      <Excalidraw
        excalidrawAPI={(a) => setApi(a)}
        onChange={(elements) => onChange(elements as unknown[])}
        UIOptions={{
          canvasActions: {
            export: { saveFileToDisk: true },
            loadScene: true,
            saveToActiveFile: false,
            changeViewBackgroundColor: true,
          },
        }}
      >
        <MainMenu>
          <MainMenu.DefaultItems.LoadScene />
          <MainMenu.DefaultItems.Export />
          <MainMenu.DefaultItems.SaveAsImage />
          <MainMenu.DefaultItems.ClearCanvas />
          <MainMenu.DefaultItems.ToggleTheme />
          <MainMenu.DefaultItems.ChangeCanvasBackground />
        </MainMenu>
        <WelcomeScreen>
          <WelcomeScreen.Hints.ToolbarHint />
          <WelcomeScreen.Center>
            <WelcomeScreen.Center.Logo>
              <span style={{ fontWeight: 800, fontSize: "1.1rem" }}>CollabCanvas</span>
            </WelcomeScreen.Center.Logo>
            <WelcomeScreen.Center.Heading>
              Draw together, in real time.
            </WelcomeScreen.Center.Heading>
            <WelcomeScreen.Center.Menu>
              <WelcomeScreen.Center.MenuItemHelp />
            </WelcomeScreen.Center.Menu>
          </WelcomeScreen.Center>
        </WelcomeScreen>
      </Excalidraw>
    </div>
  );
}
