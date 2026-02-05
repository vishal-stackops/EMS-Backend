const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");
const authMiddleware = require("../middlewares/auth.middleware"); // JWT verify
const roleMiddleware = require("../middlewares/role.middleware");

// All routes require login
router.use(authMiddleware);

// Create User (Admin / HR)
router.post("/", roleMiddleware(["ADMIN", "HR"]), userController.createUser);

// Get all users (Admin / HR)
router.get("/", roleMiddleware(["ADMIN", "HR"]), userController.getAllUsers);

// Get user by ID (Admin / HR / Employee can view self)
router.get("/:id", userController.getUserById);

// Update user details (Admin / HR)
router.put("/:id", roleMiddleware(["ADMIN", "HR"]), userController.updateUser);

// Activate / Deactivate user (Admin only)
router.patch("/:id/status", roleMiddleware(["ADMIN"]), userController.toggleUserStatus);

// Assign role (Admin only)
router.patch("/:id/role", roleMiddleware(["ADMIN"]), userController.assignRole);

// Reset user password (Admin / HR)
router.patch("/:id/reset-password", roleMiddleware(["ADMIN", "HR"]), userController.resetPassword);

// Pending user management (Admin / HR)
router.get("/pending", roleMiddleware(["ADMIN", "HR"]), userController.getPendingUsers);
router.put("/:id/approve", roleMiddleware(["ADMIN", "HR"]), userController.approveUser);
router.put("/:id/reject", roleMiddleware(["ADMIN", "HR"]), userController.rejectUser);

module.exports = router;
