import messagemodel from "../models/MessageModel.js";
import { io } from "../server.js"; // Import the io instance
import usermodel from "../models/UserModel.js";

// Helper function to extract mentions from content
const extractMentions = (content) => {
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;
    
    while ((match = mentionRegex.exec(content)) !== null) {
        mentions.push({
            username: match[1],
            // userId will be populated later
        });
    }
    
    return mentions;
};

// Helper function to process mentions
const processMentions = async (mentions) => {
    const processedMentions = [];
    
    for (const mention of mentions) {
        const user = await usermodel.findOne({ username: mention.username });
        if (user) {
            processedMentions.push({
                userId: user._id,
                username: mention.username
            });
        }
    }
    
    return processedMentions;
};


export const sendMessage = async (req, res) => {
    try {
        const { userid, receiverid } = req.params;
        const { 
            content, 
            messageType, 
            expiresInMinutes, 
            groupId, 
            isViewOnce,
            isVanishing,
            vanishAfterSeconds,
            repliedTo,
            replyContent,
            bubbleColor,
            textColor
        } = req.body;
        let { mediaUrl } = req.body;

        // Handle file upload if present
        if (req.file) {
            mediaUrl = `/uploads/${req.file.filename}`;
        }

        console.log(`Creating message from user ${userid} to ${receiverid || groupId}: type=${messageType}, content="${content}"`);

        // Extract and process mentions
        let mentions = [];
        if (content) {
            const rawMentions = extractMentions(content);
            mentions = await processMentions(rawMentions);
        }

        // Calculate expiration date if specified
        let expiresAt = null;
        if (expiresInMinutes && typeof expiresInMinutes === 'number' && expiresInMinutes > 0) {
            expiresAt = new Date(Date.now() + (expiresInMinutes * 60 * 1000));
        }

        // Handle vanishing mode
        const vanishingSettings = {};
        if (isVanishing) {
            vanishingSettings.isVanishing = true;
            vanishingSettings.vanishAfterSeconds = vanishAfterSeconds || 0;
        }

        const messagedetails = new messagemodel({
            sender: userid,
            receiver: receiverid, // Can be null if it's a group message
            group: groupId,      // New field for group chat
            content: content || '',
            messageType: messageType || (req.file ? (req.file.mimetype.startsWith('image/') ? 'image' : 'video') : 'text'),
            mediaUrl: mediaUrl,
            expiresAt: expiresAt,
            expiresInMinutes: expiresInMinutes,
            isViewOnce: isViewOnce || false,
            viewedBy: [],
            ...vanishingSettings,
            repliedTo: repliedTo,
            replyContent: replyContent,
            bubbleColor: bubbleColor || 'default',
            textColor: textColor || 'default',
            mentions: mentions
        });

        await messagedetails.save();

        // Populate sender/receiver for real-time update
        await messagedetails.populate('sender', 'name avatar username');
        await messagedetails.populate('receiver', 'name avatar username');
        if (messagedetails.repliedTo) {
            await messagedetails.populate('repliedTo', 'content sender');
        }

        console.log(`Message saved with ID: ${messagedetails._id}`);

        // Emit real-time message to receiver
        if (io) {
            // For group messages
            if (groupId) {
                io.to(`group_${groupId}`).emit('new-message', {
                    message: messagedetails,
                    senderId: userid,
                    groupId: groupId
                });
            } else {
                // For direct messages
                io.to(receiverid).emit('new-message', {
                    message: messagedetails,
                    senderId: userid,
                    receiverId: receiverid
                });
            }

            // Send mention notifications
            if (mentions.length > 0) {
                mentions.forEach(mention => {
                    io.to(mention.userId.toString()).emit('mention-notification', {
                        message: messagedetails,
                        mention: mention
                    });
                });
            }
        }

        // Return the created message with its ID for client-side handling
        res.status(200).send({
            success: true,
            message: 'Message sent successfully',
            messageDetails: messagedetails
        });
    }
    catch (error) {
        console.error('Error in sendMessage controller:', error);
        res.status(500).send({
            message: "Something Went Wrong",
            success: false
        });
    }
}

