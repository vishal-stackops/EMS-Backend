const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        phone: { type: String },
        department: { type: String },
        // Removed jobTitle string field in favor of designation reference
        salary: { type: Number },
        joiningDate: { type: Date, default: Date.now },
        status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
        isDeleted: { type: Boolean, default: false }, // Soft delete
        designation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Designation",
        },

    },
    { timestamps: true }
);

module.exports = mongoose.model("Employee", employeeSchema);
