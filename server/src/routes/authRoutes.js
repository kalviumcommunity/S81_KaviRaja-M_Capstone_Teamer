import express from "express";
import { register, login, logout, getProfile, searchUsers } from "../controllers/authController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/profile", protect, getProfile);
router.get('/search', protect, searchUsers);
export default router; 