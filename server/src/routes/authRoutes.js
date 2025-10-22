import express from "express";
import { register, login, logout, getProfile, getUserProfile, searchUsers, uploadAvatar, uploadPaymentQr, getAllUsersPerformance, updateUPIId } from "../controllers/authController.js";
import upload, { uploadQr } from '../middleware/multer.js';
import protect from "../middleware/authMiddleware.js";
import passport from '../config/passport.js';

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

// Google OAuth routes: only enable when environment variables are set
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  // Redirect to Google for authentication
  router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

  // OAuth callback
  router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login', session: false }),
    (req, res) => {
      const frontendUrl = process.env.FRONTEND_URL || (process.env.NODE_ENV === 'production'
        ? 'https://teamerwork.netlify.app'
        : 'http://localhost:5173');

      if (!req.user) {
        console.error('Google OAuth failed: No user returned');
        return res.redirect(`${frontendUrl}/login?error=Google authentication failed`);
      }

      try {
        const token = req.user.generateToken();
        console.log('Google OAuth successful for user:', req.user.email);
        res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
      } catch (error) {
        console.error('Error generating token:', error);
        res.redirect(`${frontendUrl}/login?error=Token generation failed`);
      }
    });
} else {
  // Provide informative endpoints when Google OAuth isn't configured
  router.get('/google', (req, res) => {
    res.status(501).json({ message: 'Google OAuth not configured on this server. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.' });
  });

  router.get('/google/callback', (req, res) => {
    res.status(501).json({ message: 'Google OAuth not configured on this server. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.' });
  });
}

export default router;