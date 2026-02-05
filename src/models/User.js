// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    email: { type: String, required: true, unique: true, lowercase: true },

    password: { type: String, required: true },

    role: { type: mongoose.Schema.Types.ObjectId, ref: "Role", required: true },

    isActive: { type: Boolean, default: true },

    approvalStatus: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING'
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },

    approvedAt: Date,

    rejectionReason: String,

    resetPasswordToken: String,

    resetPasswordExpire: Date,

  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