// NEW: Add reaction to a message
export const addReaction = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { userId, emoji } = req.body;

        console.log(`Adding reaction ${emoji} from user ${userId} to message ${messageId}`);

        const message = await messagemodel.findById(messageId);
        if (!message) {
            return res.status(404).send({
                message: "Message not found",
                success: false
            });
        }

        // Check if user already reacted with this emoji
        const existingReactionIndex = message.reactions.findIndex(
            r => r.userId.toString() === userId.toString()
        );

        if (existingReactionIndex >= 0) {
            // Update existing reaction
            message.reactions[existingReactionIndex].emoji = emoji;
            message.reactions[existingReactionIndex].timestamp = Date.now();
        } else {
            // Add new reaction
            message.reactions.push({
                userId: userId,
                emoji: emoji
            });
        }

        await message.save();

        // Populate sender/receiver for real-time update
        await message.populate('sender', 'name avatar');
        await message.populate('receiver', 'name avatar');

        // Emit real-time reaction update
        if (io) {
            io.to(message.receiver.toString()).emit('message-reaction', {
                messageId: messageId,
                userId: userId,
                emoji: emoji,
                message: message
            });
        }

        res.status(200).send({
            success: true,
            message: 'Reaction added successfully',
            reaction: {
                userId: userId,
                emoji: emoji
            }
        });
    } catch (error) {
        console.error('Error in addReaction controller:', error);
        res.status(500).send({
            message: "Something Went Wrong",
            success: false
        });
    }
};

// NEW: Remove reaction from a message
export const removeReaction = async (req, res) => {
    try {
        const { messageId, userId } = req.params;

        console.log(`Removing reaction from user ${userId} on message ${messageId}`);

        const message = await messagemodel.findById(messageId);
        if (!message) {
            return res.status(404).send({
                message: "Message not found",
                success: false
            });
        }

        // Remove reaction from user
        message.reactions = message.reactions.filter(
            r => r.userId.toString() !== userId.toString()
        );

        await message.save();

        // Populate sender/receiver for real-time update
        await message.populate('sender', 'name avatar');
        await message.populate('receiver', 'name avatar');

        // Emit real-time reaction update
        if (io) {
            io.to(message.receiver.toString()).emit('message-reaction-removed', {
                messageId: messageId,
                userId: userId,
                message: message
            });
        }

        res.status(200).send({
            success: true,
            message: 'Reaction removed successfully'
        });
    } catch (error) {
        console.error('Error in removeReaction controller:', error);
        res.status(500).send({
            message: "Something Went Wrong",
            success: false
        });
    }
};

// NEW: Mark message as read
export const markMessageAsRead = async (req, res) => {
    try {
        const { messageId } = req.params;

        console.log(`Marking message ${messageId} as read`);

        const message = await messagemodel.findByIdAndUpdate(
            messageId,
            {
                read: true,
                readAt: new Date()
            },
            { new: true }
        ).populate('sender', 'name avatar');

        if (!message) {
            return res.status(404).send({
                message: "Message not found",
                success: false
            });
        }

        // Emit real-time read receipt
        if (io) {
            io.to(message.sender.toString()).emit('message-read', {
                messageId: messageId,
                readAt: message.readAt
            });
        }

        res.status(200).send({
            success: true,
            message: 'Message marked as read'
        });
    } catch (error) {
        console.error('Error in markMessageAsRead controller:', error);
        res.status(500).send({
            message: "Something Went Wrong",
            success: false
        });
    }
};

// NEW: Search messages
export const searchMessages = async (req, res) => {
    try {
        const { userid } = req.params;
        const { query, messageType, dateFrom, dateTo } = req.query;

        console.log(`Searching messages for user ${userid}, query: ${query}`);

        // Build search query
        let searchConditions = {
            $or: [
                { sender: userid },
                { receiver: userid }
            ]
        };

        // Add text search condition
        if (query && query.trim()) {
            searchConditions.content = { $regex: query, $options: 'i' };
        }

        // Add message type filter
        if (messageType) {
            searchConditions.messageType = messageType;
        }

        // Add date range filter
        if (dateFrom || dateTo) {
            searchConditions.timestamp = {};
            if (dateFrom) {
                searchConditions.timestamp.$gte = new Date(dateFrom);
            }
            if (dateTo) {
                searchConditions.timestamp.$lte = new Date(dateTo);
            }
        }

        const messages = await messagemodel
            .find(searchConditions)
            .populate('sender', 'name avatar')
            .populate('receiver', 'name avatar')
            .sort({ timestamp: -1 });

        res.status(200).send({
            success: true,
            messages: messages,
            count: messages.length
        });
    } catch (error) {
        console.error('Error in searchMessages controller:', error);
        res.status(500).send({
            message: "Something Went Wrong",
            success: false
        });
    }
};

