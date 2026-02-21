import express from "express";
import { verifyToken } from "../middleware/VerifyToken.js";
import { getUserProfile, loginUser, registerUser, updateProfile, getAllUsers, getUserProfileWithAnalytics, updateUserTheme, updatePrivacySettings, addLifeEvent, getUserAnalytics, updateAccountType } from "../controllers/UserController.js";
import { createPost, deletePost, deleteSavedPost, feed, getOnePost, getAllPost, getSavedPost, getUserPost, savedPost, updatePost, getLikeCounts, getAllPosts } from "../controllers/PostController.js";
import { addComment, deleteComment, getComment, updateComment } from "../controllers/CommentController.js";
import { toggleLikeComment, toggleLikePost, getUserLikes } from "../controllers/LikeController.js";
import { getFollow, getFollowing, toggleFollow, getAllFollowRelationships, checkFollowStatus } from "../controllers/FollowController.js";
import { getNotifications, getNewNotifications, markNotificationAsRead, markAllNotificationsAsRead, getUnreadCount, deleteNotification, clearAllNotifications, getNotificationStats, createNotification } from "../controllers/NotificationController.js";
import { DirectMessage, getMessage, sendMessage, getMessagedUsers, addReaction, removeReaction, markMessageAsRead, searchMessages, markMessageAsViewed, reportMessageAsSpam, getUserGroupMessages, createGroupChat } from "../controllers/MessageController.js";
import { searchPosts, searchUser } from "../controllers/SearchControllers.js";
// NEW IMPORTS for Story functionality
import { createStory, getStoryFeed, markStoryAsViewed, getStoryViews, getHighlights, addToHighlight, removeFromHighlight, deleteHighlight } from "../controllers/StoryController.js";
import { createGroup, addMember, getGroupMessages, getUserGroups } from "../controllers/GroupController.js";
import { getTrendingHashtags } from "../controllers/HashtagController.js";
import { blockUser, unblockUser, getBlockedUsers } from "../controllers/BlockController.js";
import { getExploreFeed } from "../controllers/PostController.js";

// NEW IMPORTS for Advanced Features
import { createStoryLayout, getUserStoryLayouts, getDynamicTemplates, saveTemplate, updateStoryLayout, deleteStoryLayout } from "../controllers/StoryLayoutController.js";
import { addPostReaction, getPostReactions, getUserReactions, removePostReaction, getReactionStats } from "../controllers/ReactionController.js";
import { schedulePost, getUserScheduledPosts, cancelScheduledPost, updateScheduledPost } from "../controllers/ScheduledPostController.js";


const route = express.Router()

//user action routes 
route.post("/user/register", registerUser);
route.post("/user/login", loginUser);
route.get("/user/profile/:id", verifyToken, getUserProfile);
route.patch("/user/update/:id", verifyToken, updateProfile);
route.get("/user/get/all", verifyToken, getAllUsers);

// NEW: Advanced profile routes
route.get("/user/profile/analytics/:id", verifyToken, getUserProfileWithAnalytics); // Get profile with analytics
route.patch("/user/theme/:id", verifyToken, updateUserTheme); // Update user theme
route.patch("/user/privacy/:id", verifyToken, updatePrivacySettings); // Update privacy settings
route.post("/user/life-event/:id", verifyToken, addLifeEvent); // Add life event
route.get("/user/analytics/:id", verifyToken, getUserAnalytics); // Get user analytics
route.patch("/user/account-type/:id", verifyToken, updateAccountType); // Update account type

//post action routes
route.post("/user/:userid/post/userpost/create", verifyToken, createPost);
route.get("/user/post/get", verifyToken, getAllPost);
route.get("/user/posts/get", verifyToken, getAllPosts);
route.get("/user/:userid/post/userpost/get", verifyToken, getUserPost);
route.get("/user/post/userpost/:postid/get", verifyToken, getOnePost);
route.patch("/user/post/userpost/:postid/update", verifyToken, updatePost);
route.delete("/user/post/userpost/:postid/delete", verifyToken, deletePost);
route.get("/user/post/:userid/feed", verifyToken, feed);
route.post("/user/post/:userid/:postid/save", verifyToken, savedPost);
route.get("/user/post/:userid/saved", verifyToken, getSavedPost);
route.delete("/user/post/:userid/:postid/unsave", verifyToken, deleteSavedPost);
route.get("/user/:userid/feed/explore", verifyToken, getExploreFeed); // NEW: Smart Feed

//comment action routes
route.post("/user/:userid/post/userpost/:postid/comment/add", verifyToken, addComment);
route.get("/user/post/userpost/:postid/comment/get", verifyToken, getComment);
route.patch("/user/post/userpost/comment/:commentid/update", verifyToken, updateComment);
route.delete("/user/post/userpost/comment/:commentid/delete", verifyToken, deleteComment);

//like action routes
route.post("/user/:userid/post/userpost/:postid/like", verifyToken, toggleLikePost);
route.post("/user/:userid/post/userpost/:postid/comment/:commentid/like", verifyToken, toggleLikeComment);
route.get("/user/:userId/likes", verifyToken, getUserLikes);

// --- Story Action Routes ---
route.post("/user/story/create", verifyToken, createStory); // Create a new story
route.get("/user/story/feed", verifyToken, getStoryFeed); // Get stories from following users + self
route.post("/user/story/:storyId/view", verifyToken, markStoryAsViewed); // Mark a story as viewed
route.get("/user/story/:storyId/views", verifyToken, getStoryViews); // Get viewer insights (creator only)

