const Employee = require("../models/Employee");
const Attendance = require("../models/Attendance");
const LeaveRequest = require("../models/LeaveRequest");
const Department = require("../models/Department");
const Payroll = require("../models/Payroll");
const mongoose = require("mongoose");

exports.getAnalyticsData = async (req, res) => {
    try {
        // 1. Employee Metrics
        const totalEmployees = await Employee.countDocuments({ isDeleted: false });
        const activeEmployees = await Employee.countDocuments({ isDeleted: false, status: "Active" });
        const inactiveEmployees = await Employee.countDocuments({ isDeleted: false, status: "Inactive" });

        // 2. Department-wise Distribution & Count
        const departmentsCount = await Department.countDocuments({ isDeleted: { $ne: true } });

        const departmentStats = await Employee.aggregate([
            { $match: { isDeleted: false } },
            { $group: { _id: "$department", count: { $sum: 1 } } },
            { $project: { name: { $ifNull: ["$_id", "Unassigned"] }, count: 1, _id: 0 } }
        ]);

        // 3. Payroll Metrics
        const currentYear = new Date().getFullYear();
        const currentMonthName = new Date().toLocaleString('default', { month: 'long' });

        const payrollThisMonthResult = await Payroll.aggregate([
            { $match: { month: currentMonthName, year: currentYear } },
            { $group: { _id: null, total: { $sum: "$netSalary" } } }
        ]);
        const payrollThisMonth = payrollThisMonthResult[0] ? payrollThisMonthResult[0].total : 0;

        // Payroll History (for Graph)
        const payrollHistory = await Payroll.aggregate([
            { $group: { _id: { year: "$year", month: "$month" }, cost: { $sum: "$netSalary" } } },
            { $sort: { "_id.year": 1 } }
        ]);

        // 4. Monthly Hiring Graph (Last 12 Months)
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
        twelveMonthsAgo.setDate(1);
        twelveMonthsAgo.setHours(0, 0, 0, 0);

        const hiringTrends = await Employee.aggregate([
            { $match: { isDeleted: false, joiningDate: { $gte: twelveMonthsAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$joiningDate" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } },
            { $project: { month: "$_id", count: 1, _id: 0 } }
        ]);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const attendanceSummary = await Attendance.aggregate([
            {
                $match: {
                    date: {
                        $gte: today,
                        $lt: tomorrow
                    }
                }
            },
            { $group: { _id: "$status", count: { $sum: 1 } } },
            { $project: { status: "$_id", count: 1, _id: 0 } }
        ]);

        // 6. Leave Overview
        const pendingLeaves = await LeaveRequest.countDocuments({ status: "Pending" });

        res.json({
            metrics: {
                totalEmployees,
                activeEmployees,
                inactiveEmployees,
                departmentsCount,
                payrollThisMonth,
                pendingLeaves
            },
            departmentStats,
            hiringTrends,
            attendanceSummary,
            payrollHistory
        });
    } catch (err) {
        console.error("Analytics Error:", err);
        res.status(500).json({ message: "Server error fetching analytics" });
    }
};
