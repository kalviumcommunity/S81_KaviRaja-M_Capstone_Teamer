


// import bcrypt from "bcryptjs";
// import { User } from "../models/userModel.js";
// import jwt from "jsonwebtoken";

// export const register = async (req, res) => {
//   try {
//     const { username, name, email, password } = req.body;


//     const normalizedEmail = email.trim().toLowerCase();


//     let user = await User.findOne({ username });
//     if (user) {
//       return res.status(400).json({
//         message: "Username already exists. Please choose a different username."
//       });
//     }


//     user = await User.findOne({
//       email: { $regex: `^${normalizedEmail}$`, $options: 'i' }
//     });
//     if (user) {
//       return res.status(400).json({
//         message: "User already exists with this email. Please use a different email address."
//       });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     user = new User({
//       username,
//       name: name.trim(),
//       email: normalizedEmail,
//       password: hashedPassword
//     });

//     await user.save();

//     const token = user.generateToken();
//     res.cookie("token", token, {
//       httpOnly: true,
//       // secure: true, // <-- COMMENT OUT or REMOVE this line
//       sameSite: "Strict"
//     });

//     res.status(201).json({
//       message: "User registered successfully",
//       user
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Server error",
//       error
//     });
//   }
// };



// export const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ message: "Invalid credentials" });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: "Invalid credentials" });
//     }

//     const token = user.generateToken();
//     res.cookie("token", token, {
//       httpOnly: true,
//       sameSite: "Strict"
//     });

//     res.status(200).json({ message: "Login successful", user });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error });
//   }
// };

// export const logout = (req, res) => {
//   res.clearCookie("token");
//   res.status(200).json({ message: "Logout successful" });
// };

// export const getProfile = async (req, res) => {
//   try {
//     const user = req.user;
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     res.json(user);
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error });
//   }
// };


import bcrypt from "bcryptjs";
import { User } from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { OAuth2Client } from 'google-auth-library'; // Import Google Auth Library

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID); // Initialize Google OAuth Client

export const register = async (req, res) => {
  try {
    const { username, name, email, password } = req.body;

    const normalizedEmail = email.trim().toLowerCase();

    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({
        message: "Username already exists. Please choose a different username."
      });
    }

    user = await User.findOne({
      email: { $regex: `^${normalizedEmail}$`, $options: 'i' }
    });
    if (user) {
      return res.status(400).json({
        message: "User already exists with this email. Please use a different email address."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({
      username,
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword
    });

    await user.save();

    const token = user.generateToken();
    res.cookie("token", token, {
      httpOnly: true,
      // secure: true, // <-- COMMENT OUT or REMOVE this line
      sameSite: "Strict"
    });

    res.status(201).json({
      message: "User registered successfully",
      user
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error
    });
  }
};



export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = user.generateToken();
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "Strict"
    });

    res.status(200).json({ message: "Login successful", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const logout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logout successful" });
};

export const getProfile = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// In server/src/controllers/authController.js

// ... (other imports and functions)

// New Google Login Controller
export const googleLogin = async (req, res) => {
  console.log("Received Google login request"); // Log start of function
  try {
    const { token } = req.body; // Receive the ID token from the frontend
    console.log("Received token:", token ? "Token received" : "No token received"); // Log token presence

    if (!token) {
      console.log("Missing Google ID token"); // Log missing token
      return res.status(400).json({ message: "Google ID token is missing" });
    }

    console.log("Verifying ID token with Google..."); // Log verification step
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
    });
    console.log("ID token verified successfully."); // Log successful verification

    const payload = ticket.getPayload();
    console.log("Extracted payload:", payload); // Log the extracted payload

    const googleId = payload['sub']; // The unique Google user ID
    const email = payload['email'];
    const name = payload['name'];
    const picture = payload['picture']; // Optional: if you want to store profile picture URL

    console.log(`Searching for user with googleId: ${googleId}`); // Log search by googleId
    // Find or create the user in your database
    let user = await User.findOne({ googleId });
    console.log("User found by googleId:", user ? user._id : "None"); // Log result of googleId search


    if (!user) {
      console.log(`No user found with googleId. Searching by email: ${email}`); // Log search by email
      // If user doesn't exist with googleId, check by email
      user = await User.findOne({ email });
      console.log("User found by email:", user ? user._id : "None"); // Log result of email search


      if (user) {
        console.log("User found by email, updating with googleId."); // Log update action
        // If user exists with email but no googleId, update their record
        user.googleId = googleId;
        // Optionally update name/picture if they are null/empty
        if (!user.name) user.name = name;
        // if (!user.picture) user.picture = picture; // Add picture field to model if needed
        console.log("Saving updated user..."); // Log before saving update
        await user.save();
        console.log("Updated user saved successfully."); // Log after saving update
      } else {
        console.log("No user found by googleId or email. Creating new user."); // Log create action
        // If user doesn't exist at all, create a new one
        user = new User({
          googleId,
          email,
          name,
          // picture, // Add picture field to model if needed
          // username can be generated or left null
        });
        console.log("Saving new user..."); // Log before saving new user
        await user.save();
        console.log("New user saved successfully."); // Log after saving new user
      }
    } else {
        console.log("User found by googleId, proceeding with login."); // Log existing user login
    }


    // Generate and set JWT token
    const authToken = user.generateToken();
    res.cookie("token", authToken, {
      httpOnly: true,
      sameSite: "Strict"
    });
    console.log("JWT token generated and cookie set."); // Log token/cookie action


    res.status(200).json({ message: "Google login successful", user });
    console.log("Sent success response."); // Log success response

  } catch (error) {
    console.error("Google login error:", error); // Log the error
    res.status(500).json({ message: "Server error during Google login", error: error.message });
    console.log("Sent error response."); // Log error response
  }
};
