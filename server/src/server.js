
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
import passport from './config/passport.js';

const app = express();

import { allowedOrigins } from './config/corsConfig.js';

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Serve payment QR codes statically
const uploadsBase = path.join(__dirname, '../../uploads');
app.use('/uploads/payment_qr', express.static(path.join(uploadsBase, 'payment_qr')));

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
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
