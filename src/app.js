const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
require("dotenv").config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/auth.routes");

const app = express();

// Connect DB
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// Routes
app.use("/api/auth", authRoutes);

// Users
const userRoutes = require("./routes/user.routes");
app.use("/api/users", userRoutes);

// Employees
const employeeRoutes = require("./routes/employee.routes");
app.use("/api/employees", employeeRoutes);

// Deparetments
const departmentRoutes = require("./routes/department.routes");
app.use("/api/departments", departmentRoutes);

// Designation
const designationRoutes = require("./routes/designation.routes");
app.use("/api/designations", designationRoutes);

// Salary
const salaryRoutes = require("./routes/salary.routes");
app.use("/api/salaries", salaryRoutes);

// Payroll
const payrollRoutes = require("./routes/payroll.routes");
app.use("/api/payrolls", payrollRoutes);

// Attendance
const attendanceRoutes = require("./routes/attendance.routes");
app.use("/api/attendance", attendanceRoutes);

// Leave
const leaveRoutes = require("./routes/leave.routes");
app.use("/api/leaves", leaveRoutes);

// Dashboard & Analytics
const dashboardRoutes = require("./routes/dashboard.routes");
app.use("/api/dashboard", dashboardRoutes);



// Health check
app.get("/", (req, res) => {
  res.send("EMS Backend is running 🚀");
});

module.exports = app;
