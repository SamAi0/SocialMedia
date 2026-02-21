import express from "express";
import { verifyToken } from "../middleware/VerifyToken.js";
import {
    getNotifications,
    getNewNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    getUnreadCount,
    deleteNotification,
    clearAllNotifications,
    createNotification,
    getNotificationStats
} from "../controllers/NotificationController.js";

import {
    getEnhancedNotifications,
    archiveNotification,
    bulkArchiveNotifications,
    getNotificationPreferences,
    updateNotificationPreferences,
    createSystemNotification,
    getNotificationAnalytics,
    markAsImportant
} from "../controllers/EnhancedNotificationController.js";

const router = express.Router();

// Basic notification routes (existing)
router.get("/:userId", verifyToken, getNotifications);
router.get("/:userId/new", verifyToken, getNewNotifications);
router.put("/:userId/:notificationId/read", verifyToken, markNotificationAsRead);
router.put("/:userId/read-all", verifyToken, markAllNotificationsAsRead);
router.get("/:userId/unread-count", verifyToken, getUnreadCount);
router.delete("/:notificationId", verifyToken, deleteNotification);
router.delete("/:userId/clear-all", verifyToken, clearAllNotifications);
router.get("/:userId/stats", verifyToken, getNotificationStats);

// Enhanced notification routes (new)
router.get("/enhanced/:userId", verifyToken, getEnhancedNotifications);
router.put("/:notificationId/archive", verifyToken, archiveNotification);
router.post("/:userId/bulk-archive", verifyToken, bulkArchiveNotifications);
router.get("/:userId/preferences", verifyToken, getNotificationPreferences);
router.put("/:userId/preferences", verifyToken, updateNotificationPreferences);
router.post("/system", verifyToken, createSystemNotification);
router.get("/:userId/analytics", verifyToken, getNotificationAnalytics);
router.put("/:notificationId/important", verifyToken, markAsImportant);

export default router;