const express = require("express");
const router = express.Router();
const payrollController = require("../controllers/payroll.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

router.use(authMiddleware);

// Generate Payroll (Admin only)
router.post("/generate", roleMiddleware(["ADMIN"]), payrollController.generatePayroll);

// Get All Payrolls (Admin/HR)
router.get("/", roleMiddleware(["ADMIN", "HR"]), payrollController.getPayrolls);

// Get Payroll History for Employee
router.get("/employee/:employeeId", roleMiddleware(["ADMIN", "HR"]), payrollController.getEmployeePayrollHistory);

// Get My Payroll History (Employee only)
router.get("/my-history", roleMiddleware(["EMPLOYEE", "ADMIN", "HR"]), payrollController.getMyPayrollHistory);

// Update Payroll Status (Paid/Pending) - Admin/HR
router.put("/:id", roleMiddleware(["ADMIN", "HR"]), payrollController.updatePayrollStatus);

module.exports = router;
