const Payroll = require("../models/Payroll");
const Salary = require("../models/Salary");
const Employee = require("../models/Employee");

// 1️⃣ Generate Payroll for a Specific Month/Year
exports.generatePayroll = async (req, res) => {
    try {
        const { month, year } = req.body;

        if (!month || !year) {
            return res.status(400).json({ message: "Month and year are required" });
        }

        // Fetch all active salary configurations
        const salaryConfigs = await Salary.find().populate("employee");

        const payrolls = [];
        const errors = [];

        for (const config of salaryConfigs) {
            if (config.employee.isDeleted) continue;

            try {
                const payroll = await Payroll.create({
                    employee: config.employee._id,
                    month,
                    year,
                    basicSalary: config.basicSalary,
                    allowances: config.allowances,
                    deductions: config.deductions,
                    netSalary: config.netSalary,
                    status: "Pending"
                });
                payrolls.push(payroll);
            } catch (err) {
                if (err.code === 11000) {
                    errors.push(`Payroll already exists for ${config.employee.name} for ${month} ${year}`);
                } else {
                    errors.push(`Failed for ${config.employee.name}: ${err.message}`);
                }
            }
        }

        res.status(201).json({
            message: `Processed payroll generation. ${payrolls.length} records created.`,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// 2️⃣ Get All Payrolls
exports.getPayrolls = async (req, res) => {
    try {
        const { month, year } = req.query;
        let query = {};
        if (month) query.month = month;
        if (year) query.year = parseInt(year);

        const payrolls = await Payroll.find(query).populate("employee", "name email department designation");
        res.json(payrolls);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// 3️⃣ Update Payroll Status (Mark as Paid)
exports.updatePayrollStatus = async (req, res) => {
    try {
        const { status, paymentDate } = req.body;
        const payroll = await Payroll.findById(req.params.id);

        if (!payroll) return res.status(404).json({ message: "Payroll record not found" });

        if (status) payroll.status = status;
        if (paymentDate) payroll.paymentDate = paymentDate;

        await payroll.save();
        res.json({ message: "Payroll status updated", payroll });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// 4️⃣ Get Payroll History for Employee
exports.getEmployeePayrollHistory = async (req, res) => {
    try {
        const history = await Payroll.find({ employee: req.params.employeeId }).sort({ year: -1, createdAt: -1 });
        res.json(history);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// 5️⃣ Get Logged-in Employee Payroll History
exports.getMyPayrollHistory = async (req, res) => {
    try {
        console.log('getMyPayrollHistory - User email:', req.user.email);
        const employee = await Employee.findOne({ email: req.user.email });
        console.log('getMyPayrollHistory - Employee found:', employee ? employee._id : 'NOT FOUND');

        if (!employee) return res.status(404).json({ message: "Employee record not found" });

        const history = await Payroll.find({ employee: employee._id })
            .populate("employee", "name email department designation")
            .sort({ year: -1, createdAt: -1 });

        console.log('getMyPayrollHistory - Payroll records found:', history.length);
        res.json(history);
    } catch (err) {
        console.error('getMyPayrollHistory - Error:', err);
        res.status(500).json({ message: "Server error" });
    }
};
