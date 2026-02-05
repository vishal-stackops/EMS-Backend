const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Role = require("../models/Role");

// 1️⃣ Create User
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, roleName } = req.body;

    if (!name || !email || !password || !roleName)
      return res.status(400).json({ message: "All fields are required" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already exists" });

    const role = await Role.findOne({ name: roleName });
    if (!role) return res.status(400).json({ message: "Role not found" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role._id,
    });

    res.status(201).json({ message: "User created successfully", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// 2️⃣ Get All Users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().populate("role", "name");
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// 3️⃣ Get User by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("role", "name");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// 4️⃣ Update User Details
exports.updateUser = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();
    res.json({ message: "User updated successfully", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// 5️⃣ Activate / Deactivate
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      message: `User ${user.isActive ? "activated" : "deactivated"}`,
      user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// 6️⃣ Assign Role
exports.assignRole = async (req, res) => {
  try {
    const { roleName } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const role = await Role.findOne({ name: roleName });
    if (!role) return res.status(404).json({ message: "Role not found" });

    user.role = role._id;
    await user.save();

    res.json({ message: "Role assigned successfully", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// 7️⃣ Reset User Password
exports.resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword)
      return res.status(400).json({ message: "New password required" });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// 8️⃣ Get Pending Users (Admin/HR only)
exports.getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await User.find({ approvalStatus: 'PENDING' })
      .populate("role", "name")
      .select("-password")
      .sort({ createdAt: -1 }); // Newest first

    res.json(pendingUsers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// 9️⃣ Approve User (Admin/HR only)
exports.approveUser = async (req, res) => {
  try {
    const Employee = require("../models/Employee");

    const user = await User.findById(req.params.id).populate("role", "name");
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.approvalStatus !== 'PENDING') {
      return res.status(400).json({
        message: `User is already ${user.approvalStatus.toLowerCase()}`
      });
    }

    // Update approval status
    user.approvalStatus = 'APPROVED';
    user.approvedBy = req.user.id; // From auth middleware
    user.approvedAt = new Date();
    await user.save();

    // Create Employee record
    const department = user.role.name === 'ADMIN' ? 'Administration' :
      user.role.name === 'HR' ? 'Human Resources' :
        'General';

    await Employee.create({
      name: user.name,
      email: user.email,
      status: 'Active',
      department,
      joiningDate: new Date()
    });

    res.json({
      message: "User approved successfully and Employee record created",
      user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔟 Reject User (Admin/HR only)
exports.rejectUser = async (req, res) => {
  try {
    const { reason } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.approvalStatus !== 'PENDING') {
      return res.status(400).json({
        message: `User is already ${user.approvalStatus.toLowerCase()}`
      });
    }

    // Update approval status
    user.approvalStatus = 'REJECTED';
    user.approvedBy = req.user.id;
    user.approvedAt = new Date();
    if (reason) user.rejectionReason = reason;
    await user.save();

    res.json({
      message: "User rejected successfully",
      user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
