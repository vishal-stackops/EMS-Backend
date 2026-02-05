const express = require("express");
const router = express.Router();
const departmentController = require("../controllers/department.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

router.use(authMiddleware);

// Add Department (Admin only)
router.post("/", roleMiddleware(["ADMIN"]), departmentController.addDepartment);

// Get all Departments (Admin/HR)
router.get("/", roleMiddleware(["ADMIN", "HR"]), departmentController.getDepartments);

// Update Department (Admin only)
router.put("/:id", roleMiddleware(["ADMIN"]), departmentController.updateDepartment);

// Soft Delete Department (Admin only)
router.delete("/:id", roleMiddleware(["ADMIN"]), departmentController.deleteDepartment);

// Assign Employees to Department (Admin/HR)
router.post("/:id/assign-employees", roleMiddleware(["ADMIN", "HR"]), departmentController.assignEmployees);

module.exports = router;
