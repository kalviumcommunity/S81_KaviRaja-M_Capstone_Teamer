
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from 'http';
import session from 'express-session';

import authRoutes from "./routes/authRoutes.js";
import configureSocket from './config/socket.js';
import chatRoutes from './routes/chatRoutes.js';
import pollRoutes from './routes/pollRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import scheduleRoutes from './routes/scheduleRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import meetingRoutes from './routes/meetingRoutes.js';
import { errorHandler } from './middleware/errorMiddleware.js';

const app = express();

const allowedOrigins = (process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "https://teamerwork.netlify.app",
    "https://s81-kaviraja-m-capstone-teamer-2.onrender.com"
  ]);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use((req, res, next) => {
  const origin = allowedOrigins.includes(req.headers.origin) ? req.headers.origin : allowedOrigins[0];
  res.header("Access-Control-Allow-Origin", origin);
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Serve uploaded avatars statically
app.use('/uploads/avatars', express.static(path.join(process.cwd(), 'server', 'uploads', 'avatars')));
app.use('/uploads/avatars', express.static(path.join(process.cwd(), 'uploads', 'avatars')));
// Serve payment QR codes statically
app.use('/uploads/payment_qr', express.static(path.join(process.cwd(), 'server', 'uploads', 'payment_qr')));
app.use('/uploads/payment_qr', express.static(path.join(process.cwd(), 'uploads', 'payment_qr')));

app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if using HTTPS
}));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("DB Connection Error:", err));

app.get('/', (req, res) => {
  console.log('Hello from backend');
  res.send('Hello from backend');
});

app.use("/api/auth", authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/meetings', meetingRoutes);

// Error middleware must be last
app.use(errorHandler);

const httpServer = createServer(app);
const io = configureSocket(httpServer);
app.set('io', io);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
