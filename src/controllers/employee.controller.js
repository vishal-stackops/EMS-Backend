const Employee = require("../models/Employee");
const User = require("../models/User");
const Attendance = require("../models/Attendance");
const Salary = require("../models/Salary");
const Payroll = require("../models/Payroll");
const LeaveRequest = require("../models/LeaveRequest");
const Role = require("../models/Role");

// 1️⃣ Add Employee
exports.addEmployee = async (req, res) => {
  try {
    const { name, email, phone, department, designation, salary, joiningDate, status } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    const existing = await Employee.findOne({ email });
    if (existing) return res.status(400).json({ message: "Employee email already exists" });

    const employee = await Employee.create({
      name, email, phone, department, designation, salary, joiningDate, status
    });

    const populatedEmployee = await Employee.findById(employee._id).populate("designation");

    res.status(201).json({ message: "Employee added successfully", employee: populatedEmployee });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// 2️⃣ Get Employees List (search, filter, pagination)
exports.getEmployees = async (req, res) => {
  try {
    let { search, department, designation, status, page, limit } = req.query;

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;

    // First, get list of admin emails to exclude from employee list (but keep HR)
    const adminRoles = await Role.find({ name: "ADMIN" });
    const adminRoleIds = adminRoles.map(r => r._id);
    const adminUsers = await User.find({ role: { $in: adminRoleIds } });
    const adminEmails = adminUsers.map(u => u.email);

    let query = { isDeleted: false };

    // Exclude only admin users from employee list (HR employees will be shown)
    if (adminEmails.length > 0) {
      query.email = { $nin: adminEmails };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { department: { $regex: search, $options: "i" } },
        { salary: { $regex: search, $options: "i" } },
      ];
    }

    if (department) query.department = department;
    if (designation) query.designation = designation;
    if (status) query.status = status;

    const total = await Employee.countDocuments(query);
    const totalPages = Math.ceil(total / limit);
    const employees = await Employee.find(query)
      .populate("designation")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({ total, totalPages, page, limit, employees });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// 3️⃣ Get Employee By ID
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee || employee.isDeleted) return res.status(404).json({ message: "Employee not found" });
    res.json(employee);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// 4️⃣ Update Employee
exports.updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee || employee.isDeleted) return res.status(404).json({ message: "Employee not found" });

    const fields = ["name", "email", "phone", "department", "designation", "salary", "joiningDate", "status"];
    fields.forEach(f => {
      if (req.body[f] !== undefined) employee[f] = req.body[f];
    });

    await employee.save();
    const populatedEmployee = await Employee.findById(employee._id).populate("designation");
    res.json({ message: "Employee updated successfully", employee: populatedEmployee });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// 5️⃣ Hard Delete Employee (Cascading)
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    const employeeId = employee._id;
    const employeeEmail = employee.email;

    // PERFORM CASCADING DELETE

    // 1️⃣ Delete Attendance
    await Attendance.deleteMany({ employee: employeeId });

    // 2️⃣ Delete Salary
    await Salary.deleteMany({ employee: employeeId });

    // 3️⃣ Delete Payroll
    await Payroll.deleteMany({ employee: employeeId });

    // 4️⃣ Delete Leave Requests
    await LeaveRequest.deleteMany({ employee: employeeId });

    // 5️⃣ Delete User account (if exists)
    await User.deleteMany({ email: employeeEmail });

    // 6️⃣ Finally, delete the Employee record itself
    await Employee.findByIdAndDelete(employeeId);

    res.json({ message: "Employee and all related data deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// 6️⃣ Get Logged-in Employee Profile
exports.getEmployeeProfile = async (req, res) => {
  try {
    const employee = await Employee.findOne({ email: req.user.email }).populate("designation");
    if (!employee || employee.isDeleted) {
      return res.status(404).json({
        message: "Employee profile not found",
        debug: {
          searchedEmail: req.user.email,
          userParams: req.user
        }
      });
    }
    res.json(employee);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// 7️⃣ Update Logged-in Employee Profile
exports.updateEmployeeProfile = async (req, res) => {
  try {
    const employee = await Employee.findOne({ email: req.user.email });
    if (!employee || employee.isDeleted) return res.status(404).json({ message: "Employee profile not found" });

    // Only allow updating certain fields for self-service
    const allowedFields = ["phone", "name"]; // Limit what employees can change about themselves
    allowedFields.forEach(f => {
      if (req.body[f] !== undefined) employee[f] = req.body[f];
    });

    await employee.save();
    const populatedEmployee = await Employee.findById(employee._id).populate("designation");
    res.json({ message: "Profile updated successfully", employee: populatedEmployee });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
