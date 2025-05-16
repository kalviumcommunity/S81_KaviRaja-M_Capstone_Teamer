


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


export const googleLogin = async (req, res) => {
  console.log("Received Google login request"); 
  try {
    const { token } = req.body; 
    console.log("Received token:", token ? "Token received" : "No token received");

    if (!token) {
      console.log("Missing Google ID token"); 
      return res.status(400).json({ message: "Google ID token is missing" });
    }

    console.log("Verifying ID token with Google..."); 
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID, 
    });
    console.log("ID token verified successfully."); 

    const payload = ticket.getPayload();
    console.log("Extracted payload:", payload); 

    const googleId = payload['sub']; 
    const email = payload['email'];
    const name = payload['name'];
    const picture = payload['picture']; 
    console.log(`Searching for user with googleId: ${googleId}`); 
    let user = await User.findOne({ googleId });
    console.log("User found by googleId:", user ? user._id : "None"); 


    if (!user) {
      console.log(`No user found with googleId. Searching by email: ${email}`); 
      user = await User.findOne({ email });
      console.log("User found by email:", user ? user._id : "None"); 


      if (user) {
        console.log("User found by email, updating with googleId.");
        user.googleId = googleId;
        if (!user.name) user.name = name;
        console.log("Saving updated user..."); 
        await user.save();
        console.log("Updated user saved successfully."); 
      } else {
        console.log("No user found by googleId or email. Creating new user."); 
        user = new User({
          googleId,
          email,
          name,
        });
        console.log("Saving new user..."); 
        await user.save();
        console.log("New user saved successfully."); 
      }
    } else {
        console.log("User found by googleId, proceeding with login.");
    }

    const authToken = user.generateToken();
    res.cookie("token", authToken, {
      httpOnly: true,
      sameSite: "Strict"
    });
    console.log("JWT token generated and cookie set."); 


    res.status(200).json({ message: "Google login successful", user });
    console.log("Sent success response."); 

  } catch (error) {
    console.error("Google login error:", error); 
    res.status(500).json({ message: "Server error during Google login", error: error.message });
    console.log("Sent error response."); 
  }
};
