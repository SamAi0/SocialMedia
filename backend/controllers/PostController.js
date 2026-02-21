import postmodel from "../models/PostModel.js"
import usermodel from "../models/UserModel.js"
import followermodel from "../models/FollowModel.js"
import savedpostmodel from "../models/SavedPostModel.js"
import likemodel from "../models/LikeModel.js"
import HashtagModel from "../models/HashtagModel.js"
import BlockModel from "../models/BlockModel.js"

// Mock database for development
const mockPosts = [];

import { generateObjectId } from '../utils/ObjectIdGenerator.js';
export const createPost = async (req, res) => {
    try {
        const { userid } = req.params
        const { text, image, video, postType } = req.body

        // Check if we're using mock database
        if (process.env.USE_MOCK_DB === 'true') {
            // Mock database implementation
            const post = {
                _id: generateObjectId(),
                user: userid,
                text: text,
                image: image,
                video: video,
                postType: postType || (video ? 'reel' : 'post'),
                date: new Date(),
                likes: []
            };

            mockPosts.push(post);

            res.status(200).send({ message: "Post uploaded Successfully", success: true })
        } else {
            // Real database implementation
            const post = new postmodel({
                user: userid,
                text: text,
                image: image,
                video: video,
                postType: postType || (video ? 'reel' : 'post') // Default based on content if not specified
            })
            await post.save()

            // Extract and save hashtags
            if (text) {
                const hashtags = text.match(/#[a-z0-9_]+/gi);
                if (hashtags) {
                    const uniqueTags = [...new Set(hashtags.map(tag => tag.toLowerCase()))];
                    for (const tag of uniqueTags) {
                        await HashtagModel.findOneAndUpdate(
                            { tag: tag },
                            {
                                $push: { posts: post._id },
                                $inc: { count: 1 },
                                $set: { lastUsed: new Date() }
                            },
                            { upsert: true, new: true }
                        );
                    }
                }
            }

            if (post) {
                res.status(200).send({ message: "Post uploaded Successfully", success: true })
            }
            else {
                res.status(200).send({ message: "Post Unsuccessful", success: false })
            }
        }
    }
    catch (error) {
        res.status(200).send({ message: "Failed to update post", success: false })
    }
}

export const getAllPost = async (req, res) => {
    try {
        const posts = await postmodel.find().sort({ date: -1 }).populate("user", "name avatar")
        if (posts) {
            res.status(200).send({ posts: posts, success: true })
        }
        else {
            res.status(200).send({ message: "Could not Fetch Posts", success: false })
        }
    }
    catch (error) {
        res.status(500).send({ message: "Failed to create post", success: false })
    }
}

export const getUserPost = async (req, res) => {
    try {
        const { userid } = req.params;
        const data = await postmodel.find({ user: userid })
        if (data) {
            res.status(200).send({ data, success: true })
        }
        else {
            res.status(200).send({ message: "Could Not Fetch Data", success: false })
        }
    }
    catch (error) {
        res.status(500).send({ message: "Something Went Wrong", success: false })
    }
}

export const getOnePost = async (req, res) => {
    try {
        const { postid } = req.params;
        const data = await postmodel.find({ _id: postid })
        if (data) {
            res.status(200).send({ data, success: true })
        }
        else res.status(401).send({ message: "Could Not Perform The Following Action", success: false })
    }
    catch (error) {
        res.status(500).send({ message: "Something Went Wrong" })
    }
}

export const updatePost = async (req, res) => {
    try {
        const { postid } = req.params;
        const { text, video, image } = req.body
        const updateFields = {};

        if (text !== undefined) updateFields.text = text;
        if (video !== undefined) updateFields.video = video;
        if (image !== undefined) updateFields.image = image;

        const updatedetails = await postmodel.findByIdAndUpdate(
            postid,
            { $set: updateFields },
            { new: true }
        );

        if (updatedetails) {
            res.status(200).send({
                message: "Post updated successfully",
                success: true,
                post: updatedetails
            })
        }
        else {
            res.status(404).send({ message: "Post not found", success: false })
        }
    }
    catch (error) {
        console.error("Error updating post:", error);
        res.status(500).send({ message: "Something went wrong", success: false })
    }
}

export const deletePost = async (req, res) => {
    try {
        const { postid } = req.params;

        // Check if post exists
        const post = await postmodel.findById(postid);
        if (!post) {
            return res.status(404).send({ message: "Post not found", success: false });
        }

        // Delete post
        await postmodel.findByIdAndDelete(postid);

        // Delete all saved instances of this post
        await savedpostmodel.deleteMany({ post: postid });

        // Return success
        res.status(200).send({
            message: "Post deleted successfully",
            success: true
        });
    } catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).send({ message: "Something went wrong", success: false });
    }
}

