import bcrypt from "bcryptjs";
import { User } from "../models/userModel.js";
import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";

// Register user
export const register = asyncHandler(async (req, res) => {
  const { username, name, email, password } = req.body;

  if (!username || !name || !email || !password) {
    res.status(400);
    throw new Error("All fields are required");
  }

  const normalizedEmail = email.trim().toLowerCase();

  const userExists = await User.findOne({ username });
  if (userExists) {
    res.status(400);
    throw new Error("Username already exists. Please choose a different username.");
  }

  const emailExists = await User.findOne({
    email: { $regex: `^${normalizedEmail}$`, $options: 'i' }
  });
  if (emailExists) {
    res.status(400);
    throw new Error("User already exists with this email. Please use a different email address.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    username,
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword
  });

  if (user) {
    const token = user.generateToken();
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "Strict"
    });

    res.status(201).json({
      message: "User registered successfully",
      user,
      token
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// Login user
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    res.status(400);
    throw new Error("Invalid credentials");
  }

  if (!user.password) {
    res.status(500);
    throw new Error("User record corrupted: no password hash.");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    res.status(400);
    throw new Error("Invalid credentials");
  }

  const token = user.generateToken();
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "Strict"
  });

  res.status(200).json({ message: "Login successful", user, token });
});

// Logout user
export const logout = asyncHandler(async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logout successful" });
});

// Get user profile
export const getProfile = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json(user);
});

// Search users
export const searchUsers = asyncHandler(async (req, res) => {
  const query = req.query.q;
  if (!query) return res.json([]);
  const users = await User.find({
    $or: [
      { username: { $regex: query, $options: 'i' } },
      { name: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } }
    ]
  }).select('-password');
  res.json(users);
});

// Update UPI ID
export const updateUPIId = asyncHandler(async (req, res) => {
  const { upiId } = req.body;
  if (!upiId) {
    res.status(400);
    throw new Error('No UPI ID provided');
  }
  req.user.upiId = upiId;
  await req.user.save();
  res.json({ upiId });
});

// Upload/Update user avatar
export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }
  const avatarUrl = `/uploads/avatars/${req.file.filename}`;
  req.user.avatar = avatarUrl;
  req.user.avatarUpdatedAt = new Date();
  await req.user.save();

  const io = req.app.get('io');
  if (io) {
    io.emit('user_avatar_updated', { userId: req.user._id, avatar: avatarUrl, avatarUpdatedAt: req.user.avatarUpdatedAt });
  }

  res.json({ avatar: avatarUrl, avatarUpdatedAt: req.user.avatarUpdatedAt });
});

// Get all users' performance
export const getAllUsersPerformance = asyncHandler(async (req, res) => {
  const users = await User.find({}, 'name performanceScore');
  res.json(users);
});

// Upload payment QR
export const uploadPaymentQr = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }
  const qrUrl = `/uploads/payment_qr/${req.file.filename}`;
  req.user.paymentQr = qrUrl;
  await req.user.save();
  res.json({ paymentQr: qrUrl });
});

// Get another user's profile
export const getUserProfile = asyncHandler(async (req, res) => {
  const userId = req.params.userId;
  const user = await User.findById(userId).select('-password');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json(user);
});
