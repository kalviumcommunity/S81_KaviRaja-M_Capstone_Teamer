import express from "express";
import { register, login, logout, getProfile, getUserProfile, searchUsers, uploadAvatar, uploadPaymentQr, getAllUsersPerformance } from "../controllers/authController.js";
import upload, { uploadQr } from '../middleware/multer.js';
import protect from "../middleware/authMiddleware.js";
import passport from '../config/passport.js';

const router = express.Router();

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

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  (req, res) => {
    // Issue a JWT and redirect to frontend with token
    const token = req.user.generateToken();
    res.redirect(`http://localhost:5173/auth/callback?token=${token}`);
  }
);

export default router;