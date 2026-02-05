const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendance.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

router.use(authMiddleware);

// Check-in/out
router.post("/check-in", attendanceController.checkIn);
router.post("/check-out", attendanceController.checkOut);

// Personal History
router.get("/personal/:employeeId", attendanceController.getPersonalAttendance);

// All Reports (Admin/HR)
router.get("/all", roleMiddleware(["ADMIN", "HR"]), attendanceController.getAllAttendance);

module.exports = router;
