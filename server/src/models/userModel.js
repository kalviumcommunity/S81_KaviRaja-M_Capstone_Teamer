
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const userSchema = new mongoose.Schema({
  username: { type: String, required: false, unique: false }, // Not required for Google users
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false }, // Not required for Google users
  avatar: { type: String }, // URL to profile photo
  avatarUpdatedAt: { type: Date },
  paymentQr: { type: String }, // URL to payment QR code image
  upiId: { type: String }, // UPI ID for payments
  performanceScore: { type: Number, default: 0 },
  googleId: { type: String, unique: true, sparse: true }, // For Google OAuth
});

userSchema.methods.generateToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

const User = mongoose.model("User", userSchema);
export { User };
