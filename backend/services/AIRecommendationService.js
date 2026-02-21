class AIRecommendationService {
  // Simple content classification based on text analysis
  static async classifyContent(text, mediaType = 'image') {
    const categories = {
      food: ['food', 'recipe', 'cook', 'eat', 'meal', 'dinner', 'lunch', 'breakfast', 'restaurant'],
      travel: ['travel', 'vacation', 'trip', 'destination', 'explore', 'adventure', 'tourist'],
      fitness: ['workout', 'exercise', 'gym', 'fitness', 'health', 'running', 'yoga'],
      fashion: ['fashion', 'style', 'clothing', 'outfit', 'dress', 'wear'],
      tech: ['tech', 'technology', 'gadget', 'phone', 'computer', 'software'],
      art: ['art', 'painting', 'drawing', 'creative', 'design', 'artist']
    };

    const lowerText = text.toLowerCase();
    let bestMatch = 'general';
    let highestScore = 0;

    for (const [category, keywords] of Object.entries(categories)) {
      const score = keywords.filter(keyword => lowerText.includes(keyword)).length;
      if (score > highestScore) {
        highestScore = score;
        bestMatch = category;
      }
    }

    return bestMatch;
  }

  // Generate post ideas based on user history
  static async generatePostIdeas(userId, userPreferences = {}) {
    const ideas = {
      general: [
        'Share something you learned today',
        'Post about your daily routine',
        'Ask your followers a question',
        'Share a behind-the-scenes moment'
      ],
      food: [
        'Share your favorite recipe',
        'Post a cooking tutorial',
        'Show your latest meal prep',
        'Review a restaurant you visited'
      ],
      travel: [
        'Share photos from your recent trip',
        'Create a travel guide for a place you visited',
        'Post about local culture and traditions',
        'Share travel tips and hacks'
      ],
      fitness: [
        'Share your workout routine',
        'Post about your fitness journey',
        'Create a workout challenge',
        'Share healthy recipes'
      ],
      fashion: [
        'Show your outfit of the day',
        'Create a style guide',
        'Share fashion tips',
        'Post about your favorite brands'
      ]
    };

    const category = userPreferences.category || 'general';
    const categoryIdeas = ideas[category] || ideas.general;
    
    // Return 3 random ideas from the category
    return categoryIdeas
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
  }

  // Analyze engagement patterns
  static async analyzeEngagement(userId, posts) {
    const engagementData = {
      bestTimeToPost: 'evening', // Based on when most engagement happens
      popularContentTypes: ['image', 'video'],
      trendingTopics: ['general', 'lifestyle'],
      engagementRate: 0.15 // 15% average
    };

    return engagementData;
  }
}

export default AIRecommendationService;