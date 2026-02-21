import express from 'express';
import {
  verifyAdmin,
  getAdminStats,
  getAllUsers,
  toggleUserAdmin,
  deleteUser,
  getAllPosts,
  deletePost,
  getAllComments,
  deleteComment,
  getReports,
  approveReport
} from '../controllers/AdminController.js';
import verifyAdminMiddleware from '../middleware/AdminMiddleware.js';

const router = express.Router();

// Admin verification
router.get('/verify', verifyAdminMiddleware, verifyAdmin);

// Admin dashboard stats
router.get('/stats', verifyAdminMiddleware, getAdminStats);

// User management
router.get('/users', verifyAdminMiddleware, getAllUsers);
router.patch('/users/:userId/toggle-admin', verifyAdminMiddleware, toggleUserAdmin);
router.delete('/users/:userId', verifyAdminMiddleware, deleteUser);

// Content management
router.get('/posts', verifyAdminMiddleware, getAllPosts);
router.delete('/posts/:postId', verifyAdminMiddleware, deletePost);
router.get('/comments', verifyAdminMiddleware, getAllComments);
router.delete('/comments/:commentId', verifyAdminMiddleware, deleteComment);

// Report management
router.get('/reports', verifyAdminMiddleware, getReports);
router.patch('/reports/:reportId/approve', verifyAdminMiddleware, approveReport);

export default router;