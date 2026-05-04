import "dotenv/config";
import express from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { middleware } from "./middleware.js";
import { CreateUserSchema, SiginUserSchema, CreateRoomSchema } from "@repo/common/types";
import { prismaClient } from "@repo/db/client";

const app = express();
app.use(express.json());

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";

app.use((_req, res, next) => {
  res.header("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.post("/signup", async (req, res) => {
  const parsedData = CreateUserSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json({ message: "Incorrect inputs" });
    return;
  }
  try {
    const user = await prismaClient.user.create({
      data: {
        email: parsedData.data.username,
        password: parsedData.data.password,
        name: parsedData.data.name,
      },
    });
    res.json({ userId: user.id });
  } catch (e) {
    console.error("Signup error:", e);
    res.status(411).json({ message: "Error during signup. It might be a database connection issue or the user already exists.", error: String(e) });
  }
});

app.post("/signin", async (req, res) => {
  const parsedData = SiginUserSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json({ message: "Incorrect inputs" });
    return;
  }
  const user = await prismaClient.user.findFirst({
    where: {
      email: parsedData.data.username,
      password: parsedData.data.password,
    },
  });
  if (!user) {
    res.status(403).json({ message: "Invalid credentials" });
    return;
  }
  const token = jwt.sign({ userId: user.id }, JWT_SECRET);
  res.json({ token });
});

app.post("/room", middleware, async (req, res) => {
  const parsedData = CreateRoomSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json({ message: "Incorrect inputs" });
    return;
  }
  // @ts-ignore
  const userId = req.userId;
  try {
    const room = await prismaClient.room.create({
      data: {
        slug: parsedData.data.name,
        adminId: userId,
      },
    });
    res.json({ roomId: room.id });
  } catch {
    res.status(411).json({ message: "Room already exists with this name" });
  }
});

app.get("/rooms", middleware, async (req, res) => {
  // @ts-ignore
  const userId = req.userId;
  const rooms = await prismaClient.room.findMany({
    where: { adminId: userId },
    orderBy: { createdAt: "desc" },
  });
  res.json({ rooms });
});

app.get("/room/:slug", async (req, res) => {
  const slug = req.params.slug;
  const room = await prismaClient.room.findFirst({ where: { slug } });
  if (!room) {
    res.status(404).json({ message: "Room not found" });
    return;
  }
  res.json({ room });
});

app.get("/chats/:roomId", async (req, res) => {
  const roomId = Number(req.params.roomId);
  const messages = await prismaClient.chat.findMany({
    where: { roomId },
    orderBy: { id: "desc" },
    take: 50,
  });
  res.json({ messages });
});

app.get("/shapes/:roomId", async (req, res) => {
  const roomId = Number(req.params.roomId);
  const shape = await prismaClient.shape.findUnique({ where: { roomId } });
  res.json({ elements: shape ? JSON.parse(shape.elements) : [] });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`HTTP server running on port ${PORT}`);
});
