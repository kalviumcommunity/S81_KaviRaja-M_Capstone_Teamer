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
//       secure: true, 
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
//     res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "Strict" });

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
    console.log('Login attempt:', { email });

    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found');
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.password) {
      console.log('User has no password field:', user);
      return res.status(500).json({ message: "User record corrupted: no password hash." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password mismatch');
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = user.generateToken();
    res.cookie("token", token, {
      httpOnly: true,
      // secure: true, // <-- COMMENT OUT or REMOVE this line
      sameSite: "Strict"
    });

    console.log('Login successful:', user.email);
    res.status(200).json({ message: "Login successful", user });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: "Server error", error: error.message, stack: error.stack });
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

export const searchUsers = async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.json([]);
    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error searching users", error: error.message });
  }
};
