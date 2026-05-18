import express from "express";
import { register, login, logout, getProfile, getUserProfile, searchUsers, uploadAvatar, uploadPaymentQr, getAllUsersPerformance, updateUPIId } from "../controllers/authController.js";
import upload, { uploadQr } from '../middleware/multer.js';
import protect from "../middleware/authMiddleware.js";
import passport from '../config/passport.js';
import jwt from 'jsonwebtoken';

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

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

const CLIENT_URL = process.env.CLIENT_URL || (process.env.NODE_ENV === 'production' ? 'https://teamerwork.netlify.app' : 'http://localhost:5173');

router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: `${CLIENT_URL}/login` }), (req, res) => {
  // Successful authentication
  const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
  
  // Set httpOnly cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  });
  
  
  // Redirect to frontend dashboard or callback route
  res.redirect(`${CLIENT_URL}/auth/callback`);
});
router.get("/profile", protect, getProfile);
router.get('/search', protect, searchUsers);
// Get all users' performance scores (for graph)
router.get('/performance', getAllUsersPerformance);
// Get another user's public profile
router.get('/profile/:userId', protect, getUserProfile);



export default router;