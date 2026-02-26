import mongoose from 'mongoose';

async function debugUsers() {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/kids-coding-platform';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        // Get the users collection directly
        const usersCollection = mongoose.connection.collection('users');
        
        // Find all users and check their age groups
        const allUsers = await usersCollection.find({}).toArray();
        console.log(`📊 Total users: ${allUsers.length}`);
        
        // Group by age group
        const ageGroupCounts: Record<string, number> = {};
        allUsers.forEach(user => {
            const ageGroup = user.ageGroup || 'undefined';
            ageGroupCounts[ageGroup] = (ageGroupCounts[ageGroup] || 0) + 1;
        });
        
        console.log('📈 Age group distribution:');
        Object.entries(ageGroupCounts).forEach(([ageGroup, count]) => {
            console.log(`  ${ageGroup}: ${count}`);
        });
        
        // Find users with 'middle_school' specifically
        const middleSchoolUsers = await usersCollection.find({
            ageGroup: 'middle_school'
        }).toArray();
        
        console.log(`🔍 Users with 'middle_school' age group: ${middleSchoolUsers.length}`);
        middleSchoolUsers.forEach(user => {
            console.log(`  - ${user.username || user.email}: ${user.ageGroup}`);
        });

        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

debugUsers();
