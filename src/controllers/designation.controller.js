const Designation = require("../models/Designation");
const Employee = require("../models/Employee");

// 0️⃣ Get All Designations
exports.getAllDesignations = async (req, res) => {
  try {
    const designations = await Designation.find({ isDeleted: false });
    res.status(200).json(designations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// 1️⃣ Add Designation
exports.addDesignation = async (req, res) => {
  try {
    const { name, description, department } = req.body;
    if (!name) return res.status(400).json({ message: "Designation name required" });
    if (!department) return res.status(400).json({ message: "Department required" });

    const existing = await Designation.findOne({ name, department, isDeleted: false });
    if (existing) return res.status(400).json({ message: "Designation already exists in this department" });

    const designation = await Designation.create({ name, description, department });
    res.status(201).json({ message: "Designation added successfully", designation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// 2️⃣ Edit Designation
exports.editDesignation = async (req, res) => {
  try {
    const { name, description, department } = req.body;
    const designation = await Designation.findById(req.params.id);
    if (!designation || designation.isDeleted)
      return res.status(404).json({ message: "Designation not found" });

    if (name) designation.name = name;
    if (description) designation.description = description;
    if (department) designation.department = department;

    await designation.save();
    res.json({ message: "Designation updated successfully", designation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// 3️⃣ Delete Designation (soft delete)
exports.deleteDesignation = async (req, res) => {
  try {
    const designation = await Designation.findById(req.params.id);
    if (!designation || designation.isDeleted)
      return res.status(404).json({ message: "Designation not found" });

    designation.isDeleted = true;
    await designation.save();

    res.json({ message: "Designation deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// 4️⃣ Assign Designation to Employee
exports.assignToEmployee = async (req, res) => {
  try {
    const { employeeId } = req.body;
    const designation = await Designation.findById(req.params.id);
    if (!designation || designation.isDeleted)
      return res.status(404).json({ message: "Designation not found" });

    const employee = await Employee.findById(employeeId);
    if (!employee || employee.isDeleted)
      return res.status(404).json({ message: "Employee not found" });

    employee.designation = designation._id; // assign designation to employee
    await employee.save();

    res.json({ message: "Designation assigned to employee", employee });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.assignEmployee = async (req, res) => {
  try {
    const { designationId } = req.params;
    const { employeeId } = req.body;

    // 1️⃣ Validate input
    if (!employeeId) {
      return res.status(400).json({
        message: "Employee ID is required",
      });
    }

    // 2️⃣ Check designation
    const designation = await Designation.findById(designationId);
    if (!designation || designation.isDeleted) {
      return res.status(404).json({
        message: "Designation not found",
      });
    }

    // 3️⃣ Check employee
    const employee = await Employee.findById(employeeId);
    if (!employee || employee.isDeleted) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    // 4️⃣ Assign designation
    employee.designation = designation._id;

    await employee.save();

    // 5️⃣ Response
    res.status(200).json({
      message: "Employee assigned to designation successfully",
      employee: {
        id: employee._id,
        name: employee.name,
        designation: designation.name,
      },
    });
  } catch (error) {
    console.error("Assign Designation Error:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

