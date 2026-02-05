// src/seeders/role.seeder.js

const mongoose = require("mongoose");
const Role = require("../models/Role");
const PERMISSIONS = require("../constants/permissions");
require("dotenv").config();

const roles = [
  {
    name: "ADMIN",
    permissions: Object.values(PERMISSIONS),
  },
  {
    name: "HR",
    permissions: [
      PERMISSIONS.EMPLOYEE_CREATE,
      PERMISSIONS.EMPLOYEE_READ,
      PERMISSIONS.EMPLOYEE_UPDATE,
    ],
  },
  {
    name: "EMPLOYEE",
    permissions: [PERMISSIONS.EMPLOYEE_READ],
  },
];

const seedRoles = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    for (const role of roles) {
      const exists = await Role.findOne({ name: role.name });
      if (!exists) {
        await Role.create(role);
        console.log(`✅ Role ${role.name} created`);
      } else {
        console.log(`⚠️ Role ${role.name} already exists`);
      }
    }

    console.log("🎉 Role seeding completed");
    process.exit();
  } catch (err) {
    console.error("❌ Role seeding failed", err);
    process.exit(1);
  }
};

seedRoles();
