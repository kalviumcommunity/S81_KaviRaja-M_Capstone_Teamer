import express from "express";
import { register, login, logout, getProfile, getUserProfile, searchUsers, uploadAvatar, uploadPaymentQr, getAllUsersPerformance, updateUPIId } from "../controllers/authController.js";
import upload, { uploadQr } from '../middleware/multer.js';
import protect from "../middleware/authMiddleware.js";


const router = express.Router();
// Update UPI ID
router.post('/upi', protect, updateUPIId);

// Upload or update user avatar
router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);
// Upload or update payment QR code
router.post('/payment-qr', protect, uploadQr.single('qr'), uploadPaymentQr);

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/profile", protect, getProfile);
router.get('/search', protect, searchUsers);
// Get all users' performance scores (for graph)
router.get('/performance', getAllUsersPerformance);
// Get another user's public profile
router.get('/profile/:userId', protect, getUserProfile);



export default router;