export const feed = async (req, res) => {

    try {
        const { userid } = req.params;

        // Check if we're using mock database
        if (process.env.USE_MOCK_DB === 'true') {
            // Mock database implementation
            // For mock database, we'll return some sample posts
            const samplePosts = [
                {
                    _id: generateObjectId(),
                    user: {
                        _id: generateObjectId(),
                        name: 'Sample User 1',
                        avatar: ''
                    },
                    text: 'This is a sample post for testing the feed',
                    image: '',
                    video: '',
                    postType: 'post',
                    date: new Date(),
                    likes: []
                },
                {
                    _id: generateObjectId(),
                    user: {
                        _id: generateObjectId(),
                        name: 'Sample User 2',
                        avatar: ''
                    },
                    text: 'Another sample post to test the feed functionality',
                    image: '',
                    video: '',
                    postType: 'post',
                    date: new Date(Date.now() - 3600000), // 1 hour ago
                    likes: []
                }
            ];

            return res.status(200).send({
                message: "Feed fetched successfully",
                success: true,
                posts: samplePosts
            });
        } else {
            // Real database implementation
            const following = await followermodel
                .find({ follower: userid })
                .populate('following', '_id name avatar');

            if (!following || following.length === 0) {
                return res.status(200).send({ message: "No posts available", success: true, posts: [] });
            }
            const followingIds = following.map(f => f.following?._id);
            const posts = await postmodel
                .find({ user: { $in: followingIds } })
                .populate('user', 'name avatar')
                .sort({ date: -1 });

            res.status(200).send({ message: "Feed fetched successfully", success: true, posts });
        }
    } catch (error) {
        console.error("Error in getFeed:", error);
        res.status(500).send({ message: "Failed to fetch feed", success: false, error: error.message });
    }



};

export const savedPost = async (req, res) => {
    try {
        const { userid, postid } = req.params;
        const post = await postmodel.findById({ _id: postid });


        if (!post) {
            return res.status(200).send({ message: "Post Not Found", success: false });
        } else {
            // Check if the post is already saved by the user
            const existingSave = await savedpostmodel.findOne({ user: userid, post: postid });

            if (existingSave) {
                // Post is already saved, so unsave it
                const data = await savedpostmodel.deleteOne({ user: userid, post: postid });
                if (data.deletedCount > 0) {
                    return res.status(200).send({ message: "Post Unsaved", success: true, isSaved: false });
                } else {

                    return res.status(200).send({ message: "Could Not Perform The Action", success: false });
                }
            } else {
                // Post is not saved, so save it
                const savedPost = new savedpostmodel({ user: userid, post: postid });
                await savedPost.save();

                if (savedPost) {
                    return res.status(200).send({ message: "Post Saved Successfully", success: true, isSaved: true });
                } else {
                    return res.status(200).send({ message: "Post Not Saved", success: false });
                }
            }
        }
    } catch (error) {
        console.error("Error in savedPost function:", error); // Logs the full error message
        res.status(500).send({ message: "Failed to get posts", success: false, error: error.message });
    }
};



export const getSavedPost = async (req, res) => {
    try {
        const { userid } = req.params;
        const data = await savedpostmodel.find({ user: userid }).populate('post');
        if (data) {
            res.status(200).send({ data, success: true })
        }
        else {
            res.status(200).send({ message: "Could Not Fetch Data", success: false })
        }
    }
    catch (error) {
        res.status(500).send({ message: "Something Went Wrong", success: false })
    }
}

