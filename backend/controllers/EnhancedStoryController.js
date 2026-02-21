import Story from '../models/StoryModel.js';
import User from '../models/UserModel.js';
import Follow from '../models/FollowModel.js';
import NotificationService from './EnhancedNotificationController.js';
import mongoose from 'mongoose';

// Enhanced Story Features

// Create story with filters and effects
export const createEnhancedStory = async (req, res) => {
    const authenticatedId = req.user?.id;
    const { 
        mediaUrl, 
        mediaType, 
        caption, 
        filter = 'normal',
        duration = 15, // seconds
        textColor = '#FFFFFF',
        textPosition = 'bottom',
        stickers = [],
        location,
        mentions = []
    } = req.body;

    if (!mediaUrl || !authenticatedId) {
        return res.status(400).json({
            success: false,
            message: 'Media URL and authentication are required.'
        });
    }
    
    // Validate duration
    if (duration < 1 || duration > 60) {
        return res.status(400).json({
            success: false,
            message: 'Duration must be between 1 and 60 seconds.'
        });
    }

    try {
        // Check if user exists
        const userExists = await User.findById(authenticatedId);
        if (!userExists) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found.' 
            });
        }

        // Validate mentions
        const validMentions = [];
        if (mentions && mentions.length > 0) {
            for (const mention of mentions) {
                const mentionedUser = await User.findById(mention.userId);
                if (mentionedUser) {
                    validMentions.push({
                        userId: mention.userId,
                        username: mentionedUser.username,
                        position: mention.position || { x: 50, y: 50 }
                    });
                }
            }
        }

        const newStory = new Story({
            user: authenticatedId,
            mediaUrl,
            mediaType: mediaType || (mediaUrl.toLowerCase().includes('video') ? 'video' : 'image'),
            caption: caption || '',
            views: [authenticatedId], // Add creator as viewer
            filter,
            duration,
            textColor,
            textPosition,
            stickers,
            location,
            mentions: validMentions,
            createdAt: new Date()
        });

        await newStory.save();

        // Notify mentioned users
        for (const mention of validMentions) {
            if (mention.userId.toString() !== authenticatedId.toString()) {
                await NotificationService.createNotification({
                    userId: mention.userId,
                    type: 'mention',
                    fromUser: authenticatedId,
                    story: newStory._id,
                    message: `${userExists.username || userExists.name} mentioned you in a story`
                }, req.io);
            }
        }

        res.status(201).json({
            success: true,
            message: 'Story created successfully.',
            story: {
                id: newStory._id,
                mediaUrl: newStory.mediaUrl,
                mediaType: newStory.mediaType,
                caption: newStory.caption,
                filter: newStory.filter,
                duration: newStory.duration,
                textColor: newStory.textColor,
                textPosition: newStory.textPosition,
                stickers: newStory.stickers,
                location: newStory.location,
                mentions: newStory.mentions,
                timestamp: newStory.createdAt,
                viewed: true
            }
        });
    } catch (error) {
        console.error('SERVER ERROR creating enhanced story:', error);
        
        if (error.name === 'ValidationError' || error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: `Validation failed: ${error.message}`,
                details: error.message
            });
        }
        res.status(500).json({ 
            success: false,
            message: 'Internal Server Error during story creation.' 
        });
    }
};

