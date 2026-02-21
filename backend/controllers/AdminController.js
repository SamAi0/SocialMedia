import User from '../models/UserModel.js';
import Post from '../models/PostModel.js';
import Comment from '../models/CommentModel.js';
import { logAuditEvent, logUserAction, logPostAction, logCommentAction } from '../utils/AuditLogger.js';

// Verify admin access
export const verifyAdmin = async (req, res) => {
  try {
    const userId = req.userId; // From auth middleware
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      isAdmin: user.isAdmin,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Error verifying admin:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during admin verification'
    });
  }
};

// Get admin dashboard statistics
export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const totalPosts = await Post.countDocuments({});
    const totalComments = await Comment.countDocuments({});
    
    // Count users active today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const activeToday = await User.countDocuments({
      date: { $gte: today }
    });
    
    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalPosts,
        totalComments,
        activeToday
      }
    });
  } catch (error) {
    console.error('Error getting admin stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting admin stats'
    });
  }
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password') // Don't return passwords
      .sort({ date: -1 }); // Sort by newest first
    
    res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting users'
    });
  }
};

// Toggle user admin status
export const toggleUserAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isAdmin } = req.body;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update admin status
    user.isAdmin = isAdmin;
    await user.save();
    
    // Log the action
    await logUserAction.adminToggled(req.userId, userId, isAdmin, req);
    
    res.status(200).json({
      success: true,
      message: `User admin status updated to ${isAdmin ? 'admin' : 'user'}`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Error toggling user admin status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating user admin status'
    });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Delete user and all their content
    await User.findByIdAndDelete(userId);
    
    // Also delete user's posts and comments
    await Post.deleteMany({ userId });
    await Comment.deleteMany({ userId });
    
    // Log the action
    await logUserAction.deleted(req.userId, userId, req);
    
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting user'
    });
  }
};

// Get all posts
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find({})
      .populate('user', 'name avatar username')
      .sort({ date: -1 });
    
    res.status(200).json({
      success: true,
      posts
    });
  } catch (error) {
    console.error('Error getting posts:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting posts'
    });
  }
};

// Delete post
export const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    await Post.findByIdAndDelete(postId);
    
    // Log the action
    await logPostAction.deleted(req.userId, postId, req);
    
    res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting post'
    });
  }
};

// Get all comments
export const getAllComments = async (req, res) => {
  try {
    const comments = await Comment.find({})
      .populate('user', 'name avatar username')
      .populate('postId', 'text image video')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      comments
    });
  } catch (error) {
    console.error('Error getting comments:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting comments'
    });
  }
};

// Delete comment
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    
    const comment = await Comment.findById(commentId);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }
    
    await Comment.findByIdAndDelete(commentId);
    
    // Log the action
    await logCommentAction.deleted(req.userId, commentId, req);
    
    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting comment'
    });
  }
};

// Get reports (this would be implemented if you have a Report model)
export const getReports = async (req, res) => {
  try {
    // Placeholder implementation - you'd need a Report model for this
    // For now, return an empty array or sample data
    res.status(200).json({
      success: true,
      reports: [] // In a real implementation, this would come from a Report model
    });
  } catch (error) {
    console.error('Error getting reports:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting reports'
    });
  }
};

// Approve report (placeholder implementation)
export const approveReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    
    // Placeholder implementation
    // In a real implementation, this would update a Report model
    
    res.status(200).json({
      success: true,
      message: 'Report approved successfully'
    });
  } catch (error) {
    console.error('Error approving report:', error);
    res.status(500).json({
      success: false,
      message: 'Server error approving report'
    });
  }
};