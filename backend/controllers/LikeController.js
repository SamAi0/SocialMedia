import commentmodel from "../models/CommentModel.js";
import likemodel from "../models/LikeModel.js";
import notificationmodel from "../models/NotificationModel.js";
import postmodel from "../models/PostModel.js";

// Mock database for development
const mockLikes = [];

import { generateObjectId } from '../utils/ObjectIdGenerator.js';

export const toggleLikePost = async (req, res) => {
    try {
        const { userid, postid } = req.params;
        
        // Check if we're using mock database
        if (process.env.USE_MOCK_DB === 'true') {
            // Mock database implementation
            const existingLikeIndex = mockLikes.findIndex(like => 
                like.user === userid && like.post === postid && like.type === 'post'
            );

            let isLiked = false;
            let likes = 0;

            if (existingLikeIndex !== -1) {
                // If the like exists, remove it (unlike)
                mockLikes.splice(existingLikeIndex, 1);
            } else {
                // If no like exists, create one (like)
                const newLike = {
                    _id: generateObjectId(),
                    user: userid,
                    post: postid,
                    type: 'post',
                    date: new Date()
                };
                mockLikes.push(newLike);
                isLiked = true;
            }

            // Count total likes for this post
            likes = mockLikes.filter(like => like.post === postid && like.type === 'post').length;

            res.status(200).send({
                message: isLiked ? "Post liked" : "Post unliked",
                success: true,
                isLiked,
                likes
            });
        } else {
            // Real database implementation
            const existingLike = await likemodel.findOne({ user: userid, post: postid });

            let isLiked = false;
            let likes = 0;

            if (existingLike) {
                // If the like exists, remove it (unlike)
                await likemodel.deleteOne({ _id: existingLike._id });
            } else {
                // If no like exists, create one (like)
                const newLike = new likemodel({ user: userid, post: postid, type: 'post' });
                await newLike.save();
                isLiked = true;
            }

            // Count total likes for this post
            likes = await likemodel.countDocuments({ post: postid });

            res.status(200).send({
                message: isLiked ? "Post liked" : "Post unliked",
                success: true,
                isLiked,
                likes
            });
        }
    } catch (error) {
        console.error("Error toggling like:", error);
        res.status(500).send({ message: "Something went wrong", success: false });
    }
};

export const toggleLikeComment = async (req, res) => {
    try {
        const { userid, commentid } = req.params;
        const like = await likemodel.findOne({ user: userid, comment: commentid });

        if (like) {
            // Unlike
            await likemodel.deleteOne({ _id: like._id });
            res.status(200).send({ message: "Comment unliked", success: true });
        } else {
            // Like
            const newLike = new likemodel({ user: userid, comment: commentid, type: 'comment' });
            await newLike.save();
            res.status(200).send({ message: "Comment liked", success: true });
        }
    } catch (error) {
        console.error("Error toggling comment like:", error);
        res.status(500).send({ message: "Something went wrong", success: false });
    }
};

export const getUserLikes = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Check if we're using mock database
        if (process.env.USE_MOCK_DB === 'true') {
            // Mock database implementation
            const likes = mockLikes.filter(like => 
                like.user === userId && 
                like.post && 
                (like.type === 'post' || !like.type)
            );
            
            // For simplicity, we'll return empty array since we don't have mock posts
            const likedPosts = [];
            
            res.status(200).send({
                success: true,
                likedPosts
            });
        } else {
            // Real database implementation
            // Find all post likes for this user
            const likes = await likemodel.find({
                user: userId,
                post: { $exists: true, $ne: null },
                $or: [
                    { type: 'post' },
                    { type: { $exists: false } }
                ]
            }).populate('post');
            
            // Extract just the posts from the likes
            const likedPosts = likes.map(like => like.post);
            
            res.status(200).send({
                success: true,
                likedPosts
            });
        }
    } catch (error) {
        console.error('Error getting user likes:', error);
        res.status(500).send({
            success: false,
            message: 'Something went wrong while retrieving user likes'
        });
    }
};