export const deleteSavedPost = async (req, res) => {
    try {
        const { userid, postid } = req.params;
        const savedPost = await savedpostmodel.findOne({ user: userid, post: postid });

        if (!savedPost) {
            return res.status(404).send({
                message: "Saved post not found",
                success: false
            });
        }

        await savedpostmodel.deleteOne({ _id: savedPost._id });

        res.status(200).send({
            message: "Saved post deleted successfully",
            success: true
        });
    }
    catch (error) {
        console.error("Error deleting saved post:", error);
        res.status(500).send({ message: "Something went wrong", success: false });
    }
}

export const getLikeCounts = async (req, res) => {
    try {
        const likeCounts = await likemodel.aggregate([
            {
                $match: {
                    post: { $exists: true, $ne: null },
                    $or: [
                        { type: 'post' },
                        { type: { $exists: false } }
                    ]
                }
            },
            {
                $group: {
                    _id: "$post",
                    count: { $sum: 1 }
                }
            }
        ]);

        // Convert array to object for easier frontend consumption
        const likeCountsMap = {};
        likeCounts.forEach(item => {
            likeCountsMap[item._id] = item.count;
        });

        res.status(200).send({
            success: true,
            likeCounts: likeCountsMap
        });
    } catch (error) {
        console.error('Error getting like counts:', error);
        res.status(500).send({
            success: false,
            message: 'Something went wrong while retrieving like counts'
        });
    }
};
export const getAllPosts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const category = req.query.category;
        const skip = (page - 1) * limit;

        // Build query based on category
        let query = {};
        if (category && category !== 'all') {
            // You might want to add tags or categories to your post model
            // For now, we'll filter by postType or other fields
            if (['reel', 'post'].includes(category)) {
                query.postType = category;
            }
        }

        const posts = await postmodel.find(query)
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit)
            .populate("user", "name avatar username bio");

        const total = await postmodel.countDocuments(query);

        if (posts) {
            res.status(200).send({
                posts: posts,
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalPosts: total,
                success: true
            })
        }
        else {
            res.status(200).send({ message: "Could not Fetch Posts", success: false })
        }
    }
    catch (error) {
        console.error("Error in getAllPosts:", error);
        res.status(500).send({ message: "Something Went Wrong", success: false })
    }
}

// NEW: Smart "For You" Feed
export const getExploreFeed = async (req, res) => {
    try {
        const { userid } = req.params;

        // Get users currently followed
        const following = await followermodel.find({ follower: userid }).distinct('following');

        // Get blocked users (either blocked by me or blocking me)
        const blocks = await BlockModel.find({
            $or: [{ blocker: userid }, { blocked: userid }]
        });

        const blockedUserIds = blocks.map(b =>
            b.blocker.toString() === userid ? b.blocked : b.blocker
        );

        // Exclude self, following, and blocked users
        const excludedIds = [userid, ...following, ...blockedUserIds];

        // Fetch popular posts from other users
        // Scoring: We'll just sort by random sample or recent high engagement for now
        // For better performance, we'll fetch recent posts and sort by likes
        const posts = await postmodel.aggregate([
            { $match: { user: { $nin: excludedIds } } },
            { $sort: { date: -1 } },
            { $limit: 100 }, // Look at last 100 posts
            { $addFields: { likeCount: { $size: "$likes" } } },
            { $sort: { likeCount: -1 } }, // Sort by most likes
            { $limit: 20 },
            { $lookup: { from: "users", localField: "user", foreignField: "_id", as: "user" } },
            { $unwind: "$user" },
            { $project: { "user.password": 0, "user.email": 0 } }
        ]);

        res.status(200).send({
            success: true,
            posts: posts
        });
    } catch (error) {
        console.error("Explore feed error:", error);
        res.status(500).send({ success: false, message: "Failed to fetch explore feed" });
    }
};