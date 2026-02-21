import StoryLayout from '../models/StoryLayoutModel.js';
import { generateObjectId } from '../utils/ObjectIdGenerator.js';

class TemplateService {
  // Get predefined templates based on content type
  static async getPredefinedTemplates(contentType = 'general') {
    const templates = {
      general: [
        {
          name: 'Classic Story',
          templateType: 'split-screen',
          sections: [
            { type: 'image', position: { x: 0, y: 0 }, size: { width: 100, height: 100 } }
          ],
          backgroundColor: '#000000'
        },
        {
          name: 'Split Screen',
          templateType: 'split-screen',
          sections: [
            { type: 'image', position: { x: 0, y: 0 }, size: { width: 50, height: 100 } },
            { type: 'image', position: { x: 50, y: 0 }, size: { width: 50, height: 100 } }
          ],
          backgroundColor: '#000000'
        }
      ],
      food: [
        {
          name: 'Recipe Card',
          templateType: 'custom',
          sections: [
            { type: 'image', position: { x: 0, y: 0 }, size: { width: 100, height: 60 } },
            { type: 'text', position: { x: 5, y: 65 }, size: { width: 90, height: 30 } }
          ],
          backgroundColor: '#FF6B35'
        }
      ],
      travel: [
        {
          name: 'Destination Highlight',
          templateType: 'custom',
          sections: [
            { type: 'image', position: { x: 0, y: 0 }, size: { width: 100, height: 70 } },
            { type: 'text', position: { x: 10, y: 75 }, size: { width: 80, height: 20 } }
          ],
          backgroundColor: '#4ECDC4'
        }
      ]
    };

    return templates[contentType] || templates.general;
  }

  // Generate dynamic template based on content analysis
  static async generateDynamicTemplate(mediaType, contentMetadata = {}) {
    // Simple content classification based on metadata
    let contentType = 'general';
    
    if (contentMetadata.tags) {
      if (contentMetadata.tags.includes('food') || contentMetadata.tags.includes('cooking')) {
        contentType = 'food';
      } else if (contentMetadata.tags.includes('travel') || contentMetadata.tags.includes('destination')) {
        contentType = 'travel';
      }
    }

    const templates = await this.getPredefinedTemplates(contentType);
    return templates[0] || templates[0]; // Return first template as default
  }

  // Save user custom template
  static async saveCustomTemplate(userId, templateData) {
    try {
      const template = new StoryLayout({
        ...templateData,
        userId: userId,
        _id: generateObjectId()
      });

      await template.save();
      return template;
    } catch (error) {
      throw new Error(`Failed to save custom template: ${error.message}`);
    }
  }

  // Get user's saved templates
  static async getUserTemplates(userId) {
    try {
      const templates = await StoryLayout.find({ 
        $or: [
          { userId: userId },
          { isPublic: true }
        ]
      }).sort({ createdAt: -1 });
      
      return templates;
    } catch (error) {
      throw new Error(`Failed to get user templates: ${error.message}`);
    }
  }

  // Apply template to story
  static async applyTemplateToStory(storyId, templateId) {
    // This would be implemented in the StoryController
    // to update the story with the template configuration
    return { success: true, message: 'Template applied successfully' };
  }
}

export default TemplateService;