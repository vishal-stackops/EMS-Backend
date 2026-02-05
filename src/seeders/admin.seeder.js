const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("../models/User");
const Role = require("../models/Role");

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const adminRole = await Role.findOne({ name: "ADMIN" });
    if (!adminRole) {
      console.log("❌ ADMIN role not found");
      process.exit(1);
    }

    const existingAdmin = await User.findOne({ email: "admin@gmail.com" });
    if (existingAdmin) {
      console.log("⚠️ Admin already exists");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("123456", 10);

    await User.create({
      name: "System Admin",
      email: "admin@gmail.com",
      password: hashedPassword,
      role: adminRole._id,
    });

    console.log("✅ Admin user created");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

createAdmin();
