const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./src/models/User');
const LeaveType = require('./src/models/LeaveType');

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB Atlas');

        // Seed Admin User
        const adminEmail = 'admin@company.com';
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            const admin = new User({
                name: 'Admin User',
                email: adminEmail,
                password: hashedPassword,
                role: 'ADMIN',
                department: 'Management',
                phone: '1234567890',
                status: 'Active'
            });
            await admin.save();
            console.log('✅ Admin user created');
            console.log('   Email: admin@company.com');
            console.log('   Password: admin123');
        } else {
            console.log('ℹ️  Admin user already exists');
        }

        // Seed Leave Types
        const defaultLeaveTypes = [
            { name: 'Sick Leave', description: 'For medical reasons and health issues', daysPerYear: 12 },
            { name: 'Casual Leave', description: 'For personal reasons or short-term needs', daysPerYear: 10 },
            { name: 'Annual Leave', description: 'Vacation or planned long-term leaves', daysPerYear: 20 },
            { name: 'Maternity Leave', description: 'For expected mothers', daysPerYear: 90 },
            { name: 'Paternity Leave', description: 'For expected fathers', daysPerYear: 15 }
        ];

        for (const type of defaultLeaveTypes) {
            await LeaveType.findOneAndUpdate(
                { name: type.name },
                type,
                { upsert: true, new: true }
            );
            console.log(`✅ Seeded leave type: ${type.name}`);
        }

        console.log('\n🎉 Database seeding complete!');
        console.log('\n📝 You can now login with:');
        console.log('   Email: admin@company.com');
        console.log('   Password: admin123');

        process.exit(0);
    } catch (err) {
        console.error('❌ Error seeding database:', err);
        process.exit(1);
    }
};

seedDatabase();