// Get story feed with enhanced features
export const getEnhancedStoryFeed = async (req, res) => {
    const currentUserId = req.user._id || req.user.id;
    const { includeViewed = false, filter = 'all' } = req.query;

    try {
        // Fetch following list
        const followRelations = await Follow.find({ follower: currentUserId }).select('following').lean();
        const followingIds = followRelations.map(fr => fr.following);
        
        const followingObjectIds = followingIds.map(id => {
            try {
                return new mongoose.Types.ObjectId(id);
            } catch (error) {
                return null;
            }
        }).filter(id => id !== null);

        const currentUserObjectId = new mongoose.Types.ObjectId(currentUserId);
        const userIdsToFetch = [currentUserObjectId, ...followingObjectIds];

        // Fetch stories from the last 24 hours
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        
        let storiesQuery = {
            user: { $in: userIdsToFetch },
            createdAt: { $gte: twentyFourHoursAgo }
        };

        // Filter by viewed status if specified
        if (includeViewed === 'false') {
            storiesQuery.views = { $ne: currentUserId };
        }

        const stories = await Story.find(storiesQuery)
            .sort({ createdAt: 1 })
            .populate({
                path: 'user',
                select: 'username name profileImageUrl avatar _id'
            })
            .populate({
                path: 'views',
                select: 'username profileImageUrl _id'
            })
            .populate({
                path: 'mentions.userId',
                select: 'username name profileImageUrl'
            })
            .lean();

        // If no stories found, return empty array
        if (stories.length === 0) {
            return res.status(200).json({
                success: true,
                stories: [],
                totalUsers: 0
            });
        }

        // Aggregate and format stories
        const aggregatedFeed = aggregateStoriesByUser(stories, currentUserId);

        res.status(200).json({
            success: true,
            stories: aggregatedFeed,
            totalUsers: aggregatedFeed.length
        });

    } catch (error) {
        console.error('SERVER ERROR fetching enhanced story feed:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal Server Error fetching story feed.',
            error: error.message 
        });
    }
};

// Add story reaction (like/reply)
export const addStoryReaction = async (req, res) => {
    const { storyId } = req.params;
    const { reactionType = 'like', message } = req.body;
    const userId = req.user._id || req.user.id;

    try {
        const story = await Story.findById(storyId).populate('user', 'username name');
        if (!story) {
            return res.status(404).json({ 
                success: false,
                message: 'Story not found.' 
            });
        }

        // Add reaction based on type
        if (reactionType === 'like') {
            // Add to likes if not already there
            if (!story.likes.includes(userId)) {
                story.likes.push(userId);
                await story.save();
                
                // Send notification to story creator
                if (story.user._id.toString() !== userId.toString()) {
                    await NotificationService.createNotification({
                        userId: story.user._id,
                        type: 'like',
                        fromUser: userId,
                        story: storyId,
                        message: `${req.user.username || req.user.name} liked your story`
                    }, req.io);
                }
            }
        } else if (reactionType === 'reply' && message) {
            // Create reply functionality (would need a Reply model)
            // For now, we'll send a notification
            if (story.user._id.toString() !== userId.toString()) {
                await NotificationService.createNotification({
                    userId: story.user._id,
                    type: 'story_reply',
                    fromUser: userId,
                    story: storyId,
                    message: `${req.user.username || req.user.name} replied to your story: ${message}`
                }, req.io);
            }
        }

        res.status(200).json({
            success: true,
            message: `Story ${reactionType} added successfully.`
        });
    } catch (error) {
        console.error('SERVER ERROR adding story reaction:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal Server Error.' 
        });
    }
};

// Get story analytics for creator
export const getStoryAnalytics = async (req, res) => {
    const { storyId } = req.params;
    const currentUserId = req.user._id || req.user.id;

    try {
        const story = await Story.findById(storyId)
            .populate('views', 'username profileImageUrl createdAt')
            .populate('likes', 'username profileImageUrl createdAt');

        if (!story) {
            return res.status(404).json({ 
                success: false,
                message: 'Story not found.' 
            });
        }

        // Security check: Only the story creator can view analytics
        if (story.user.toString() !== currentUserId.toString()) {
            return res.status(403).json({ 
                success: false,
                message: 'Access denied.' 
            });
        }

        // Calculate analytics
        const viewCount = story.views.length;
        const likeCount = story.likes.length;
        const uniqueViewers = [...new Set(story.views.map(view => view._id.toString()))];
        const uniqueLikers = [...new Set(story.likes.map(like => like._id.toString()))];
        
        // Get top locations if any
        const locationViews = story.views.reduce((acc, view) => {
            if (view.location) {
                acc[view.location] = (acc[view.location] || 0) + 1;
            }
            return acc;
        }, {});

        // Calculate engagement rate
        const engagementRate = viewCount > 0 ? (likeCount / viewCount) * 100 : 0;

        res.status(200).json({
            success: true,
            analytics: {
                viewCount,
                likeCount,
                uniqueViewers: uniqueViewers.length,
                uniqueLikers: uniqueLikers.length,
                engagementRate: engagementRate.toFixed(2),
                topLocations: Object.entries(locationViews)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([location, count]) => ({ location, count })),
                createdAt: story.createdAt,
                expiresAt: new Date(story.createdAt.getTime() + 24 * 60 * 60 * 1000)
            }
        });
    } catch (error) {
        console.error('Error fetching story analytics:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal Server Error' 
        });
    }
};

