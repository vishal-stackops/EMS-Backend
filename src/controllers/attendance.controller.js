const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");

// 1️⃣ Check-In
exports.checkIn = async (req, res) => {
    try {
        const { employeeId } = req.body;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Find actual employee doc
        let employeeIdToUse = employeeId;
        const employee = await Employee.findById(employeeId);
        if (!employee) {
            const User = require("../models/User");
            const user = await User.findById(employeeId);
            if (user) {
                const empDoc = await Employee.findOne({ email: user.email });
                if (empDoc) employeeIdToUse = empDoc._id;
            }
        }

        // Check if already checked in
        const existing = await Attendance.findOne({ employee: employeeIdToUse, date: today });
        if (existing) {
            return res.status(400).json({ message: "Already checked in for today" });
        }

        const attendance = await Attendance.create({
            employee: employeeIdToUse,
            date: today,
            checkIn: new Date(),
            status: "Present"
        });

        res.status(201).json({ message: "Checked in successfully", attendance });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// 2️⃣ Check-Out
exports.checkOut = async (req, res) => {
    try {
        const { employeeId } = req.body;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Find actual employee doc
        let employeeIdToUse = employeeId;
        const employee = await Employee.findById(employeeId);
        if (!employee) {
            const User = require("../models/User");
            const user = await User.findById(employeeId);
            if (user) {
                const empDoc = await Employee.findOne({ email: user.email });
                if (empDoc) employeeIdToUse = empDoc._id;
            }
        }

        const attendance = await Attendance.findOne({ employee: employeeIdToUse, date: today });
        if (!attendance) {
            return res.status(404).json({ message: "Check-in record not found for today" });
        }

        if (attendance.checkOut) {
            return res.status(400).json({ message: "Already checked out for today" });
        }

        attendance.checkOut = new Date();

        // Calculate total hours
        const diff = attendance.checkOut - attendance.checkIn;
        attendance.totalHours = (diff / (1000 * 60 * 60)).toFixed(2);

        await attendance.save();
        res.json({ message: "Checked out successfully", attendance });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// 3️⃣ Get Personal Attendance
exports.getPersonalAttendance = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { month, year } = req.query;

        let empId = employeeId;

        // Find actual employee doc
        const employee = await Employee.findById(empId);
        if (!employee) {
            const User = require("../models/User");
            const user = await User.findById(empId);
            if (user) {
                const empDoc = await Employee.findOne({ email: user.email });
                if (empDoc) empId = empDoc._id;
            }
        }

        const history = await Attendance.find({ employee: empId }).sort({ date: -1 });
        res.json(history);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// 4️⃣ Get All Attendance Reports (Admin/HR)
exports.getAllAttendance = async (req, res) => {
    try {
        const { date, month, year, department } = req.query;
        let query = {};

        if (date) {
            const searchDate = new Date(date);
            searchDate.setHours(0, 0, 0, 0);
            query.date = searchDate;
        } else if (month && year) {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0);
            query.date = { $gte: startDate, $lte: endDate };
        }

        const User = require("../models/User");
        let attendance = await Attendance.find(query)
            .populate({
                path: "employee",
                select: "name email department designation",
                populate: {
                    path: "designation",
                    select: "name"
                }
            })
            .sort({ date: -1 });

        // Fallback for N/A employees (linked to User but not Employee profile)
        attendance = await Promise.all(attendance.map(async (item) => {
            const a = item.toObject();
            if (!a.employee) {
                const rawDoc = await Attendance.findById(a._id).select('employee');
                if (rawDoc && rawDoc.employee) {
                    const user = await User.findById(rawDoc.employee).select('name email');
                    if (user) {
                        // Check if this user also has an employee profile
                        const employeeDoc = await Employee.findOne({ email: user.email }).populate("designation", "name");
                        if (employeeDoc) {
                            a.employee = {
                                name: employeeDoc.name,
                                email: employeeDoc.email,
                                department: employeeDoc.department || 'Admin',
                                designation: { name: employeeDoc.designation?.name || 'Admin' }
                            };
                        } else {
                            a.employee = {
                                name: user.name,
                                email: user.email,
                                department: 'Admin',
                                designation: { name: 'Admin' }
                            };
                        }
                    }
                }
            }
            return a;
        }));

        if (department) {
            attendance = attendance.filter(a => a.employee?.department === department);
        }

        res.json(attendance);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};
