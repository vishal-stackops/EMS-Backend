const express = require("express");
const router = express.Router();
const salaryController = require("../controllers/salary.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

router.use(authMiddleware);

// Get All Salaries (Admin/HR)
router.get("/", roleMiddleware(["ADMIN", "HR"]), salaryController.getAllSalaries);

// Get Salary by Employee ID
router.get("/employee/:employeeId", roleMiddleware(["ADMIN", "HR"]), salaryController.getSalaryByEmployee);

// Set Salary (Admin/HR)
router.post("/", roleMiddleware(["ADMIN", "HR"]), salaryController.setSalary);

// Update Salary (Admin/HR)
router.put("/:id", roleMiddleware(["ADMIN", "HR"]), salaryController.updateSalary);

// Get My Salary (Employee only)
router.get("/my-salary", roleMiddleware(["EMPLOYEE", "ADMIN", "HR"]), salaryController.getMySalary);

module.exports = router;
