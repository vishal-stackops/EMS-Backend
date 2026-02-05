const mongoose = require("mongoose");

const leaveTypeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true
        },
        description: {
            type: String
        },
        daysPerYear: {
            type: Number,
            required: true,
            default: 0
        },
        isDeleted: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("LeaveType", leaveTypeSchema);
