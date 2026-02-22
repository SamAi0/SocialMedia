import mongoose from "mongoose";

const MessageRequestSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    mediaUrl: {
        type: String
    },
    messageType: {
        type: String,
        enum: ['text', 'image', 'video', 'voice', 'file'],
        default: 'text'
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'declined', 'expired'],
        default: 'pending'
    },
    sentAt: {
        type: Date,
        default: Date.now
    },
    respondedAt: {
        type: Date
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days expiration
    }
});

// Index for efficient querying
MessageRequestSchema.index({ receiver: 1, status: 1 });
MessageRequestSchema.index({ sender: 1, status: 1 });
MessageRequestSchema.index({ expiresAt: 1 });

const MessageRequestModel = mongoose.model("MessageRequest", MessageRequestSchema);
export default MessageRequestModel;