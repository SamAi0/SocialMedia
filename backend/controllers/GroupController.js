import GroupModel from "../models/GroupModel.js";
import messagemodel from "../models/MessageModel.js";

// Create a new group
export const createGroup = async (req, res) => {
    try {
        const { name, description, members } = req.body;
        const admin = req.userId; // Assuming auth middleware sets this

        // Add admin to members if not already included
        const allMembers = members ? [...new Set([...members, admin])] : [admin];

        const newGroup = new GroupModel({
            name,
            description,
            admin,
            members: allMembers
        });

        await newGroup.save();

        res.status(201).json({
            success: true,
            group: newGroup,
            message: "Group created successfully"
        });
    } catch (error) {
        console.error("Create group error:", error);
        res.status(500).json({ success: false, message: "Failed to create group" });
    }
};

// Add member to group
export const addMember = async (req, res) => {
    try {
        const { groupId, userId } = req.body;

        const group = await GroupModel.findById(groupId);
        if (!group) return res.status(404).json({ success: false, message: "Group not found" });

        // Check if requester is admin
        if (group.admin.toString() !== req.userId) {
            return res.status(403).json({ success: false, message: "Only admin can add members" });
        }

        if (group.members.includes(userId)) {
            return res.status(400).json({ success: false, message: "User already in group" });
        }

        group.members.push(userId);
        await group.save();

        res.status(200).json({ success: true, message: "Member added", group });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get group messages
export const getGroupMessages = async (req, res) => {
    try {
        const { groupId } = req.params;

        // specific check for group membership could be added here

        const messages = await messagemodel.find({ group: groupId })
            .populate("sender", "name avatar")
            .sort({ timestamp: 1 });

        res.status(200).json({ success: true, messages });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch messages" });
    }
};

// Get user's groups
export const getUserGroups = async (req, res) => {
    try {
        const groups = await GroupModel.find({ members: req.userId })
            .populate("admin", "name");
        res.status(200).json({ success: true, groups });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch groups" });
    }
};
