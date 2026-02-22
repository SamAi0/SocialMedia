import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

// Script to fix invalid date entries in notifications using native MongoDB driver
const fixNotificationDates = async () => {
    const client = new MongoClient(process.env.MONGO_URI || 'mongodb://localhost:27017');
    
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        
        const db = client.db('socialmedia');
        const collection = db.collection('notifications');
        
        // Find all notifications
        const notifications = await collection.find({}).toArray();
        console.log(`Found ${notifications.length} notifications`);
        
        let fixedCount = 0;
        
        for (const notification of notifications) {
            // Check if date is invalid
            if (!notification.date || notification.date.toString() === 'Invalid Date') {
                console.log(`Fixing notification ${notification._id} with invalid date`);
                // Update with current date
                await collection.updateOne(
                    { _id: notification._id },
                    { $set: { date: new Date() } }
                );
                fixedCount++;
            }
        }
        
        console.log(`Fixed ${fixedCount} notifications with invalid dates`);
        
        // Verify the fix
        const remainingInvalid = await collection.find({
            date: { $exists: true }
        }).toArray();
        
        const stillInvalid = remainingInvalid.filter(n => 
            !n.date || n.date.toString() === 'Invalid Date'
        );
        
        console.log(`Remaining invalid date notifications: ${stillInvalid.length}`);
        
    } catch (error) {
        console.error('Error fixing notification dates:', error);
    } finally {
        await client.close();
        console.log('Database connection closed');
    }
};

// Run the script
fixNotificationDates();