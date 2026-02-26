import mongoose from 'mongoose';
import { User } from '../models/User';

async function checkUsers() {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/kids-coding-platform';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        // Find all users and their age groups
        const users = await User.find({}, 'username email ageGroup').exec();
        console.log(`📊 Found ${users.length} total users`);
        
        users.forEach((user, index) => {
            console.log(`${index + 1}. ${user.username || user.email} - ageGroup: ${user.ageGroup}`);
        });

        // Find users with old age group values
        const usersWithOldAgeGroups = await User.find({
            ageGroup: { $in: ['late_elementary', 'early_teen', 'preschool', 'early_elementary'] }
        }).exec();
        
        console.log(`🔍 Found ${usersWithOldAgeGroups.length} users with old age group values:`);
        usersWithOldAgeGroups.forEach((user, index) => {
            console.log(`${index + 1}. ${user.username || user.email} - ageGroup: ${user.ageGroup}`);
        });

        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    } catch (error) {
        console.error('❌ Error checking users:', error);
        process.exit(1);
    }
}

checkUsers();
