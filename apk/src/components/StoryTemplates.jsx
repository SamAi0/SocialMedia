import React, { useState, useEffect } from 'react';
import { Grid, Sparkles, Heart, Camera, Globe, Lock, Plus, Edit3 } from 'lucide-react';
import '../styles/StoryTemplates.css';
import API from '../utils/api';
import StoryLayoutEditor from './StoryLayoutEditor';

const StoryTemplates = ({ onClose, onSelectTemplate, currentMedia }) => {
  const [templates, setTemplates] = useState([]);
  const [userTemplates, setUserTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Predefined template categories
  const categories = [
    { id: 'all', name: 'All Templates', icon: Grid },
    { id: 'general', name: 'General', icon: Sparkles },
    { id: 'food', name: 'Food & Recipes', icon: Heart },
    { id: 'travel', name: 'Travel', icon: Globe },
    { id: 'fashion', name: 'Fashion', icon: Camera },
    { id: 'my-templates', name: 'My Templates', icon: Edit3 }
  ];

  useEffect(() => {
    loadTemplates();
  }, [selectedCategory]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      
      // Get dynamic templates based on content
      const contentType = classifyContent(currentMedia?.caption || '');
      const response = await API.get(`/api/story/templates?contentType=${contentType}`);
      
      if (response.data.success) {
        setTemplates(response.data.templates || []);
      }

      // Get user's saved templates
      const userResponse = await API.get('/api/story/layouts');
      if (userResponse.data.success) {
        setUserTemplates(userResponse.data.layouts || []);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  // Simple content classification
  const classifyContent = (text) => {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('food') || lowerText.includes('recipe') || lowerText.includes('cook')) {
      return 'food';
    } else if (lowerText.includes('travel') || lowerText.includes('trip') || lowerText.includes('vacation')) {
      return 'travel';
    } else if (lowerText.includes('fashion') || lowerText.includes('style') || lowerText.includes('outfit')) {
      return 'fashion';
    }
    
    return 'general';
  };

  // Apply template to story
  const handleTemplateSelect = (template) => {
    onSelectTemplate(template);
    onClose();
  };

  // Save template for later use
  const handleSaveTemplate = async (template) => {
    try {
      const response = await API.post('/api/story/template/save', template);
      if (response.data.success) {
        loadTemplates(); // Refresh templates
      }
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  // Filter templates based on category and search
  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || 
                          (selectedCategory === 'my-templates' && userTemplates.some(ut => ut._id === template._id)) ||
                          template.category === selectedCategory;
    
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  const allTemplates = selectedCategory === 'my-templates' ? userTemplates : 
                      [...filteredTemplates, ...userTemplates.filter(ut => 
                        selectedCategory === 'all' || ut.category === selectedCategory
                      )];

  const renderTemplateCard = (template, index) => {
    const isUserTemplate = userTemplates.some(ut => ut._id === template._id);
    
    return (
      <div key={template._id || index} className="template-card">
        <div 
          className="template-preview"
          style={{ backgroundColor: template.backgroundColor || '#000000' }}
          onClick={() => handleTemplateSelect(template)}
        >
          <div className="template-layout">
            {template.sections?.map((section, sectionIndex) => (
              <div
                key={sectionIndex}
                className={`section-preview ${section.type}`}
                style={{
                  left: `${section.position?.x || 0}%`,
                  top: `${section.position?.y || 0}%`,
                  width: `${section.size?.width || 100}%`,
                  height: `${section.size?.height || 100}%`
                }}
              >
                {section.type === 'image' && '📷'}
                {section.type === 'video' && '🎬'}
                {section.type === 'text' && '📝'}
              </div>
            ))}
          </div>
        </div>
        
        <div className="template-info">
          <h3>{template.name}</h3>
          <p>{template.description || 'Custom story layout'}</p>
          
          <div className="template-actions">
            <button 
              className="apply-btn"
              onClick={() => handleTemplateSelect(template)}
            >
              Apply
            </button>
            
            {!isUserTemplate && (
              <button 
                className="save-btn"
                onClick={() => handleSaveTemplate(template)}
              >
                <Plus size={16} />
              </button>
            )}
            
            {isUserTemplate && (
              <span className="user-template-badge">
                <Lock size={14} />
                Saved
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (showEditor) {
    return (
      <StoryLayoutEditor
        onClose={() => setShowEditor(false)}
        onSave={(newTemplate) => {
          setUserTemplates([...userTemplates, newTemplate]);
          setShowEditor(false);
        }}
      />
    );
  }

  return (
    <div className="story-templates-modal">
      <div className="story-templates-container">
        <div className="templates-header">
          <h2>Choose Story Template</h2>
          <button className="close-btn" onClick={onClose}>
            <span>×</span>
          </button>
        </div>

        <div className="templates-content">
          {/* Category Filter */}
          <div className="category-filter">
            <div className="category-buttons">
              {categories.map(category => {
                const IconComponent = category.icon;
                return (
                  <button
                    key={category.id}
                    className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <IconComponent size={18} />
                    <span>{category.name}</span>
                  </button>
                );
              })}
            </div>
            
            <button 
              className="create-template-btn"
              onClick={() => setShowEditor(true)}
            >
              <Plus size={18} />
              Create Template
            </button>
          </div>

          {/* Search Bar */}
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Templates Grid */}
          {loading ? (
            <div className="loading-templates">
              <div className="spinner"></div>
              <p>Loading templates...</p>
            </div>
          ) : (
            <div className="templates-grid">
              {allTemplates.length > 0 ? (
                allTemplates.map((template, index) => renderTemplateCard(template, index))
              ) : (
                <div className="no-templates">
                  <Grid size={48} />
                  <h3>No templates found</h3>
                  <p>Try a different category or create your own template</p>
                  <button 
                    className="create-first-template"
                    onClick={() => setShowEditor(true)}
                  >
                    Create Your First Template
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoryTemplates;