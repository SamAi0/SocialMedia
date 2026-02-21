import mongoose from "mongoose";

const BlockSchema = new mongoose.Schema({
    blocker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    blocked: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Ensure a user can block another user only once
BlockSchema.index({ blocker: 1, blocked: 1 }, { unique: true });

const BlockModel = mongoose.model("Block", BlockSchema);
export default BlockModel;
