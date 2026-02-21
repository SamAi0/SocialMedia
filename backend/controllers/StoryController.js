import Story from '../models/StoryModel.js';
import User from '../models/UserModel.js';
import Follow from '../models/FollowModel.js'; // Add this import
import mongoose from 'mongoose';

// --- Helper function to aggregate stories by user ---
const aggregateStoriesByUser = (stories, currentUserId) => {
    const groupedStories = new Map();

    stories.forEach(story => {
        if (!story.user || !story.user._id) return;
        
        const userId = story.user._id.toString();
        const username = story.user.username || story.user.name || 'User';
        const profileImageUrl = story.user.profileImageUrl || story.user.avatar || null;
        
        if (!groupedStories.has(userId)) {
            groupedStories.set(userId, {
                userId: userId,
                username: username,
                profileImageUrl: profileImageUrl,
                stories: [],
            });
        }
        
        // Check if current user has viewed this story
        const isViewed = story.views && story.views.some(view => {
            if (!view) return false;
            const viewId = view._id ? view._id.toString() : view.toString();
            return viewId === currentUserId.toString();
        });

        groupedStories.get(userId).stories.push({
            id: story._id.toString(),
            mediaUrl: story.mediaUrl,
            mediaType: story.mediaType,
            caption: story.caption || '',
            timestamp: story.createdAt,
            viewed: isViewed || false,
        });
    });
    
    const feed = Array.from(groupedStories.values());
    
    // Sort: current user first, then users with unviewed stories, then others
    feed.sort((a, b) => {
        const aIsCurrentUser = a.userId === currentUserId.toString();
        const bIsCurrentUser = b.userId === currentUserId.toString();
        
        if (aIsCurrentUser && !bIsCurrentUser) return -1;
        if (!aIsCurrentUser && bIsCurrentUser) return 1;
        
        const aHasUnviewed = a.stories.some(s => !s.viewed);
        const bHasUnviewed = b.stories.some(s => !s.viewed);
        
        if (aHasUnviewed && !bHasUnviewed) return -1;
        if (!aHasUnviewed && bHasUnviewed) return 1;
        
        // Secondary sort to ensure newest stories from followers are higher
        if (a.stories.length > 0 && b.stories.length > 0) {
            const aNewest = Math.max(...a.stories.map(s => new Date(s.timestamp).getTime()));
            const bNewest = Math.max(...b.stories.map(s => new Date(s.timestamp).getTime()));
            return bNewest - aNewest;
        }
        
        return 0;
    });

    return feed;
};

// --- Controller Methods ---

/**
 * @desc Create a new story
 * @route POST /user/story/create
 * @access Private
 */
export const createStory = async (req, res) => {
    const authenticatedId = req.user?.id;
    let { mediaUrl, mediaType, caption } = req.body;

    if (!mediaUrl || !authenticatedId) {
        return res.status(400).json({
            message: 'Media URL and authentication are required.'
        });
    }
    
    // Auto-detect media type if not provided
    if (!mediaType || !['image', 'video'].includes(mediaType)) {
        const urlLower = mediaUrl.toLowerCase();
        if (urlLower.endsWith('.mp4') || urlLower.endsWith('.mov') || urlLower.endsWith('.webm') || urlLower.includes('video')) {
            mediaType = 'video';
        } else {
            mediaType = 'image';
        }
    }

    try {
        // Check if user exists
        const userExists = await User.findById(authenticatedId);
        if (!userExists) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const newStory = new Story({
            user: authenticatedId,
            mediaUrl,
            mediaType: mediaType,
            caption: caption || '',
            views: [authenticatedId] // Add creator as viewer
        });

        await newStory.save();

        res.status(201).json({
            message: 'Story created successfully.',
            story: {
                id: newStory._id,
                mediaUrl: newStory.mediaUrl,
                mediaType: newStory.mediaType,
                caption: newStory.caption,
                timestamp: newStory.createdAt,
                viewed: true, // Creator automatically views their own story
            }
        });
    } catch (error) {
        console.error('SERVER ERROR creating story:', error);
        
        if (error.name === 'ValidationError' || error.name === 'CastError') {
             return res.status(400).json({
                 message: `Validation failed: ${error.message}`,
                 details: error.message
             });
        }
        res.status(500).json({ message: 'Internal Server Error during story creation.' });
    }
};

