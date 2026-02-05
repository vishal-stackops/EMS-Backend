const mongoose = require("mongoose");

const payrollSchema = new mongoose.Schema(
    {
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: true
        },
        month: { type: String, required: true }, // e.g., "February"
        year: { type: Number, required: true },
        basicSalary: { type: Number, required: true },
        allowances: { type: Number, default: 0 },
        deductions: { type: Number, default: 0 },
        netSalary: { type: Number, required: true },
        status: { type: String, enum: ["Paid", "Pending"], default: "Pending" },
        paymentDate: { type: Date },
    },
    { timestamps: true }
);

// Compound index to ensure uniqueness per employee per month/year
payrollSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model("Payroll", payrollSchema);
