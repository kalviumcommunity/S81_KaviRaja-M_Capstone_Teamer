// import express from "express";
// import { register, login, logout, getProfile } from "../controllers/authController.js";
// import protect from "../middleware/authMiddleware.js";

// const router = express.Router();
// router.post("/register", register);
// router.post("/login", login);
// router.post("/logout", logout);
// router.get("/profile", protect, getProfile);

// export default router;


import express from "express";
import { register, login, logout, getProfile, googleLogin } from "../controllers/authController.js"; // Import googleLogin
import protect from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/profile", protect, getProfile);
router.post("/google", googleLogin); // Add new route for Google login

export default router;
