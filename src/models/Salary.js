const mongoose = require("mongoose");

const salarySchema = new mongoose.Schema(
    {
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: true,
            unique: true
        },
        basicSalary: { type: Number, required: true },
        allowances: { type: Number, default: 0 },
        deductions: { type: Number, default: 0 },
        netSalary: { type: Number, required: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Salary", salarySchema);
