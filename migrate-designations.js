const mongoose = require("mongoose");
require("dotenv").config();

// Define temporary schemas for migration
const Designation = mongoose.model("Designation", new mongoose.Schema({
    name: String,
    isDeleted: { type: Boolean, default: false }
}));

const Employee = mongoose.model("Employee", new mongoose.Schema({
    jobTitle: String,
    designation: { type: mongoose.Schema.Types.ObjectId, ref: "Designation" }
}));

async function migrate() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB for migration...");

        const employees = await Employee.find({ designation: null, jobTitle: { $ne: null } });
        console.log(`Found ${employees.length} employees with legacy jobTitle but no designation.`);

        for (const emp of employees) {
            // Find or create designation
            let designation = await Designation.findOne({ name: { $regex: new RegExp("^" + emp.jobTitle + "$", "i") } });

            if (!designation) {
                console.log(`Creating new designation for: ${emp.jobTitle}`);
                designation = await Designation.create({ name: emp.jobTitle });
            }

            emp.designation = designation._id;
            await emp.save();
            console.log(`Migrated employee ${emp._id}: ${emp.jobTitle} -> ${designation.name}`);
        }

        console.log("Migration completed successfully!");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

migrate();
