import Reaction from '../models/ReactionModel.js';
import Post from '../models/PostModel.js';
import { generateObjectId } from '../utils/ObjectIdGenerator.js';

// Add reaction to post
export const addPostReaction = async (req, res) => {
  try {
    const { postId } = req.params;
    const { reactionType } = req.body;
    const userId = req.user._id;

    // Validate reaction type
    const validReactions = ['like', 'love', 'haha', 'wow', 'sad', 'angry'];
    if (!validReactions.includes(reactionType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reaction type'
      });
    }

    // Check if user already reacted to this post
    const existingReaction = await Reaction.findOne({ postId, userId });

    if (existingReaction) {
      // If same reaction, remove it (toggle off)
      if (existingReaction.reactionType === reactionType) {
        await Reaction.deleteOne({ _id: existingReaction._id });
        
        // Update post reaction counts
        await updatePostReactionCount(postId, reactionType, -1);
        
        return res.status(200).json({
          success: true,
          message: 'Reaction removed',
          reaction: null,
          action: 'removed'
        });
      } else {
        // Change to new reaction type
        const oldReactionType = existingReaction.reactionType;
        existingReaction.reactionType = reactionType;
        await existingReaction.save();
        
        // Update counts: decrease old, increase new
        await updatePostReactionCount(postId, oldReactionType, -1);
        await updatePostReactionCount(postId, reactionType, 1);
        
        return res.status(200).json({
          success: true,
          message: 'Reaction updated',
          reaction: existingReaction,
          action: 'updated'
        });
      }
    } else {
      // Add new reaction
      const reaction = new Reaction({
        postId,
        userId,
        reactionType,
        _id: generateObjectId()
      });

      await reaction.save();
      
      // Update post reaction counts
      await updatePostReactionCount(postId, reactionType, 1);
      
      res.status(201).json({
        success: true,
        message: 'Reaction added successfully',
        reaction,
        action: 'added'
      });
    }
  } catch (error) {
    console.error('Error adding reaction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add reaction'
    });
  }
};

// Get post reactions
export const getPostReactions = async (req, res) => {
  try {
    const { postId } = req.params;
    
    const reactions = await Reaction.find({ postId })
      .populate('userId', 'username avatar name')
      .sort({ createdAt: -1 });

    // Group reactions by type
    const reactionCounts = {};
    const userReactions = {};
    
    reactions.forEach(reaction => {
      const type = reaction.reactionType;
      reactionCounts[type] = (reactionCounts[type] || 0) + 1;
      
      if (req.user && reaction.userId._id.toString() === req.user._id.toString()) {
        userReactions[postId] = type;
      }
    });

    res.status(200).json({
      success: true,
      reactions,
      reactionCounts,
      userReactions
    });
  } catch (error) {
    console.error('Error getting post reactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get post reactions'
    });
  }
};

// Get user's reactions
export const getUserReactions = async (req, res) => {
  try {
    const userId = req.user._id;
    const { postId } = req.params;
    
    let query = { userId };
    if (postId) {
      query.postId = postId;
    }
    
    const reactions = await Reaction.find(query)
      .populate('postId', 'text image video')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      reactions
    });
  } catch (error) {
    console.error('Error getting user reactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user reactions'
    });
  }
};

// Remove reaction
export const removePostReaction = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const reaction = await Reaction.findOneAndDelete({ postId, userId });
    
    if (reaction) {
      // Update post reaction counts
      await updatePostReactionCount(postId, reaction.reactionType, -1);
      
      res.status(200).json({
        success: true,
        message: 'Reaction removed successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Reaction not found'
      });
    }
  } catch (error) {
    console.error('Error removing reaction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove reaction'
    });
  }
};

// Helper function to update post reaction counts
async function updatePostReactionCount(postId, reactionType, increment) {
  try {
    const updateQuery = {};
    updateQuery[`reactionCounts.${reactionType}`] = increment;
    
    await Post.findByIdAndUpdate(
      postId,
      { $inc: updateQuery },
      { new: true }
    );
  } catch (error) {
    console.error('Error updating post reaction count:', error);
  }
}

// Get reaction statistics for a post
export const getReactionStats = async (req, res) => {
  try {
    const { postId } = req.params;
    
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    res.status(200).json({
      success: true,
      reactionCounts: post.reactionCounts || {
        like: 0,
        love: 0,
        haha: 0,
        wow: 0,
        sad: 0,
        angry: 0
      }
    });
  } catch (error) {
    console.error('Error getting reaction stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get reaction stats'
    });
  }
};