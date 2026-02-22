import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

// Script to thoroughly inspect and fix notification date issues
const inspectAndFixDates = async () => {
    const client = new MongoClient(process.env.MONGO_URI || 'mongodb://localhost:27017');
    
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        
        const db = client.db('socialmedia');
        const collection = db.collection('notifications');
        
        // Find all notifications and inspect their date fields
        const notifications = await collection.find({}).toArray();
        console.log(`Found ${notifications.length} notifications`);
        
        let invalidDates = [];
        let validDates = [];
        let nullDates = [];
        let otherTypes = [];
        
        notifications.forEach((notification, index) => {
            const dateValue = notification.date;
            const dateStr = dateValue ? dateValue.toString() : 'null';
            
            console.log(`Notification ${index + 1}: ${notification._id}`);
            console.log(`  Date value: ${dateValue}`);
            console.log(`  Date type: ${typeof dateValue}`);
            console.log(`  Date string: ${dateStr}`);
            
            if (dateValue === null || dateValue === undefined) {
                nullDates.push(notification);
            } else if (dateStr === 'Invalid Date') {
                invalidDates.push(notification);
            } else if (dateValue instanceof Date) {
                validDates.push(notification);
            } else {
                otherTypes.push({ notification, value: dateValue, type: typeof dateValue });
            }
        });
        
        console.log('\n=== SUMMARY ===');
        console.log(`Valid dates: ${validDates.length}`);
        console.log(`Invalid dates: ${invalidDates.length}`);
        console.log(`Null dates: ${nullDates.length}`);
        console.log(`Other types: ${otherTypes.length}`);
        
        // Fix invalid dates
        if (invalidDates.length > 0) {
            console.log('\n=== FIXING INVALID DATES ===');
            for (const notification of invalidDates) {
                console.log(`Fixing notification ${notification._id}`);
                await collection.updateOne(
                    { _id: notification._id },
                    { $set: { date: new Date() } }
                );
            }
            console.log(`Fixed ${invalidDates.length} invalid dates`);
        }
        
        // Fix null dates
        if (nullDates.length > 0) {
            console.log('\n=== FIXING NULL DATES ===');
            for (const notification of nullDates) {
                console.log(`Fixing notification ${notification._id}`);
                await collection.updateOne(
                    { _id: notification._id },
                    { $set: { date: new Date() } }
                );
            }
            console.log(`Fixed ${nullDates.length} null dates`);
        }
        
        // Handle other problematic types
        if (otherTypes.length > 0) {
            console.log('\n=== HANDLING OTHER TYPES ===');
            for (const item of otherTypes) {
                console.log(`Notification ${item.notification._id} has date type: ${item.type}, value:`, item.value);
                // Try to convert to date or set to current date
                let newDate;
                try {
                    newDate = new Date(item.value);
                    if (newDate.toString() === 'Invalid Date') {
                        newDate = new Date();
                    }
                } catch (e) {
                    newDate = new Date();
                }
                
                await collection.updateOne(
                    { _id: item.notification._id },
                    { $set: { date: newDate } }
                );
                console.log(`Fixed to: ${newDate}`);
            }
        }
        
        // Final verification
        console.log('\n=== FINAL VERIFICATION ===');
        const allNotifications = await collection.find({}).toArray();
        const stillProblematic = allNotifications.filter(n => {
            if (!n.date) return true;
            const dateStr = n.date.toString();
            return dateStr === 'Invalid Date';
        });
        
        console.log(`Still problematic notifications: ${stillProblematic.length}`);
        stillProblematic.forEach(n => {
            console.log(`  ${n._id}: ${n.date} (${typeof n.date})`);
        });
        
    } catch (error) {
        console.error('Error inspecting notification dates:', error);
    } finally {
        await client.close();
        console.log('Database connection closed');
    }
};

// Run the script
inspectAndFixDates();