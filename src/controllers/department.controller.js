const Department = require("../models/Department");
const Employee = require("../models/Employee");

// 1️⃣ Add Department
exports.addDepartment = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: "Department name required" });

    const existing = await Department.findOne({ name });
    if (existing) return res.status(400).json({ message: "Department already exists" });

    const department = await Department.create({ name, description });
    res.status(201).json({ message: "Department added successfully", department });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// 2️⃣ Get All Departments
exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.find({ isDeleted: false }).populate("employees", "name email jobTitle");
    res.json(departments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// 3️⃣ Update Department
exports.updateDepartment = async (req, res) => {
  try {
    const { name, description } = req.body;
    const dept = await Department.findById(req.params.id);
    if (!dept || dept.isDeleted) return res.status(404).json({ message: "Department not found" });

    if (name) dept.name = name;
    if (description) dept.description = description;

    await dept.save();
    res.json({ message: "Department updated successfully", dept });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// 4️⃣ Soft Delete Department
exports.deleteDepartment = async (req, res) => {
  try {
    const dept = await Department.findById(req.params.id);
    if (!dept || dept.isDeleted) return res.status(404).json({ message: "Department not found" });

    dept.isDeleted = true;
    await dept.save();

    res.json({ message: "Department deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// 5️⃣ Assign Employees to Department
exports.assignEmployees = async (req, res) => {
  try {
    const { employeeIds } = req.body; // array of Employee _id
    const dept = await Department.findById(req.params.id);
    if (!dept || dept.isDeleted) return res.status(404).json({ message: "Department not found" });

    // Filter valid employees
    const validEmployees = await Employee.find({
      _id: { $in: employeeIds },
      isDeleted: false
    });

    dept.employees = validEmployees.map(e => e._id);
    await dept.save();

    res.json({ message: "Employees assigned successfully", dept });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
