const express = require("express");
const router = express.Router();
const leaveController = require("../controllers/leave.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

router.use(authMiddleware);

// Leave Types
router.post("/types", roleMiddleware(["ADMIN"]), leaveController.addLeaveType);
router.get("/types", leaveController.getLeaveTypes);

// Leave Requests
router.post("/apply", leaveController.applyLeave);
router.get("/personal/:employeeId", leaveController.getEmployeeLeaves);
router.get("/all", roleMiddleware(["ADMIN", "HR"]), leaveController.getAllLeaveRequests);
router.put("/:id/status", roleMiddleware(["ADMIN", "HR"]), leaveController.updateLeaveStatus);

module.exports = router;
