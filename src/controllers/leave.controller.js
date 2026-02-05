const LeaveType = require("../models/LeaveType");
const LeaveRequest = require("../models/LeaveRequest");
const Employee = require("../models/Employee");

// --- Leave Type Management ---

exports.addLeaveType = async (req, res) => {
    try {
        const { name, description, daysPerYear } = req.body;
        const existing = await LeaveType.findOne({ name });
        if (existing) return res.status(400).json({ message: "Leave type already exists" });

        const type = await LeaveType.create({ name, description, daysPerYear });
        res.status(201).json({ message: "Leave type added successfully", type });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getLeaveTypes = async (req, res) => {
    try {
        let types = await LeaveType.find({ isDeleted: false });

        // Auto-seed if empty
        if (types.length === 0) {
            const defaultTypes = [
                { name: 'Sick Leave', description: 'Medical health issues', daysPerYear: 12 },
                { name: 'Casual Leave', description: 'Personal reasons', daysPerYear: 10 },
                { name: 'Annual Leave', description: 'Vacation', daysPerYear: 20 }
            ];
            await LeaveType.insertMany(defaultTypes);
            types = await LeaveType.find({ isDeleted: false });
        }

        res.json(types);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// --- Leave Request Operations ---

exports.applyLeave = async (req, res) => {
    try {
        const { employeeId, leaveTypeId, startDate, endDate, reason } = req.body;

        if (!employeeId || !leaveTypeId || !startDate || !endDate || !reason) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Find the actual employee record. 
        // employeeId might be a User ID or an Employee ID.
        let employee = await Employee.findById(employeeId);

        if (!employee) {
            // Try searching by User ID if we can find a user with this ID and match email
            const User = require("../models/User");
            const user = await User.findById(employeeId);
            if (user) {
                employee = await Employee.findOne({ email: user.email });
            }
        }

        if (!employee) {
            return res.status(404).json({ message: "Employee profile not found. Please contact admin." });
        }

        const leaveRequest = await LeaveRequest.create({
            employee: employee._id,
            leaveType: leaveTypeId,
            startDate,
            endDate,
            reason
        });

        // Use a consistent population/fallback helper if we had one, but for now inline it
        const User = require("../models/User");
        let populatedRequest = await LeaveRequest.findById(leaveRequest._id)
            .populate({
                path: "employee",
                select: "name email department designation",
                populate: {
                    path: "designation",
                    select: "name"
                }
            })
            .populate("leaveType", "name");

        populatedRequest = populatedRequest.toObject();
        if (!populatedRequest.employee) {
            const user = await User.findById(employee._id).select('name email');
            if (user) {
                // Check if this user also has an employee profile
                const employeeDoc = await Employee.findOne({ email: user.email }).populate("designation", "name");
                if (employeeDoc) {
                    populatedRequest.employee = {
                        name: employeeDoc.name,
                        email: employeeDoc.email,
                        department: employeeDoc.department || 'Admin',
                        designation: { name: employeeDoc.designation?.name || 'Admin' }
                    };
                } else {
                    populatedRequest.employee = {
                        name: user.name,
                        email: user.email,
                        department: 'Admin',
                        designation: { name: 'Admin' }
                    };
                }
            }
        }

        res.status(201).json({ message: "Leave application submitted", leaveRequest: populatedRequest });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getEmployeeLeaves = async (req, res) => {
    try {
        let employeeId = req.params.employeeId;

        // Check if this is a User ID instead of Employee ID
        const employee = await Employee.findById(employeeId);
        if (!employee) {
            const User = require("../models/User");
            const user = await User.findById(employeeId);
            if (user) {
                const empDoc = await Employee.findOne({ email: user.email });
                if (empDoc) employeeId = empDoc._id;
            }
        }

        const leaves = await LeaveRequest.find({ employee: employeeId })
            .populate("leaveType", "name")
            .sort({ appliedDate: -1 });
        res.json(leaves);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getAllLeaveRequests = async (req, res) => {
    try {
        const User = require("../models/User");
        let requests = await LeaveRequest.find()
            .populate({
                path: "employee",
                select: "name email department designation",
                populate: {
                    path: "designation",
                    select: "name"
                }
            })
            .populate("leaveType", "name")
            .sort({ appliedDate: -1 });

        // Convert to plain objects to allow modification
        requests = await Promise.all(requests.map(async (req) => {
            const r = req.toObject();
            if (!r.employee) {
                // Fallback: try to find User by original employee query field (which might be a User ID)
                // We need the original raw ID. Mongoose population leaves the field as null if not found.
                // However, we can use the document's original state or refetch.
                const rawDoc = await LeaveRequest.findById(r._id).select('employee');
                if (rawDoc && rawDoc.employee) {
                    const user = await User.findById(rawDoc.employee).select('name email');
                    if (user) {
                        // Check if this user also has an employee profile
                        const employeeDoc = await Employee.findOne({ email: user.email }).populate("designation", "name");
                        if (employeeDoc) {
                            r.employee = {
                                name: employeeDoc.name,
                                email: employeeDoc.email,
                                department: employeeDoc.department || 'Admin',
                                designation: { name: employeeDoc.designation?.name || 'Admin' }
                            };
                        } else {
                            r.employee = {
                                name: user.name,
                                email: user.email,
                                department: 'Admin',
                                designation: { name: 'Admin' }
                            };
                        }
                    }
                }
            }
            return r;
        }));

        res.json(requests);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.updateLeaveStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const request = await LeaveRequest.findById(req.params.id);
        if (!request) return res.status(404).json({ message: "Leave request not found" });

        request.status = status;
        request.approvedBy = req.user.id; // From authMiddleware

        await request.save();

        const User = require("../models/User");
        let populatedRequest = await LeaveRequest.findById(request._id)
            .populate({
                path: "employee",
                select: "name email department designation",
                populate: {
                    path: "designation",
                    select: "name"
                }
            })
            .populate("leaveType", "name");

        populatedRequest = populatedRequest.toObject();
        if (!populatedRequest.employee) {
            const rawDoc = await LeaveRequest.findById(request._id).select('employee');
            if (rawDoc && rawDoc.employee) {
                const user = await User.findById(rawDoc.employee).select('name email');
                if (user) {
                    // Check if this user also has an employee profile
                    const employeeDoc = await Employee.findOne({ email: user.email }).populate("designation", "name");
                    if (employeeDoc) {
                        populatedRequest.employee = {
                            name: employeeDoc.name,
                            email: employeeDoc.email,
                            department: employeeDoc.department || 'Admin',
                            designation: { name: employeeDoc.designation?.name || 'Admin' }
                        };
                    } else {
                        populatedRequest.employee = {
                            name: user.name,
                            email: user.email,
                            department: 'Admin',
                            designation: { name: 'Admin' }
                        };
                    }
                }
            }
        }

        res.json({ message: `Leave ${status.toLowerCase()} successfully`, request: populatedRequest });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};