export const getMessage = async (req, res) => {
    try {
        const { userid } = req.params;

        console.log(`Fetching all messages for user ${userid}`);

        // Fetch messages where user is receiver
        const messagesAsReceiver = await messagemodel
            .find({ receiver: userid })
            .populate('sender', 'name avatar')
            .populate('receiver', 'name avatar');

        // Fetch messages where user is sender
        const messagesAsSender = await messagemodel
            .find({ sender: userid })
            .populate('sender', 'name avatar')
            .populate('receiver', 'name avatar');

        // Combine all messages
        const allMessages = [...messagesAsReceiver, ...messagesAsSender]
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Sort by newest first

        // Update read status for messages where user is receiver
        await messagemodel.updateMany(
            { receiver: userid, read: false },
            { read: true, readAt: new Date() }
        );

        console.log(`Found total of ${allMessages.length} messages for user ${userid}`);

        res.status(200).send({
            messagedetails: allMessages,
            success: true
        });
    }
    catch (error) {
        console.error('Error in getMessage controller:', error);
        res.status(500).send({
            message: "Something Went Wrong",
            success: false
        });
    }
}

export const DirectMessage = async (req, res) => {
    try {
        const { userid, senderid } = req.params;

        console.log(`Fetching messages between users ${userid} and ${senderid}`);

        // Fetch messages where current user is receiver and other user is sender
        const incomingMessages = await messagemodel.find({
            receiver: userid,
            sender: senderid
        }).populate('sender', 'name avatar');

        console.log(`Found ${incomingMessages.length} incoming messages`);

        // Fetch messages where current user is sender and other user is receiver
        const outgoingMessages = await messagemodel.find({
            receiver: senderid,
            sender: userid
        }).populate('sender', 'name avatar');

        console.log(`Found ${outgoingMessages.length} outgoing messages`);

        // Combine and sort messages by timestamp
        const allMessages = [...incomingMessages, ...outgoingMessages]
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        // Update read status for messages where user is receiver
        await messagemodel.updateMany(
            { receiver: userid, sender: senderid, read: false },
            { read: true, readAt: new Date() }
        );

        console.log(`Total messages: ${allMessages.length}`);

        res.status(200).send({
            messagedetails: allMessages,
            success: true
        });
    }
    catch (error) {
        console.error('Error in DirectMessage controller:', error);
        res.status(500).send({
            message: "Something Went Wrong",
            success: false
        });
    }
}

// NEW: Mark message as viewed (for view-once messages)
export const markMessageAsViewed = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { userId } = req.body;

        console.log(`Marking message ${messageId} as viewed by user ${userId}`);

        const message = await messagemodel.findById(messageId);
        if (!message) {
            return res.status(404).send({
                message: "Message not found",
                success: false
            });
        }

        // Add user to viewedBy array if not already there
        if (!message.viewedBy.includes(userId)) {
            message.viewedBy.push(userId);
            
            // If it's a view-once message, set expiration
            if (message.isViewOnce) {
                message.expiresAt = new Date(Date.now() + 5000); // Expire in 5 seconds
            }
        }

        await message.save();

        // Emit real-time view update
        if (io) {
            io.to(message.sender.toString()).emit('message-viewed', {
                messageId: messageId,
                userId: userId,
                viewedAt: new Date()
            });
        }

        res.status(200).send({
            success: true,
            message: 'Message marked as viewed'
        });
    } catch (error) {
        console.error('Error in markMessageAsViewed controller:', error);
        res.status(500).send({
            message: "Something Went Wrong",
            success: false
        });
    }
};

