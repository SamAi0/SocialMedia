import StoryLayout from '../models/StoryLayoutModel.js';
import TemplateService from '../services/TemplateService.js';
import { generateObjectId } from '../utils/ObjectIdGenerator.js';

// Create custom story layout
export const createStoryLayout = async (req, res) => {
  try {
    const { name, templateType, sections, backgroundColor, isPublic } = req.body;
    const userId = req.user._id;

    const layout = new StoryLayout({
      name,
      templateType,
      sections,
      backgroundColor,
      isPublic: isPublic || false,
      userId,
      _id: generateObjectId()
    });

    await layout.save();
    
    res.status(201).json({
      success: true,
      message: 'Story layout created successfully',
      layout
    });
  } catch (error) {
    console.error('Error creating story layout:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create story layout'
    });
  }
};

// Get user's story layouts
export const getUserStoryLayouts = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const layouts = await StoryLayout.find({
      $or: [
        { userId },
        { isPublic: true }
      ]
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      layouts
    });
  } catch (error) {
    console.error('Error getting story layouts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get story layouts'
    });
  }
};

// Get dynamic templates
export const getDynamicTemplates = async (req, res) => {
  try {
    const { contentType, mediaType } = req.query;
    
    const templates = await TemplateService.getPredefinedTemplates(contentType);
    const dynamicTemplate = await TemplateService.generateDynamicTemplate(mediaType, { tags: [] });
    
    res.status(200).json({
      success: true,
      templates,
      suggestedTemplate: dynamicTemplate
    });
  } catch (error) {
    console.error('Error getting dynamic templates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dynamic templates'
    });
  }
};

// Save template for later use
export const saveTemplate = async (req, res) => {
  try {
    const userId = req.user._id;
    const templateData = req.body;
    
    const template = await TemplateService.saveCustomTemplate(userId, templateData);
    
    res.status(201).json({
      success: true,
      message: 'Template saved successfully',
      template
    });
  } catch (error) {
    console.error('Error saving template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save template'
    });
  }
};

// Update story layout
export const updateStoryLayout = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const updateData = req.body;

    const layout = await StoryLayout.findOneAndUpdate(
      { _id: id, userId },
      { ...updateData },
      { new: true, runValidators: true }
    );

    if (!layout) {
      return res.status(404).json({
        success: false,
        message: 'Layout not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Layout updated successfully',
      layout
    });
  } catch (error) {
    console.error('Error updating story layout:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update story layout'
    });
  }
};

// Delete story layout
export const deleteStoryLayout = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const layout = await StoryLayout.findOneAndDelete({ _id: id, userId });

    if (!layout) {
      return res.status(404).json({
        success: false,
        message: 'Layout not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Layout deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting story layout:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete story layout'
    });
  }
};