const express = require("express");
const router = express.Router();
const employeeController = require("../controllers/employee.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

router.use(authMiddleware);

// Add Employee (Admin/HR)
router.post("/", roleMiddleware(["ADMIN", "HR"]), employeeController.addEmployee);

// Get Employee List (with search, filter, pagination)
router.get("/", roleMiddleware(["ADMIN", "HR"]), employeeController.getEmployees);

// Get Logged-in Employee Profile
router.get("/profile/me", employeeController.getEmployeeProfile);

// Update Logged-in Employee Profile
router.put("/profile/me", employeeController.updateEmployeeProfile);

// Get Employee Details (Admin/HR)
router.get("/:id", roleMiddleware(["ADMIN", "HR"]), employeeController.getEmployeeById);

// Update Employee (Admin/HR)
router.put("/:id", roleMiddleware(["ADMIN", "HR"]), employeeController.updateEmployee);

// Soft Delete Employee (Admin/HR)
router.delete("/:id", roleMiddleware(["ADMIN", "HR"]), employeeController.deleteEmployee);

module.exports = router;
