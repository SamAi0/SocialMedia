import cron from 'node-cron';
import ScheduledPost from '../models/ScheduledPostModel.js';
import Post from '../models/PostModel.js';
import Story from '../models/StoryModel.js';
import { generateObjectId } from '../utils/ObjectIdGenerator.js';

class SchedulerService {
  constructor() {
    this.activeJobs = new Map();
    this.initializeScheduler();
  }

  // Initialize the scheduler and load existing scheduled posts
  async initializeScheduler() {
    try {
      // Load all scheduled posts that are due
      await this.loadScheduledPosts();
      
      // Start the periodic checker
      this.startPeriodicChecker();
      
      console.log('Scheduler service initialized');
    } catch (error) {
      console.error('Failed to initialize scheduler:', error);
    }
  }

  // Load existing scheduled posts and set up cron jobs
  async loadScheduledPosts() {
    try {
      const now = new Date();
      const scheduledPosts = await ScheduledPost.find({
        scheduledTime: { $gte: now },
        status: 'scheduled'
      });

      for (const post of scheduledPosts) {
        this.schedulePostJob(post);
      }
    } catch (error) {
      console.error('Failed to load scheduled posts:', error);
    }
  }

  // Schedule a single post
  async schedulePost(postData) {
    try {
      const scheduledPost = new ScheduledPost({
        ...postData,
        _id: generateObjectId()
      });

      await scheduledPost.save();
      this.schedulePostJob(scheduledPost);
      
      return scheduledPost;
    } catch (error) {
      throw new Error(`Failed to schedule post: ${error.message}`);
    }
  }

  // Create cron job for a specific post
  schedulePostJob(scheduledPost) {
    try {
      const scheduledTime = new Date(scheduledPost.scheduledTime);
      const now = new Date();
      
      // If the scheduled time is in the past, publish immediately
      if (scheduledTime <= now) {
        this.publishPost(scheduledPost);
        return;
      }

      // Convert to cron format (minute hour day month weekday)
      const cronExpression = `${scheduledTime.getMinutes()} ${scheduledTime.getHours()} ${scheduledTime.getDate()} ${scheduledTime.getMonth() + 1} *`;
      
      const job = cron.schedule(cronExpression, async () => {
        try {
          await this.publishPost(scheduledPost);
          this.activeJobs.delete(scheduledPost._id.toString());
        } catch (error) {
          console.error(`Failed to publish scheduled post ${scheduledPost._id}:`, error);
          await ScheduledPost.findByIdAndUpdate(scheduledPost._id, { status: 'failed' });
        }
      }, {
        scheduled: true,
        timezone: scheduledPost.timezone || 'UTC'
      });

      this.activeJobs.set(scheduledPost._id.toString(), job);
      console.log(`Scheduled post ${scheduledPost._id} for ${scheduledTime}`);
    } catch (error) {
      console.error(`Failed to schedule job for post ${scheduledPost._id}:`, error);
    }
  }

  // Publish a scheduled post
  async publishPost(scheduledPost) {
    try {
      let createdPost;
      
      if (scheduledPost.postType === 'story') {
        // Create story
        createdPost = new Story({
          user: scheduledPost.userId,
          mediaUrl: scheduledPost.content.media[0]?.url,
          mediaType: scheduledPost.content.media[0]?.type,
          caption: scheduledPost.content.text,
          createdAt: new Date(),
          _id: generateObjectId()
        });
      } else {
        // Create regular post
        createdPost = new Post({
          user: scheduledPost.userId,
          text: scheduledPost.content.text,
          image: scheduledPost.content.media.find(m => m.type === 'image')?.url,
          video: scheduledPost.content.media.find(m => m.type === 'video')?.url,
          date: new Date(),
          hashtags: scheduledPost.hashtags,
          _id: generateObjectId(),
          scheduledPostId: scheduledPost._id
        });
      }

      await createdPost.save();
      await ScheduledPost.findByIdAndUpdate(scheduledPost._id, { status: 'published' });
      
      console.log(`Successfully published scheduled post ${scheduledPost._id}`);
      return createdPost;
    } catch (error) {
      throw new Error(`Failed to publish post: ${error.message}`);
    }
  }

  // Cancel a scheduled post
  async cancelScheduledPost(postId) {
    try {
      const job = this.activeJobs.get(postId);
      if (job) {
        job.stop();
        this.activeJobs.delete(postId);
      }
      
      const updatedPost = await ScheduledPost.findByIdAndUpdate(
        postId, 
        { status: 'cancelled' },
        { new: true }
      );
      
      return updatedPost;
    } catch (error) {
      throw new Error(`Failed to cancel scheduled post: ${error.message}`);
    }
  }

  // Get user's scheduled posts
  async getUserScheduledPosts(userId) {
    try {
      const posts = await ScheduledPost.find({ userId })
        .sort({ scheduledTime: 1 });
      return posts;
    } catch (error) {
      throw new Error(`Failed to get scheduled posts: ${error.message}`);
    }
  }

  // Periodic checker for posts that might have been missed
  startPeriodicChecker() {
    // Check every minute for posts that should be published
    setInterval(async () => {
      try {
        const now = new Date();
        const overduePosts = await ScheduledPost.find({
          scheduledTime: { $lte: now },
          status: 'scheduled'
        });

        for (const post of overduePosts) {
          await this.publishPost(post);
        }
      } catch (error) {
        console.error('Periodic checker error:', error);
      }
    }, 60000); // 1 minute
  }

  // Cleanup expired jobs
  cleanupExpiredJobs() {
    const now = new Date();
    for (const [postId, job] of this.activeJobs) {
      const post = ScheduledPost.findById(postId);
      if (post && post.scheduledTime < now) {
        job.stop();
        this.activeJobs.delete(postId);
      }
    }
  }
}

// Export singleton instance
export default new SchedulerService();