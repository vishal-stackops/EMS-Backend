const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
    {
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: true
        },
        date: {
            type: Date,
            required: true
        },
        checkIn: {
            type: Date,
            required: true
        },
        checkOut: {
            type: Date
        },
        status: {
            type: String,
            enum: ["Present", "Late", "Absent"],
            default: "Present"
        },
        totalHours: {
            type: Number,
            default: 0
        }
    },
    { timestamps: true }
);

// Compound index to ensure uniqueness per employee per date
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
