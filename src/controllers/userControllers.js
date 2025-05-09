const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const UsersModel = require("../models/userSchema");
require("dotenv").config();

// Register API
exports.register = async (req, res) => {
    try {
        const { fullName, email, userName, phoneNo, gender, password, confirmPassword } = req.body;

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

// Login API
exports.login = async (req, res) => {
    try {
        const { userName, password } = req.body;

        if (!userName || !password) {
            return res.status(400).json({ message: "Username and password are required" });
        }

        // Find user by userName
        const user = await UsersModel.findOne({ userName });
        if (!user) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        // Compare password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        // Generate JWT token
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

// Logout API
exports.logout = async (req, res) => {
    try {
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        res.status(500).json({ error: "Something went wrong" });
    }
};

// Get Profile API
exports.getProfile = async (req, res) => {
    try {
        const userId = req.params.userId;

        // Validate if userId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid User ID format" });
        }

        // Find user by ID in the database
        const user = await UsersModel.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            data: user,
            message: "User found",
        });
    } catch (error) {
        console.error("Error getting user by ID:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// Get Other Users API
exports.getOtherUsers = async (req, res) => {
    try {
        const userId = req.params.userId;

        // Validate if userId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid User ID format" });
        }

        // Find users excluding the current user
        const otherUsers = await UsersModel.find({ _id: { $ne: userId } });

        res.json({
            success: true,
            data: otherUsers,
            message: "Users found",
        });
    } catch (error) {
        console.error("Error getting users:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// Update Profile API
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.params.userId;
        const { fullName, email, userName, phoneNo, gender, avatar } = req.body;

        // Validate if userId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid User ID format" });
        }

        // Find user and update the profile
        const updatedUser = await UsersModel.findByIdAndUpdate(userId, {
            fullName,
            email,
            userName,
            phoneNo,
            gender,
            avatar,
        }, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            success: true,
            data: updatedUser,
            message: "User profile updated successfully",
        });
    } catch (error) {
        console.error("Error updating user profile:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// Delete Profile API
exports.deleteProfile = async (req, res) => {
    try {
        const userId = req.params.userId;

        // Validate if userId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid User ID format" });
        }

        // Find user and delete the profile
        const deletedUser = await UsersModel.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            success: true,
            message: "User profile deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting user profile:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
