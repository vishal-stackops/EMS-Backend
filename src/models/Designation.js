const mongoose = require("mongoose");

const designationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String },
    department: { type: String, required: true },
    isDeleted: { type: Boolean, default: false } // Soft delete
  },
  { timestamps: true }
);

module.exports = mongoose.model("Designation", designationSchema);
