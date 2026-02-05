const express = require("express");
const router = express.Router();
const designationController = require("../controllers/designation.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

router.use(authMiddleware);

// Get All Designations (Admin/HR)
router.get("/", roleMiddleware(["ADMIN", "HR"]), designationController.getAllDesignations);

// Add Designation (Admin/HR)
router.post("/", roleMiddleware(["ADMIN", "HR"]), designationController.addDesignation);

// Edit Designation
router.put("/:id", roleMiddleware(["ADMIN", "HR"]), designationController.editDesignation);

// Delete Designation (soft delete)
router.delete("/:id", roleMiddleware(["ADMIN", "HR"]), designationController.deleteDesignation);

// Assign Designation to Employee
router.post("/:id/assign-employee", roleMiddleware(["ADMIN", "HR"]), designationController.assignToEmployee);

router.post(
  "/:designationId/assign-employee",
  authMiddleware,
  roleMiddleware(["ADMIN", "HR"]),
  designationController.assignEmployee
);


module.exports = router;
