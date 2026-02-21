import BlockModel from "../models/BlockModel.js";
import usermodel from "../models/UserModel.js";

// Block a user
export const blockUser = async (req, res) => {
    try {
        const { blockId } = req.body; // ID of user to block
        const blockerId = req.userId;

        if (blockId === blockerId) {
            return res.status(400).json({ success: false, message: "Cannot block yourself" });
        }

        const existingBlock = await BlockModel.findOne({ blocker: blockerId, blocked: blockId });
        if (existingBlock) {
            return res.status(400).json({ success: false, message: "User already blocked" });
        }

        const newBlock = new BlockModel({
            blocker: blockerId,
            blocked: blockId
        });

        await newBlock.save();

        // Optional: Unfollow each other logic here if desired

        res.status(200).json({ success: true, message: "User blocked successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to block user" });
    }
};

// Unblock a user
export const unblockUser = async (req, res) => {
    try {
        const { blockId } = req.body;
        const blockerId = req.userId;

        await BlockModel.findOneAndDelete({ blocker: blockerId, blocked: blockId });

        res.status(200).json({ success: true, message: "User unblocked successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to unblock user" });
    }
};

// Get blocked users
export const getBlockedUsers = async (req, res) => {
    try {
        const blocks = await BlockModel.find({ blocker: req.userId })
            .populate("blocked", "name username avatar");

        res.status(200).json({ success: true, users: blocks.map(b => b.blocked) });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch blocked users" });
    }
};