/**
 * @desc Get the story feed for the authenticated user
 * @route GET /user/story/feed
 * @access Private
 */
export const getStoryFeed = async (req, res) => {
    const currentUserId = req.user._id || req.user.id;

    try {
        // Fetch following list from Follow model (not User model)
        const followRelations = await Follow.find({ follower: currentUserId }).select('following').lean();
        const followingIds = followRelations.map(fr => fr.following);
        
        console.log('Current user following IDs (from Follow model):', followingIds);
        console.log('Number of follow relations:', followRelations.length);
        
        // Convert to ObjectId
        const followingObjectIds = followingIds.map(id => {
            try {
                return new mongoose.Types.ObjectId(id);
            } catch (error) {
                console.warn(`Invalid ObjectId in following list: ${id}`);
                return null;
            }
        }).filter(id => id !== null);

        const currentUserObjectId = new mongoose.Types.ObjectId(currentUserId);
        
        // Include the current user's ID to fetch their own stories
        const userIdsToFetch = [currentUserObjectId, ...followingObjectIds];

        console.log('Fetching stories for user IDs:', userIdsToFetch.map(id => id.toString()));

        // Fetch stories from the last 24 hours only
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        
        const stories = await Story.find({
            user: { $in: userIdsToFetch },
            createdAt: { $gte: twentyFourHoursAgo }
        })
        .sort({ createdAt: 1 })
        .populate({
            path: 'user',
            select: 'username name profileImageUrl avatar _id'
        })
        .populate({
            path: 'views',
            select: 'username profileImageUrl _id'
        })
        .lean();

        console.log(`Found ${stories.length} stories in the last 24 hours`);

        // Log story distribution for debugging
        const storyCountByUser = {};
        stories.forEach(story => {
            const userId = story.user?._id?.toString();
            if (userId) {
                storyCountByUser[userId] = (storyCountByUser[userId] || 0) + 1;
            }
        });
        console.log('Story distribution by user:', storyCountByUser);

        // If no stories found, return empty array
        if (stories.length === 0) {
            return res.status(200).json([]);
        }

        // Aggregate and sort the stories using the helper function
        const aggregatedFeed = aggregateStoriesByUser(stories, currentUserId);

        console.log(`Aggregated feed has ${aggregatedFeed.length} users with stories`);

        res.status(200).json(aggregatedFeed);

    } catch (error) {
        console.error('SERVER ERROR fetching story feed:', error);
        res.status(500).json({ 
            message: 'Internal Server Error fetching story feed.',
            error: error.message 
        });
    }
};

/**
 * @desc Mark a story as viewed by the authenticated user
 * @route POST /user/story/:storyId/view
 * @access Private
 */
