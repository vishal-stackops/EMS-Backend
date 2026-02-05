const mongoose = require('mongoose');
require('dotenv').config();
const LeaveType = require('./src/models/LeaveType');

const seedLeaveTypes = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const defaultTypes = [
            { name: 'Sick Leave', description: 'For medical reasons and health issues', daysPerYear: 12 },
            { name: 'Casual Leave', description: 'For personal reasons or short-term needs', daysPerYear: 10 },
            { name: 'Annual Leave', description: 'Vacation or planned long-term leaves', daysPerYear: 20 },
            { name: 'Maternity Leave', description: 'For expected mothers', daysPerYear: 90 },
            { name: 'Paternity Leave', description: 'For expected fathers', daysPerYear: 15 }
        ];

        for (const type of defaultTypes) {
            await LeaveType.findOneAndUpdate(
                { name: type.name },
                type,
                { upsert: true, new: true }
            );
            console.log(`Seeded/Updated leave type: ${type.name}`);
        }

        console.log('Seeding complete!');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding leaves:', err);
        process.exit(1);
    }
};

seedLeaveTypes();
