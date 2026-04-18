import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";

export const register = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: "Email, password, and role are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use" });
    }

    // Use constructor to create user instance without immediate save
    const user = new User({ email, password, role });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      accessToken,
      refreshToken,
      user: { 
        id: user._id, 
        email: user.email, 
        role: user.role, 
        hasCompletedOnboarding: user.hasCompletedOnboarding 
      },
    });
  } catch (err) {
    console.error("CRITICAL REGISTER ERROR:", err);
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: "Validation error", errors: Object.values(err.errors).map(e => e.message), stack: err.stack });
    }
    
    if (err.code === 11000) {
      return res.status(409).json({ message: "Email already exists", stack: err.stack });
    }

    res.status(500).json({ message: "Registration failed", error: err.message, stack: err.stack });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      accessToken,
      refreshToken,
      user: { 
        id: user._id, 
        email: user.email,
        role: user.role,
        hasCompletedOnboarding: user.hasCompletedOnboarding
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    let payload;
    try {
      payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const user = await User.findById(payload.userId);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const newAccessToken = generateAccessToken(user._id);
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const logout = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (user) {
      user.refreshToken = null;
      await user.save();
    }
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const me = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password -refreshToken");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ 
      user: { 
        id: user._id, 
        email: user.email,
        role: user.role,
        hasCompletedOnboarding: user.hasCompletedOnboarding,
        fullName: user.fullName,
        skills: user.skills,
        interests: user.interests,
        location: user.location
      } 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const onboarding = async (req, res) => {
  try {
    const { fullName, skills, interests, location } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.fullName = fullName || user.fullName;
    user.skills = skills || user.skills;
    user.interests = interests || user.interests;
    user.location = location || user.location;
    user.hasCompletedOnboarding = true;

    await user.save();

    res.json({
      message: "Onboarding completed successfully",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        hasCompletedOnboarding: user.hasCompletedOnboarding,
        fullName: user.fullName,
        skills: user.skills,
        interests: user.interests,
        location: user.location
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
