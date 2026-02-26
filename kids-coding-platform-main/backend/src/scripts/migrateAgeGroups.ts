import mongoose from 'mongoose';

// MongoDB connection
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kids-coding-platform';
        await mongoose.connect(mongoURI);
        console.log('✅ Connected to MongoDB for migration');
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        process.exit(1);
    }
};

// Age group migration function
const migrateAgeGroups = async () => {
    try {
        console.log('🔄 Starting age group migration...');
        
        // Get the users collection directly (bypassing schema validation)
        const usersCollection = mongoose.connection.collection('users');
        
        // Find users with old age group values
        const usersToMigrate = await usersCollection.find({
            ageGroup: { $in: ['early_elementary', 'late_elementary', 'early_teen', 'late_teen', 'middle_school', 'preschool'] }
        }).toArray();
        
        console.log(`📊 Found ${usersToMigrate.length} users to migrate`);
        
        if (usersToMigrate.length === 0) {
            console.log('✅ No users need migration');
            return;
        }
        
        // Migration mapping
        const ageGroupMapping: Record<string, string> = {
            'preschool': 'young_learners',           // 4-6 years
            'early_elementary': 'young_learners',    // 4-6 years
            'late_elementary': 'elementary',         // 7-10 years
            'middle_school': 'elementary',           // 7-10 years
            'early_teen': 'advanced',                // 11-15 years
            'late_teen': 'advanced'                  // 11-15 years (same as early_teen)
        };
        
        let migratedCount = 0;
        
        // Update each user
        for (const user of usersToMigrate) {
            const oldAgeGroup = user.ageGroup;
            const newAgeGroup = ageGroupMapping[oldAgeGroup];
            
            if (newAgeGroup) {
                await usersCollection.updateOne(
                    { _id: user._id },
                    { $set: { ageGroup: newAgeGroup } }
                );
                
                console.log(`✅ Migrated user ${user.username || user._id}: ${oldAgeGroup} → ${newAgeGroup}`);
                migratedCount++;
            } else {
                console.log(`⚠️  Unknown age group for user ${user.username || user._id}: ${oldAgeGroup}`);
            }
        }
        
        console.log(`🎉 Migration completed! Migrated ${migratedCount} users`);
        
        // Verify migration
        const remainingOldUsers = await usersCollection.find({
            ageGroup: { $in: ['early_elementary', 'late_elementary', 'early_teen', 'late_teen'] }
        }).toArray();
        
        if (remainingOldUsers.length > 0) {
            console.log(`⚠️  Warning: ${remainingOldUsers.length} users still have old age group values`);
        } else {
            console.log('✅ All users successfully migrated!');
        }
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    }
};

// Main execution
const runMigration = async () => {
    try {
        await connectDB();
        await migrateAgeGroups();
        console.log('🎯 Migration script completed successfully');
    } catch (error) {
        console.error('❌ Migration script failed:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
        process.exit(0);
    }
};

// Run if called directly
if (require.main === module) {
    runMigration();
}

export { migrateAgeGroups };
