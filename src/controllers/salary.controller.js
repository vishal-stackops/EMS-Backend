const Salary = require("../models/Salary");
const Employee = require("../models/Employee");
const User = require("../models/User");
const Role = require("../models/Role");

// 1️⃣ Set Salary for Employee
exports.setSalary = async (req, res) => {
    try {
        const { employeeId, basicSalary, allowances, deductions } = req.body;

        if (!employeeId || basicSalary === undefined) {
            return res.status(400).json({ message: "Employee ID and basic salary are required" });
        }

        const employee = await Employee.findById(employeeId);
        if (!employee || employee.isDeleted) {
            return res.status(404).json({ message: "Employee not found" });
        }

        // Check if target employee is HR - only ADMIN can set HR salaries
        const targetUser = await User.findOne({ email: employee.email }).populate("role");
        if (targetUser && targetUser.role.name === "HR") {
            // Get current user's role
            const currentUser = await User.findById(req.user.id).populate("role");
            if (currentUser.role.name !== "ADMIN") {
                return res.status(403).json({ message: "Only ADMIN can set salaries for HR users" });
            }
        }

        const netSalary = parseFloat(basicSalary) + parseFloat(allowances || 0) - parseFloat(deductions || 0);

        const existingSalary = await Salary.findOne({ employee: employeeId });
        if (existingSalary) {
            return res.status(400).json({ message: "Salary already set for this employee. Use update instead." });
        }

        const salary = await Salary.create({
            employee: employeeId,
            basicSalary,
            allowances,
            deductions,
            netSalary
        });

        res.status(201).json({ message: "Salary set successfully", salary });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// 2️⃣ Update Salary
exports.updateSalary = async (req, res) => {
    try {
        const { basicSalary, allowances, deductions } = req.body;
        const salary = await Salary.findById(req.params.id).populate("employee");

        if (!salary) return res.status(404).json({ message: "Salary record not found" });

        // Check if target employee is HR - only ADMIN can update HR salaries
        const targetUser = await User.findOne({ email: salary.employee.email }).populate("role");
        if (targetUser && targetUser.role.name === "HR") {
            // Get current user's role
            const currentUser = await User.findById(req.user.id).populate("role");
            if (currentUser.role.name !== "ADMIN") {
                return res.status(403).json({ message: "Only ADMIN can update salaries for HR users" });
            }
        }

        if (basicSalary !== undefined) salary.basicSalary = basicSalary;
        if (allowances !== undefined) salary.allowances = allowances;
        if (deductions !== undefined) salary.deductions = deductions;

        salary.netSalary = parseFloat(salary.basicSalary) + parseFloat(salary.allowances) - parseFloat(salary.deductions);

        await salary.save();
        res.json({ message: "Salary updated successfully", salary });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// 3️⃣ Get Salary by Employee
exports.getSalaryByEmployee = async (req, res) => {
    try {
        const salary = await Salary.findOne({ employee: req.params.employeeId }).populate("employee", "name email");
        if (!salary) return res.status(404).json({ message: "Salary record not found for this employee" });
        res.json(salary);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// 4️⃣ Get All Salaries
exports.getAllSalaries = async (req, res) => {
    try {
        const salaries = await Salary.find().populate("employee", "name email department designation");
        res.json(salaries);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// 5️⃣ Get Logged-in Employee Salary
exports.getMySalary = async (req, res) => {
    try {
        const employee = await Employee.findOne({ email: req.user.email });
        if (!employee) return res.status(404).json({ message: "Employee record not found" });

        const salary = await Salary.findOne({ employee: employee._id });
        if (!salary) return res.status(404).json({ message: "Salary record not found" });

        res.json(salary);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};