// NEW: Highlights routes
route.get("/user/stories/highlights/:userId", verifyToken, getHighlights); // Get user's story highlights
route.post("/user/story/:storyId/add-to-highlight", verifyToken, addToHighlight); // Add story to highlight
route.delete("/user/story/:storyId/remove-from-highlight", verifyToken, removeFromHighlight); // Remove story from highlight
route.delete("/user/highlight/:highlightName", verifyToken, deleteHighlight); // Delete a highlight collection

//follow action routes 
route.post("/user/:userid/:followid/follow", verifyToken, toggleFollow);
route.post("/user/:userid/:followid/unfollow", verifyToken, toggleFollow);
route.get("/user/:userid/followers", getFollow);
route.get("/user/:userid/following", getFollowing);
route.get("/follows/all", getAllFollowRelationships);
route.get("/follows/check/:userid/:followid", checkFollowStatus);

//notification action routes
route.get("/user/:userId/notifications", verifyToken, getNotifications);
route.get("/user/:userId/notifications/new", verifyToken, getNewNotifications);
route.get("/user/:userId/notifications/unread", verifyToken, getUnreadCount);
route.get("/user/:userId/notifications/stats", verifyToken, getNotificationStats);
route.patch("/user/:userId/notification/:notificationId/read", verifyToken, markNotificationAsRead);
route.post("/user/:userId/notification/mark-all-read", verifyToken, markAllNotificationsAsRead);
route.delete("/user/notification/:notificationId", verifyToken, deleteNotification);
route.delete("/user/:userId/notifications/clear", verifyToken, clearAllNotifications);
route.post("/user/notification/create", verifyToken, (req, res) => {
    // This endpoint is for testing notification creation
    createNotification(req.body, req.io).then(notification => {
        if (notification) {
            res.status(201).json({ success: true, notification });
        } else {
            res.status(500).json({ success: false, message: "Failed to create notification" });
        }
    });
});

//message action routes
route.post("/user/:userid/receiver/:receiverid/message/send", verifyToken, sendMessage)
route.get("/user/:userid/message/get", verifyToken, getMessage)
route.get("/user/:userid/:senderid/message/get", verifyToken, DirectMessage)
route.get("/user/:userid/messages/contacts", verifyToken, getMessagedUsers)

// NEW: Group Chat Routes
route.post("/group/create", verifyToken, createGroup);
route.post("/group/add-member", verifyToken, addMember);
route.get("/group/:groupId/messages", verifyToken, getGroupMessages);
route.get("/user/groups", verifyToken, getUserGroups);

// NEW: Blocking Routes
route.post("/user/block", verifyToken, blockUser);
route.post("/user/unblock", verifyToken, unblockUser);
route.get("/user/blocked", verifyToken, getBlockedUsers);

// NEW: Enhanced messaging routes
route.post("/user/message/:messageId/reaction", verifyToken, addReaction); // Add reaction to a message
route.delete("/user/message/:messageId/reaction/:userId", verifyToken, removeReaction); // Remove reaction from a message
route.post("/user/message/:messageId/read", verifyToken, markMessageAsRead); // Mark message as read
route.get("/user/message/search/:userid", verifyToken, searchMessages); // Search messages
route.post("/user/message/:messageId/view", verifyToken, markMessageAsViewed); // Mark message as viewed
route.post("/user/message/:messageId/report-spam", verifyToken, reportMessageAsSpam); // Report message as spam
route.get("/user/group/:groupId/messages", verifyToken, getUserGroupMessages); // Get group messages
route.post("/user/group/create", verifyToken, createGroupChat); // Create group chat


//search action routes
route.get("/user/search", verifyToken, searchUser);
route.get("/post/search/:keyword", verifyToken, searchPosts);
route.get("/hashtags/trending", verifyToken, getTrendingHashtags); // NEW: Trending Hashtags

// API endpoints for frontend
route.get("/api/getPosts", verifyToken, getAllPost);
route.get("/api/posts/likeCounts", verifyToken, getLikeCounts);
route.patch("/api/post/:postid", verifyToken, updatePost);
route.delete("/api/post/:postid", verifyToken, deletePost);

// NEW: Advanced Features API Routes

// Story Layout Routes
route.post("/api/story/layout", verifyToken, createStoryLayout);
route.get("/api/story/layouts", verifyToken, getUserStoryLayouts);
route.get("/api/story/templates", verifyToken, getDynamicTemplates);
route.post("/api/story/template/save", verifyToken, saveTemplate);
route.put("/api/story/layout/:id", verifyToken, updateStoryLayout);
route.delete("/api/story/layout/:id", verifyToken, deleteStoryLayout);

// Reaction Routes
route.post("/api/posts/:postId/reactions", verifyToken, addPostReaction);
route.get("/api/posts/:postId/reactions", verifyToken, getPostReactions);
route.get("/api/user/reactions/:postId?", verifyToken, getUserReactions);
route.delete("/api/posts/:postId/reactions", verifyToken, removePostReaction);
route.get("/api/posts/:postId/reaction-stats", verifyToken, getReactionStats);

// Scheduled Post Routes
route.post("/api/scheduled-posts", verifyToken, schedulePost);
route.get("/api/scheduled-posts", verifyToken, getUserScheduledPosts);
route.delete("/api/scheduled-posts/:id", verifyToken, cancelScheduledPost);
route.put("/api/scheduled-posts/:id", verifyToken, updateScheduledPost);

export default route