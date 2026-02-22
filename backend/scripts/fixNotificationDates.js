import mongoose from 'mongoose';
import NotificationModel from '../models/NotificationModel.js';
import { db } from '../config/db.js';

// Script to fix invalid date entries in notifications
const fixNotificationDates = async () => {
    try {
        // Connect to database
        await db;
        console.log('Connected to database');
        
        // Find notifications with invalid dates
        const notifications = await NotificationModel.find({});
        console.log(`Found ${notifications.length} notifications`);
        
        let fixedCount = 0;
        
        for (const notification of notifications) {
            // Check if date is valid
            if (!notification.date || notification.date.toString() === 'Invalid Date') {
                console.log(`Fixing notification ${notification._id} with invalid date`);
                // Set to current date or a reasonable default
                notification.date = new Date();
                await notification.save();
                fixedCount++;
            }
        }
        
        console.log(`Fixed ${fixedCount} notifications with invalid dates`);
        
        // Verify the fix
        const invalidNotifications = await NotificationModel.find({
            date: { $exists: true, $type: 9 } // Type 9 is Date in MongoDB
        }).where('date').equals(new Date('Invalid Date'));
        
        console.log(`Remaining invalid date notifications: ${invalidNotifications.length}`);
        
        mongoose.connection.close();
        console.log('Database connection closed');
        
    } catch (error) {
        console.error('Error fixing notification dates:', error);
        mongoose.connection.close();
    }
};

// Run the script
fixNotificationDates();