import MessageRequestModel from "../models/MessageRequestModel.js";
import messagemodel from "../models/MessageModel.js";
import BlockModel from "../models/BlockModel.js";
import notificationmodel from "../models/NotificationModel.js";
import followermodel from "../models/FollowModel.js";
import { io } from "../server.js";

// Send message request to non-contact
export const sendMessageRequest = async (req, res) => {
    try {
        const { senderId, receiverId } = req.params;
        const { content, messageType, mediaUrl } = req.body;

        // Check if users are already connected (following each other)
        const followCheck1 = await followermodel.findOne({
            follower: senderId,
            following: receiverId
        });
        const followCheck2 = await followermodel.findOne({
            follower: receiverId,
            following: senderId
        });

        if (followCheck1 && followCheck2) {
            return res.status(400).json({
                success: false,
                message: "Users are already connected. Send direct message instead."
            });
        }

        // Check if blocked
        const isBlocked = await BlockModel.findOne({
            $or: [
                { blocker: senderId, blocked: receiverId },
                { blocker: receiverId, blocked: senderId }
            ]
        });

        if (isBlocked) {
            return res.status(403).json({
                success: false,
                message: "Messaging not allowed due to privacy settings"
            });
        }

        // Check for existing pending request
        const existingRequest = await MessageRequestModel.findOne({
            sender: senderId,
            receiver: receiverId,
            status: 'pending'
        });

        if (existingRequest) {
            return res.status(400).json({
                success: false,
                message: "Message request already sent and pending"
            });
        }

        // Create message request
        const messageRequest = new MessageRequestModel({
            sender: senderId,
            receiver: receiverId,
            content,
            messageType,
            mediaUrl
        });

        await messageRequest.save();

        // Create notification for receiver
        const notification = new notificationmodel({
            user: receiverId,
            type: 'message_request',
            fromUser: senderId,
            message: `${req.user?.name || 'Someone'} wants to message you`,
            date: new Date(),
            isRead: false,
            metadata: {
                requestId: messageRequest._id.toString(),
                content: content.substring(0, 50) + (content.length > 50 ? '...' : '')
            }
        });

        await notification.save();

        // Emit real-time notification
        if (io) {
            const populatedNotification = await notificationmodel.findById(notification._id)
                .populate('fromUser', 'name avatar username');
            
            io.to(receiverId).emit('new-notification', populatedNotification);
            
            // Update unread count
            const unreadCount = await notificationmodel.countDocuments({
                user: receiverId,
                isRead: false
            });
            
            io.to(receiverId).emit('unread-count-updated', {
                userId: receiverId,
                count: unreadCount
            });
        }

        res.status(201).json({
            success: true,
            message: "Message request sent successfully",
            requestId: messageRequest._id
        });

    } catch (error) {
        console.error("Error sending message request:", error);
        res.status(500).json({
            success: false,
            message: "Failed to send message request"
        });
    }
};

// Get message requests for user
export const getMessageRequests = async (req, res) => {
    try {
        const { userId } = req.params;
        const { status = 'pending' } = req.query;

        const requests = await MessageRequestModel.find({
            receiver: userId,
            status: status
        })
        .populate('sender', 'name username avatar')
        .sort({ sentAt: -1 });

        res.status(200).json({
            success: true,
            requests,
            count: requests.length
        });

    } catch (error) {
        console.error("Error fetching message requests:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch message requests"
        });
    }
};

// Accept message request
export const acceptMessageRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { userId } = req.body; // receiver ID

        const request = await MessageRequestModel.findById(requestId);
        
        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Message request not found"
            });
        }

        if (request.receiver.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized to accept this request"
            });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: "Request is no longer pending"
            });
        }

        // Update request status
        request.status = 'accepted';
        request.respondedAt = new Date();
        await request.save();

        // Create actual message from the request
        const message = new messagemodel({
            sender: request.sender,
            receiver: request.receiver,
            content: request.content,
            messageType: request.messageType,
            mediaUrl: request.mediaUrl,
            timestamp: request.sentAt
        });

        await message.save();

        // Create notification for sender
        const notification = new notificationmodel({
            user: request.sender,
            type: 'message_request_accepted',
            fromUser: request.receiver,
            message: `${req.user?.name || 'Someone'} accepted your message request`,
            date: new Date(),
            isRead: false
        });

        await notification.save();

        // Emit real-time updates
        if (io) {
            // Notify sender about acceptance
            const populatedNotification = await notificationmodel.findById(notification._id)
                .populate('fromUser', 'name avatar username');
            
            io.to(request.sender.toString()).emit('new-notification', populatedNotification);
            
            // Send the actual message to both parties
            const populatedMessage = await messagemodel.findById(message._id)
                .populate('sender', 'name avatar username')
                .populate('receiver', 'name avatar username');
            
            io.to(request.sender.toString()).emit('new-message', {
                message: populatedMessage,
                senderId: request.sender.toString(),
                receiverId: request.receiver.toString()
            });
            
            io.to(request.receiver.toString()).emit('new-message', {
                message: populatedMessage,
                senderId: request.sender.toString(),
                receiverId: request.receiver.toString()
            });
        }

        res.status(200).json({
            success: true,
            message: "Message request accepted successfully",
            messageId: message._id
        });

    } catch (error) {
        console.error("Error accepting message request:", error);
        res.status(500).json({
            success: false,
            message: "Failed to accept message request"
        });
    }
};

// Decline message request
export const declineMessageRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { userId } = req.body; // receiver ID

        const request = await MessageRequestModel.findById(requestId);
        
        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Message request not found"
            });
        }

        if (request.receiver.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized to decline this request"
            });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: "Request is no longer pending"
            });
        }

        // Update request status
        request.status = 'declined';
        request.respondedAt = new Date();
        await request.save();

        // Create notification for sender
        const notification = new notificationmodel({
            user: request.sender,
            type: 'message_request_declined',
            fromUser: request.receiver,
            message: `${req.user?.name || 'Someone'} declined your message request`,
            date: new Date(),
            isRead: false
        });

        await notification.save();

        // Emit real-time notification
        if (io) {
            const populatedNotification = await notificationmodel.findById(notification._id)
                .populate('fromUser', 'name avatar username');
            
            io.to(request.sender.toString()).emit('new-notification', populatedNotification);
        }

        res.status(200).json({
            success: true,
            message: "Message request declined successfully"
        });

    } catch (error) {
        console.error("Error declining message request:", error);
        res.status(500).json({
            success: false,
            message: "Failed to decline message request"
        });
    }
};

// Get sent message requests
export const getSentMessageRequests = async (req, res) => {
    try {
        const { userId } = req.params;
        const { status = 'pending' } = req.query;

        const requests = await MessageRequestModel.find({
            sender: userId,
            status: status
        })
        .populate('receiver', 'name username avatar')
        .sort({ sentAt: -1 });

        res.status(200).json({
            success: true,
            requests,
            count: requests.length
        });

    } catch (error) {
        console.error("Error fetching sent message requests:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch sent message requests"
        });
    }
};