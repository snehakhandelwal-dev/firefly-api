const UsersModel = require("../models/userSchema");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');
const crypto = require("crypto");
require("dotenv").config();
exports.register = async (req, res) => {
    console.log("hiii");
    try {
        const { fullName, email, userName, phoneNo, gender, password, confirmPassword } = req.body;
        console.log(req.body);

        // Validate required fields
        if (!fullName || !email || !userName || !phoneNo || !gender || !password || !confirmPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        // Check if user already exists
        const existingUser = await UsersModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        // Hash the password before storing
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate avatar based on gender
        const avatarType = gender.toLowerCase() === "male" ? "boy" : "girl";
        const avatar = `https://avatar.iran.liara.run/public/${avatarType}?username=${userName}`;
        console.log("Generated Avatar URL:", avatar);

        // Create new user in database
        const newUser = await UsersModel.create({
            fullName,
            email,
            userName,
            phoneNo,
            gender,
            avatar,
            password: hashedPassword,  // Only store hashed password
        });

        console.log(newUser);
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: newUser,
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

exports.login = async (req, res) => {
  try {
      console.log("Request Body:", req.body); // Debugging log

      const { userName, password } = req.body;

      if (!userName || !password) {
          return res.status(400).json({ message: "Username and password are required" });
      }

      console.log("Received login request:", { userName });

      const user = await UsersModel.findOne({ userName });
      console.log("User found:", user);
      if (!user) {
          return res.status(401).json({ message: "Invalid username or password" });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
          return res.status(401).json({ message: "Invalid username or password" });
      }
      console.log("Received login request:", { password });
      const token = jwt.sign(
          { userId: user._id, username: user.userName },
          process.env.JWT_SECRET || "default-secret-key",
          { expiresIn: "1h" }
      );

      res.json({
          success: true,
          data: {
              user: {
                  _id: user._id,
                  userName: user.userName,
                  email: user.email,
                  fullName: user.fullName,
                  phoneNo: user.phoneNo,
                  gender: user.gender,
                  avatar: user.avatar,
              },
              token,
          },
          message: "Login successful",
      });
  } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};


exports.logout = async (req, res) => {
    try {
      // Remove token from client (handled in React)
      res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
      res.status(500).json({ error: "Something went wrong" });
    }
  };

  exports.getProfile = async (req, res) => {
    try {
      const userId = req.params.userId;
  
      // Find user by ID in the database
      const user = await UsersModel.findById(userId);
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Return the user data
      res.json({
        data: user,
        message: "User found",
      });
    } catch (error) {
      console.error("Error getting user by ID:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };


  exports.getOtherUsers = async (req, res) => {
    console.log('hiii')
    try {
      const userId = req.params.userId;
  console.log('1',userId)
      // Find user by ID in the database
      const otherUsers = await UsersModel.find({ _id: { $ne: userId } });
  console.log('2',otherUsers);
  
      // Return the user data
      res.json({
        success: true,
        data: otherUsers,
        message: "Users found",
      });
    } catch (error) {
      console.error("Error getting user by ID:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };