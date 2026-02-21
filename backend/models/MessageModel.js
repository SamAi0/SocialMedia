import mongoose from "mongoose";

const messagestruct = mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    group: { // Added group field
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group"
    },
    content: {
        type: String,
        default: ''
    },
    mediaUrl: {
        type: String
    },
    messageType: {
        type: String,
        enum: ['text', 'image', 'video', 'voice', 'file'],
        default: 'text'
    },
    // Message reactions
    reactions: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        emoji: {
            type: String,
            default: '❤️'
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    // Message status
    read: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date
    },
    delivered: {
        type: Boolean,
        default: false
    },
    deliveredAt: {
        type: Date
    },
    // Disappearing messages
    expiresAt: {
        type: Date
    },
    expiresInMinutes: {
        type: Number
    },
    isViewOnce: {
        type: Boolean,
        default: false
    },
    viewedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    // Vanishing mode
    isVanishing: {
        type: Boolean,
        default: false
    },
    vanishAfterSeconds: {
        type: Number,
        default: 0
    },
    // Reply functionality
    repliedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },
    replyContent: {
        type: String
    },
    // Admin/group controls
    isAdminMessage: {
        type: Boolean,
        default: false
    },
    // Mentions
    mentions: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        username: String
    }],
    // Message filtering
    isSpam: {
        type: Boolean,
        default: false
    },
    spamReportedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    // Message styling
    bubbleColor: {
        type: String,
        default: 'default'
    },
    textColor: {
        type: String,
        default: 'default'
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Index for message search and filtering
messagestruct.index({ content: "text", sender: 1, receiver: 1, group: 1 });
messagestruct.index({ timestamp: -1 });
messagestruct.index({ expiresAt: 1 });

const messagemodel = mongoose.model('Message', messagestruct)
export default messagemodel