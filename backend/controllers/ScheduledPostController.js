import ScheduledPost from '../models/ScheduledPostModel.js';
import SchedulerService from '../services/SchedulerService.js';
import { generateObjectId } from '../utils/ObjectIdGenerator.js';

// Schedule a new post
export const schedulePost = async (req, res) => {
  try {
    const userId = req.user._id;
    const postData = req.body;

    const scheduledPost = await SchedulerService.schedulePost({
      ...postData,
      userId,
      _id: generateObjectId()
    });

    res.status(201).json({
      success: true,
      message: 'Post scheduled successfully',
      scheduledPost
    });
  } catch (error) {
    console.error('Error scheduling post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to schedule post'
    });
  }
};

// Get user's scheduled posts
export const getUserScheduledPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const scheduledPosts = await ScheduledPost.find({ userId })
      .sort({ scheduledTime: 1 });

    res.status(200).json({
      success: true,
      scheduledPosts
    });
  } catch (error) {
    console.error('Error getting scheduled posts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get scheduled posts'
    });
  }
};

// Cancel scheduled post
export const cancelScheduledPost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const scheduledPost = await ScheduledPost.findOne({ _id: id, userId });
    
    if (!scheduledPost) {
      return res.status(404).json({
        success: false,
        message: 'Scheduled post not found'
      });
    }

    if (scheduledPost.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel post that is not scheduled'
      });
    }

    const updatedPost = await SchedulerService.cancelScheduledPost(id);

    res.status(200).json({
      success: true,
      message: 'Scheduled post cancelled successfully',
      scheduledPost: updatedPost
    });
  } catch (error) {
    console.error('Error cancelling scheduled post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel scheduled post'
    });
  }
};

// Update scheduled post
export const updateScheduledPost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const updateData = req.body;

    const scheduledPost = await ScheduledPost.findOne({ _id: id, userId });
    
    if (!scheduledPost) {
      return res.status(404).json({
        success: false,
        message: 'Scheduled post not found'
      });
    }

    if (scheduledPost.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update post that is not scheduled'
      });
    }

    // Cancel the old schedule and create a new one
    await SchedulerService.cancelScheduledPost(id);
    
    const updatedPost = await ScheduledPost.findByIdAndUpdate(
      id,
      { ...updateData },
      { new: true, runValidators: true }
    );

    // Reschedule if time was updated
    if (updateData.scheduledTime) {
      await SchedulerService.schedulePost({
        ...updatedPost.toObject(),
        _id: updatedPost._id
      });
    }

    res.status(200).json({
      success: true,
      message: 'Scheduled post updated successfully',
      scheduledPost: updatedPost
    });
  } catch (error) {
    console.error('Error updating scheduled post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update scheduled post'
    });
  }
};