// Get user's story archive (saved stories)
export const getStoryArchive = async (req, res) => {
    const { userId } = req.params;
    const currentUserId = req.user._id || req.user.id;

    try {
        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found.' 
            });
        }

        // Security check: Users can only view their own archive
        if (userId !== currentUserId.toString()) {
            return res.status(403).json({ 
                success: false,
                message: 'Access denied.' 
            });
        }

        // Get expired stories (older than 24 hours)
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        
        const archivedStories = await Story.find({
            user: userId,
            createdAt: { $lt: twentyFourHoursAgo }
        }).sort({ createdAt: -1 })
        .populate({
            path: 'user',
            select: 'username name profileImageUrl avatar'
        })
        .populate({
            path: 'views',
            select: 'username'
        });

        res.status(200).json({
            success: true,
            stories: archivedStories.map(story => ({
                id: story._id,
                mediaUrl: story.mediaUrl,
                mediaType: story.mediaType,
                caption: story.caption,
                filter: story.filter,
                viewCount: story.views.length,
                likeCount: story.likes.length,
                archivedAt: story.createdAt,
                expiresAt: new Date(story.createdAt.getTime() + 24 * 60 * 60 * 1000)
            }))
        });
    } catch (error) {
        console.error('Error fetching story archive:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal Server Error' 
        });
    }
};

// Create story highlight collection
export const createHighlightCollection = async (req, res) => {
    const { name, coverImage, color = '#0095F6' } = req.body;
    const userId = req.user._id || req.user.id;

    try {
        // Validate required fields
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Highlight name is required.'
            });
        }

        // Check if user already has a highlight with this name
        const existingHighlights = await Story.find({
            user: userId,
            'highlight.name': name
        });

        if (existingHighlights.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Highlight with this name already exists.'
            });
        }

        res.status(201).json({
            success: true,
            message: 'Highlight collection created successfully',
            highlight: {
                name,
                coverImage: coverImage || existingHighlights[0]?.mediaUrl || '',
                color,
                storyCount: 0
            }
        });
    } catch (error) {
        console.error('Error creating highlight collection:', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};

// Search stories by hashtags or mentions
export const searchStories = async (req, res) => {
    const { query, type = 'hashtag' } = req.query;
    const currentUserId = req.user._id || req.user.id;

    try {
        if (!query) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required.'
            });
        }

        // Get user's following list
        const followRelations = await Follow.find({ follower: currentUserId }).select('following').lean();
        const followingIds = [...followRelations.map(fr => fr.following), currentUserId];

        const followingObjectIds = followingIds.map(id => {
            try {
                return new mongoose.Types.ObjectId(id);
            } catch (error) {
                return null;
            }
        }).filter(id => id !== null);

        // Build search query
        const searchQuery = {
            user: { $in: followingObjectIds },
            createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        };

        if (type === 'hashtag') {
            searchQuery.caption = { $regex: `#${query}`, $options: 'i' };
        } else if (type === 'mention') {
            searchQuery['mentions.userId'] = new mongoose.Types.ObjectId(query);
        }

        const stories = await Story.find(searchQuery)
            .sort({ createdAt: -1 })
            .populate({
                path: 'user',
                select: 'username name profileImageUrl avatar'
            })
            .populate({
                path: 'mentions.userId',
                select: 'username name'
            })
            .limit(50)
            .lean();

        res.status(200).json({
            success: true,
            stories: stories.map(story => ({
                id: story._id,
                mediaUrl: story.mediaUrl,
                mediaType: story.mediaType,
                caption: story.caption,
                user: story.user,
                mentions: story.mentions,
                createdAt: story.createdAt
            })),
            count: stories.length
        });
    } catch (error) {
        console.error('Error searching stories:', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};