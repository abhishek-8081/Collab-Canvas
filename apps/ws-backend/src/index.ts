import "dotenv/config";
import WebSocket, { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { prismaClient } from "@repo/db/client";

const PORT = Number(process.env.PORT) || 8080;
const wss = new WebSocketServer({ port: PORT });

interface User {
  ws: WebSocket;
  rooms: string[];
  userId: string;
}

const users: User[] = [];

function checkUser(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded === "string" || !decoded.userId) return null;
    return decoded.userId;
  } catch {
    return null;
  }
}

wss.on("connection", function connection(ws, request) {
  const url = request.url;
  if (!url) return;

  const queryParams = new URLSearchParams(url.split("?")[1]);
  const token = queryParams.get("token") || "";
  const userId = checkUser(token);

  if (!userId) {
    ws.close();
    return;
  }

  const user: User = { userId, rooms: [], ws };
  users.push(user);

  ws.on("message", async function message(data) {
    const parsedData = JSON.parse(data as unknown as string);

    if (parsedData.type === "join_room") {
      user.rooms.push(String(parsedData.roomId));
    }

    if (parsedData.type === "leave_room") {
      user.rooms = user.rooms.filter((r) => r !== String(parsedData.roomId));
    }

    if (parsedData.type === "chat") {
      const roomId = parsedData.roomId;
      const message = parsedData.message;

      await prismaClient.chat.create({
        data: { roomId, message, userId },
      });

      users.forEach((u) => {
        if (u.rooms.includes(String(roomId))) {
          u.ws.send(JSON.stringify({ type: "chat", message, roomId }));
        }
      });
    }

    if (parsedData.type === "draw") {
      const roomId = Number(parsedData.roomId);
      const elements = parsedData.elements;

      await prismaClient.shape.upsert({
        where: { roomId },
        create: { roomId, elements: JSON.stringify(elements) },
        update: { elements: JSON.stringify(elements) },
      });

      users.forEach((u) => {
        if (u.rooms.includes(String(roomId)) && u.ws !== ws) {
          u.ws.send(JSON.stringify({ type: "draw", roomId, elements }));
        }
      });
    }
  });

  ws.on("close", () => {
    const idx = users.indexOf(user);
    if (idx !== -1) users.splice(idx, 1);
  });
});

console.log(`WebSocket server running on port ${PORT}`);