export const markStoryAsViewed = async (req, res) => {
    const { storyId } = req.params;
    const userId = req.user._id || req.user.id;

    try {
        // Check if story exists
        const story = await Story.findById(storyId);
        if (!story) {
            return res.status(404).json({ message: 'Story not found.' });
        }

        // Use $addToSet to ensure the userId is only added once
        const result = await Story.updateOne(
            { _id: storyId, views: { $ne: userId } },
            { $addToSet: { views: userId } }
        );

        if (result.matchedCount === 0 && result.modifiedCount === 0) {
             return res.status(200).json({ message: 'Story already viewed.' });
        }

        res.status(200).json({ message: 'Story marked as viewed.' });
    } catch (error) {
        console.error('SERVER ERROR marking story as viewed:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

/**
 * @desc Get views count for a specific story (for the creator)
 * @route GET /user/story/:storyId/views
 * @access Private (Owner Only)
 */
export const getStoryViews = async (req, res) => {
    const { storyId } = req.params;
    const currentUserId = req.user._id || req.user.id;

    try {
        // Populate views with necessary user info for the panel
        const story = await Story.findById(storyId).populate('views', 'username profileImageUrl');

        if (!story) {
            return res.status(404).json({ message: 'Story not found.' });
        }

        // Security check: Only the story creator can view the insights
        if (story.user.toString() !== currentUserId.toString()) {
            return res.status(403).json({ message: 'Access denied.' });
        }

        res.status(200).json({
            viewCount: story.views.length,
            viewers: story.views.map(user => ({
                id: user._id,
                username: user.username,
                profileImageUrl: user.profileImageUrl,
            }))
        });
    } catch (error) {
        console.error('Error fetching story views:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

/**
 * @desc Get user's story highlights
 * @route GET /user/stories/highlights/:userId
 * @access Private
 */
export const getHighlights = async (req, res) => {
    const { userId } = req.params;
    const currentUserId = req.user._id || req.user.id;

    try {
        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Get stories that have highlights
        const stories = await Story.find({
            user: userId,
            'highlight.name': { $exists: true, $ne: null }
        }).sort({ 'highlight.position': 1, createdAt: -1 });

        // Group stories by highlight name
        const highlights = {};
        stories.forEach(story => {
            if (story.highlight && story.highlight.name) {
                const highlightName = story.highlight.name;
                if (!highlights[highlightName]) {
                    highlights[highlightName] = [];
                }
                highlights[highlightName].push({
                    id: story._id,
                    mediaUrl: story.mediaUrl,
                    mediaType: story.mediaType,
                    caption: story.caption,
                    timestamp: story.createdAt,
                    highlightPosition: story.highlight.position
                });
            }
        });

        res.status(200).json({
            success: true,
            highlights: highlights
        });

    } catch (error) {
        console.error('Error fetching highlights:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

/**
 * @desc Add story to highlight
 * @route POST /user/story/:storyId/add-to-highlight
 * @access Private (Owner Only)
 */
export const addToHighlight = async (req, res) => {
    const { storyId } = req.params;
    const { highlightName } = req.body;
    const currentUserId = req.user._id || req.user.id;

    try {
        // Check if story exists and belongs to user
        const story = await Story.findById(storyId);
        if (!story) {
            return res.status(404).json({ message: 'Story not found.' });
        }

        if (story.user.toString() !== currentUserId.toString()) {
            return res.status(403).json({ message: 'Access denied. You can only modify your own stories.' });
        }

        // Add highlight information to story
        await Story.findByIdAndUpdate(storyId, {
            $set: {
                'highlight.name': highlightName,
                'highlight.position': Date.now() // Use timestamp as position
            }
        });

        res.status(200).json({
            message: 'Story added to highlight successfully',
            success: true
        });

    } catch (error) {
        console.error('Error adding story to highlight:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

/**
 * @desc Remove story from highlight
 * @route DELETE /user/story/:storyId/remove-from-highlight
 * @access Private (Owner Only)
 */
export const removeFromHighlight = async (req, res) => {
    const { storyId } = req.params;
    const currentUserId = req.user._id || req.user.id;

    try {
        // Check if story exists and belongs to user
        const story = await Story.findById(storyId);
        if (!story) {
            return res.status(404).json({ message: 'Story not found.' });
        }

        if (story.user.toString() !== currentUserId.toString()) {
            return res.status(403).json({ message: 'Access denied. You can only modify your own stories.' });
        }

        // Remove highlight information from story
        await Story.findByIdAndUpdate(storyId, {
            $unset: {
                'highlight': 1
            }
        });

        res.status(200).json({
            message: 'Story removed from highlight successfully',
            success: true
        });

    } catch (error) {
        console.error('Error removing story from highlight:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

/**
 * @desc Delete a highlight collection
 * @route DELETE /user/highlight/:highlightName
 * @access Private (Owner Only)
 */
export const deleteHighlight = async (req, res) => {
    const { highlightName } = req.params;
    const currentUserId = req.user._id || req.user.id;

    try {
        // Remove highlight information from all stories with this highlight name
        const result = await Story.updateMany({
            user: currentUserId,
            'highlight.name': highlightName
        }, {
            $unset: {
                'highlight': 1
            }
        });

        res.status(200).json({
            message: 'Highlight collection deleted successfully',
            deletedCount: result.nModified,
            success: true
        });

    } catch (error) {
        console.error('Error deleting highlight:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};