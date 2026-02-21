import API from './api';

class StoryService {
  // Get story feed
  static async getStoryFeed() {
    try {
      const response = await API.get('/user/story/feed');
      return response.data;
    } catch (error) {
      console.error('Error fetching story feed:', error);
      throw error;
    }
  }

  // Get enhanced story feed with filters
  static async getEnhancedStoryFeed(params = {}) {
    try {
      const response = await API.get('/user/story/feed-enhanced', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching enhanced story feed:', error);
      throw error;
    }
  }

  // Create story
  static async createStory(storyData) {
    try {
      const response = await API.post('/user/story/create', storyData);
      return response.data;
    } catch (error) {
      console.error('Error creating story:', error);
      throw error;
    }
  }

  // Create enhanced story with filters and effects
  static async createEnhancedStory(storyData) {
    try {
      const response = await API.post('/user/story/create-enhanced', storyData);
      return response.data;
    } catch (error) {
      console.error('Error creating enhanced story:', error);
      throw error;
    }
  }

  // Mark story as viewed
  static async markStoryAsViewed(storyId) {
    try {
      const response = await API.post(`/user/story/${storyId}/view`);
      return response.data;
    } catch (error) {
      console.error('Error marking story as viewed:', error);
      throw error;
    }
  }

  // Get story views
  static async getStoryViews(storyId) {
    try {
      const response = await API.get(`/user/story/${storyId}/views`);
      return response.data;
    } catch (error) {
      console.error('Error getting story views:', error);
      throw error;
    }
  }

  // Add story reaction
  static async addStoryReaction(storyId, reactionData) {
    try {
      const response = await API.post(`/user/story/${storyId}/reaction`, reactionData);
      return response.data;
    } catch (error) {
      console.error('Error adding story reaction:', error);
      throw error;
    }
  }

  // Get story analytics
  static async getStoryAnalytics(storyId) {
    try {
      const response = await API.get(`/user/story/${storyId}/analytics`);
      return response.data;
    } catch (error) {
      console.error('Error getting story analytics:', error);
      throw error;
    }
  }

  // Get story highlights
  static async getHighlights(userId) {
    try {
      const response = await API.get(`/user/stories/highlights/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching highlights:', error);
      throw error;
    }
  }

  // Add story to highlight
  static async addToHighlight(storyId, highlightName) {
    try {
      const response = await API.post(`/user/story/${storyId}/add-to-highlight`, { highlightName });
      return response.data;
    } catch (error) {
      console.error('Error adding story to highlight:', error);
      throw error;
    }
  }

  // Remove story from highlight
  static async removeFromHighlight(storyId) {
    try {
      const response = await API.delete(`/user/story/${storyId}/remove-from-highlight`);
      return response.data;
    } catch (error) {
      console.error('Error removing story from highlight:', error);
      throw error;
    }
  }

  // Create highlight collection
  static async createHighlightCollection(highlightData) {
    try {
      const response = await API.post('/user/story/create-highlight', highlightData);
      return response.data;
    } catch (error) {
      console.error('Error creating highlight collection:', error);
      throw error;
    }
  }

  // Get story archive
  static async getStoryArchive(userId) {
    try {
      const response = await API.get(`/user/stories/archive/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching story archive:', error);
      throw error;
    }
  }

  // Search stories
  static async searchStories(query, type = 'hashtag') {
    try {
      const response = await API.get('/user/stories/search', { params: { query, type } });
      return response.data;
    } catch (error) {
      console.error('Error searching stories:', error);
      throw error;
    }
  }
}

export default StoryService;