const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Role = require("../models/Role");
const Employee = require("../models/Employee");
const { validationResult } = require("express-validator");
const RefreshToken = require("../models/RefreshToken");




const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/token");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // 2️⃣ Find user + role
    const user = await User.findOne({ email })
      .populate("role");

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "Account is disabled",
      });
    }

    // 3️⃣ Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // 4️⃣ Check approval status (only for EMPLOYEE role)
    const userRole = user.role?.name || user.role;

    // Skip approval check for ADMIN and HR users
    if (userRole !== 'ADMIN' && userRole !== 'HR') {
      if (user.approvalStatus === 'PENDING') {
        return res.status(403).json({
          message: "Your account is pending admin approval. Please wait for approval before logging in.",
          approvalStatus: 'PENDING'
        });
      }

      if (user.approvalStatus === 'REJECTED') {
        return res.status(403).json({
          message: user.rejectionReason || "Your account registration has been rejected. Please contact support.",
          approvalStatus: 'REJECTED'
        });
      }
    }

    // 5️⃣ Create Access Token
    const accessToken = generateAccessToken(user);

    // 5️⃣ Create Refresh Token
    const refreshToken = generateRefreshToken(user);

    // 6️⃣ Save Refresh Token in DB
    await RefreshToken.create({
      user: user._id,
      token: refreshToken,
      expiresAt: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
      ),
    });

    // 7️⃣ Send tokens
    return res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role?.name || user.role, // Handle both object and string
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};


// Public Signup (no auth required)
exports.signup = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Validate input
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    // Find EMPLOYEE role
    const role = await Role.findOne({ name: "EMPLOYEE" });
    if (!role) {
      return res.status(404).json({
        message: "Employee role not found",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user with PENDING approval status
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role._id,
      approvalStatus: 'PENDING', // Default, but explicit
    });

    // Do NOT create Employee record yet - wait for admin approval

    return res.status(201).json({
      message: "Registration successful! Please wait for admin approval before logging in.",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Signup Error:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};


exports.register = async (req, res) => {
  try {
    // 1️⃣ Validate input
    const { name, email, password, roleName } = req.body;

    if (!name || !email || !password || !roleName) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // 2️⃣ Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    // 3️⃣ Find role
    const role = await Role.findOne({ name: roleName.toUpperCase() });
    if (!role) {
      return res.status(404).json({
        message: "Role not found",
      });
    }

    // 4️⃣ Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 5️⃣ Save user (admin-created users are auto-approved)
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role._id,
      approvalStatus: 'APPROVED', // Admin-created users are pre-approved
    });

    // 6️⃣ Automatically create Employee record
    const department = role.name === 'ADMIN' ? 'Administration' :
      role.name === 'HR' ? 'Human Resources' :
        'General';

    await Employee.create({
      name,
      email,
      status: 'Active',
      department,
      joiningDate: new Date()
    });

    return res.status(201).json({
      message: "User and Employee record created successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: role.name,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

// src/controllers/auth.controller.js
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token required" });
    }

    await RefreshToken.findOneAndDelete({ token: refreshToken });

    return res.status(200).json({
      message: "Logout successful",
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};


exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token missing" });
    }

    const storedToken = await RefreshToken.findOne({ token: refreshToken });
    if (!storedToken) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET,
      async (err, decoded) => {
        if (err) {
          return res.status(403).json({ message: "Expired refresh token" });
        }

        const user = await User.findById(decoded.id).populate("role");
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        const newAccessToken = generateAccessToken(user);

        return res.status(200).json({
          accessToken: newAccessToken,
        });
      }
    );
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "All fields required" });
    }

    const user = await User.findById(req.user.id);
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Old password incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};


const crypto = require("crypto");

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 min
    await user.save();

    // Send resetToken via email (link)
    // example: http://localhost:3000/reset-password/${resetToken}

    return res.status(200).json({
      message: "Reset password link sent to email",
      resetToken, // remove in production
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};


exports.resetPassword = async (req, res) => {
  try {
    const resetToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return res.status(200).json({
      message: "Password reset successful",
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};
