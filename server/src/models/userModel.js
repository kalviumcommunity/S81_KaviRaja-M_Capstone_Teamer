
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true }, 
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

userSchema.methods.generateToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

const User = mongoose.model("User", userSchema);
export { User };
