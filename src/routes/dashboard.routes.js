const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboard.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

// Get all dashboard analytics (Admin/HR only)
router.get("/analytics", authMiddleware, roleMiddleware(["ADMIN", "HR"]), dashboardController.getAnalyticsData);

module.exports = router;