// NEW: Report message as spam
export const reportMessageAsSpam = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { userId } = req.body;

        console.log(`Reporting message ${messageId} as spam by user ${userId}`);

        const message = await messagemodel.findById(messageId);
        if (!message) {
            return res.status(404).send({
                message: "Message not found",
                success: false
            });
        }

        // Add user to spam reporters if not already there
        if (!message.spamReportedBy.includes(userId)) {
            message.spamReportedBy.push(userId);
            message.isSpam = true;
        }

        await message.save();

        res.status(200).send({
            success: true,
            message: 'Message reported as spam'
        });
    } catch (error) {
        console.error('Error in reportMessageAsSpam controller:', error);
        res.status(500).send({
            message: "Something Went Wrong",
            success: false
        });
    }
};

// NEW: Get group messages
export const getUserGroupMessages = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userId } = req.query;

        console.log(`Fetching messages for group ${groupId}`);

        const messages = await messagemodel
            .find({ group: groupId })
            .populate('sender', 'name avatar username')
            .populate('repliedTo', 'content sender')
            .sort({ timestamp: 1 });

        // Mark messages as read for this user
        await messagemodel.updateMany(
            { group: groupId, read: false },
            { 
                read: true, 
                readAt: new Date() 
            }
        );

        res.status(200).send({
            success: true,
            messages: messages
        });
    } catch (error) {
        console.error('Error in getGroupMessages controller:', error);
        res.status(500).send({
            message: "Something Went Wrong",
            success: false
        });
    }
};

// NEW: Create group chat
export const createGroupChat = async (req, res) => {
    try {
        const { groupName, participants, adminId } = req.body;

        console.log(`Creating group chat: ${groupName} with ${participants.length} participants`);

        // Create group message to represent the group chat
        const groupMessage = new messagemodel({
            sender: adminId,
            content: `Group created: ${groupName}`,
            messageType: 'text',
            isAdminMessage: true,
            group: null // Will be set after creating the group
        });

        await groupMessage.save();

        res.status(200).send({
            success: true,
            message: 'Group chat created successfully',
            groupId: groupMessage._id
        });
    } catch (error) {
        console.error('Error in createGroupChat controller:', error);
        res.status(500).send({
            message: "Something Went Wrong",
            success: false
        });
    }
};

export const getMessagedUsers = async (req, res) => {
    try {
        const { userid } = req.params;

        console.log(`Fetching all users who have exchanged messages with user ${userid}`);

        // Find all messages where the user is either sender or receiver
        const sentMessages = await messagemodel
            .find({ sender: userid })
            .distinct('receiver');

        const receivedMessages = await messagemodel
            .find({ receiver: userid })
            .distinct('sender');

        // Combine unique user IDs
        const uniqueUserIds = [...new Set([...sentMessages, ...receivedMessages])];

        console.log(`Found ${uniqueUserIds.length} users with message history`);

        // Populate user details for these IDs
        const populatedUsers = await messagemodel.model('User')
            .find({ _id: { $in: uniqueUserIds } })
            .select('_id name username email avatar');

        // For each user, get their most recent message
        const usersWithLastMessage = await Promise.all(populatedUsers.map(async (user) => {
            // Get the latest message between the current user and this user
            const latestMessage = await messagemodel
                .findOne({
                    $or: [
                        { sender: userid, receiver: user._id },
                        { sender: user._id, receiver: userid }
                    ]
                })
                .sort({ timestamp: -1 })
                .limit(1);

            return {
                ...user.toObject(),
                lastMessage: latestMessage ? {
                    content: latestMessage.content,
                    timestamp: latestMessage.timestamp,
                    isFromUser: latestMessage.sender.toString() === userid
                } : null
            };
        }));

        // Sort by the timestamp of the last message (most recent first)
        const sortedUsers = usersWithLastMessage.sort((a, b) => {
            if (!a.lastMessage) return 1;
            if (!b.lastMessage) return -1;
            return new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp);
        });

        res.status(200).send({
            users: sortedUsers,
            success: true
        });
    }
    catch (error) {
        console.error('Error in getMessagedUsers controller:', error);
        res.status(500).send({
            message: "Something went wrong retrieving message contacts",
            success: false
        });
    }
}