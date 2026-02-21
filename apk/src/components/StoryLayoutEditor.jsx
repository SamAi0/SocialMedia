import React, { useState, useRef, useCallback } from 'react';
import { Plus, X, Grid, Columns, Square, Move, Trash2, Save, Palette } from 'lucide-react';
import '../styles/StoryLayoutEditor.css';
import API from '../utils/api';

const StoryLayoutEditor = ({ onClose, onSave, initialLayout = null }) => {
  const [layoutName, setLayoutName] = useState(initialLayout?.name || '');
  const [templateType, setTemplateType] = useState(initialLayout?.templateType || 'custom');
  const [sections, setSections] = useState(initialLayout?.sections || []);
  const [backgroundColor, setBackgroundColor] = useState(initialLayout?.backgroundColor || '#000000');
  const [isPublic, setIsPublic] = useState(initialLayout?.isPublic || false);
  const [draggedSection, setDraggedSection] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const editorRef = useRef(null);

  // Predefined template configurations
  const templateConfigs = {
    'split-screen': [
      { type: 'image', position: { x: 0, y: 0 }, size: { width: 50, height: 100 } },
      { type: 'image', position: { x: 50, y: 0 }, size: { width: 50, height: 100 } }
    ],
    'multi-column': [
      { type: 'image', position: { x: 0, y: 0 }, size: { width: 33.33, height: 100 } },
      { type: 'image', position: { x: 33.33, y: 0 }, size: { width: 33.33, height: 100 } },
      { type: 'image', position: { x: 66.66, y: 0 }, size: { width: 33.33, height: 100 } }
    ],
    'grid': [
      { type: 'image', position: { x: 0, y: 0 }, size: { width: 50, height: 50 } },
      { type: 'image', position: { x: 50, y: 0 }, size: { width: 50, height: 50 } },
      { type: 'image', position: { x: 0, y: 50 }, size: { width: 50, height: 50 } },
      { type: 'image', position: { x: 50, y: 50 }, size: { width: 50, height: 50 } }
    ],
    'custom': []
  };

  // Apply template
  const applyTemplate = (template) => {
    setTemplateType(template);
    setSections(templateConfigs[template] || []);
  };

  // Add new section
  const addSection = (type) => {
    const newSection = {
      type,
      position: { x: 10, y: 10 },
      size: { width: 30, height: 30 },
      zIndex: sections.length + 1
    };
    setSections([...sections, newSection]);
  };

  // Update section
  const updateSection = (index, updates) => {
    const updatedSections = [...sections];
    updatedSections[index] = { ...updatedSections[index], ...updates };
    setSections(updatedSections);
  };

  // Remove section
  const removeSection = (index) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  // Handle drag start
  const handleDragStart = (index, e) => {
    setDraggedSection(index);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Handle drag over
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    if (draggedSection !== null && isDragging) {
      const rect = editorRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      updateSection(draggedSection, {
        position: { 
          x: Math.max(0, Math.min(100 - sections[draggedSection].size.width, x)),
          y: Math.max(0, Math.min(100 - sections[draggedSection].size.height, y))
        }
      });
    }
  }, [draggedSection, isDragging, sections]);

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedSection(null);
    setIsDragging(false);
  };

  // Save layout
  const handleSave = async () => {
    if (!layoutName.trim()) {
      alert('Please enter a layout name');
      return;
    }

    try {
      const layoutData = {
        name: layoutName,
        templateType,
        sections,
        backgroundColor,
        isPublic
      };

      const response = await API.post('/api/story/layout', layoutData);
      
      if (response.data.success) {
        onSave(response.data.layout);
        onClose();
      }
    } catch (error) {
      console.error('Error saving layout:', error);
      alert('Failed to save layout');
    }
  };

  // Render section based on type
  const renderSection = (section, index) => {
    const style = {
      left: `${section.position.x}%`,
      top: `${section.position.y}%`,
      width: `${section.size.width}%`,
      height: `${section.size.height}%`,
      zIndex: section.zIndex || 1
    };

    switch (section.type) {
      case 'image':
        return (
          <div 
            key={index}
            className="layout-section image-section"
            style={style}
            draggable
            onDragStart={(e) => handleDragStart(index, e)}
            onDragEnd={handleDragEnd}
          >
            <div className="section-content">
              <span>📷 Image</span>
            </div>
            <button 
              className="remove-section-btn"
              onClick={() => removeSection(index)}
            >
              <Trash2 size={16} />
            </button>
          </div>
        );
      case 'video':
        return (
          <div 
            key={index}
            className="layout-section video-section"
            style={style}
            draggable
            onDragStart={(e) => handleDragStart(index, e)}
            onDragEnd={handleDragEnd}
          >
            <div className="section-content">
              <span>🎬 Video</span>
            </div>
            <button 
              className="remove-section-btn"
              onClick={() => removeSection(index)}
            >
              <Trash2 size={16} />
            </button>
          </div>
        );
      case 'text':
        return (
          <div 
            key={index}
            className="layout-section text-section"
            style={style}
            draggable
            onDragStart={(e) => handleDragStart(index, e)}
            onDragEnd={handleDragEnd}
          >
            <div className="section-content">
              <span>📝 Text</span>
            </div>
            <button 
              className="remove-section-btn"
              onClick={() => removeSection(index)}
            >
              <Trash2 size={16} />
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="story-layout-editor-modal">
      <div className="story-layout-editor-container">
        <div className="editor-header">
          <h2>{initialLayout ? 'Edit Layout' : 'Create Custom Layout'}</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="editor-content">
          {/* Left Panel - Controls */}
          <div className="editor-controls">
            <div className="control-group">
              <label>Layout Name</label>
              <input
                type="text"
                value={layoutName}
                onChange={(e) => setLayoutName(e.target.value)}
                placeholder="Enter layout name"
              />
            </div>

            <div className="control-group">
              <label>Template Type</label>
              <div className="template-buttons">
                <button 
                  className={templateType === 'split-screen' ? 'active' : ''}
                  onClick={() => applyTemplate('split-screen')}
                >
                  <Columns size={16} />
                  Split Screen
                </button>
                <button 
                  className={templateType === 'multi-column' ? 'active' : ''}
                  onClick={() => applyTemplate('multi-column')}
                >
                  <Grid size={16} />
                  Multi-Column
                </button>
                <button 
                  className={templateType === 'grid' ? 'active' : ''}
                  onClick={() => applyTemplate('grid')}
                >
                  <Grid size={16} />
                  Grid
                </button>
                <button 
                  className={templateType === 'custom' ? 'active' : ''}
                  onClick={() => applyTemplate('custom')}
                >
                  <Square size={16} />
                  Custom
                </button>
              </div>
            </div>

            <div className="control-group">
              <label>Background Color</label>
              <div className="color-picker">
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                />
                <span>{backgroundColor}</span>
              </div>
            </div>

            <div className="control-group">
              <label>
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                />
                Make Public
              </label>
            </div>

            <div className="control-group">
              <label>Add Section</label>
              <div className="add-section-buttons">
                <button onClick={() => addSection('image')}>
                  <Plus size={16} /> Image
                </button>
                <button onClick={() => addSection('video')}>
                  <Plus size={16} /> Video
                </button>
                <button onClick={() => addSection('text')}>
                  <Plus size={16} /> Text
                </button>
              </div>
            </div>

            <div className="editor-actions">
              <button className="save-btn" onClick={handleSave}>
                <Save size={16} /> Save Layout
              </button>
              <button className="cancel-btn" onClick={onClose}>
                Cancel
              </button>
            </div>
          </div>

          {/* Right Panel - Editor Canvas */}
          <div className="editor-canvas">
            <div 
              className="layout-canvas"
              ref={editorRef}
              style={{ backgroundColor }}
              onDragOver={handleDragOver}
              onDrop={handleDragEnd}
            >
              {sections.map((section, index) => renderSection(section, index))}
              
              {sections.length === 0 && (
                <div className="empty-canvas-message">
                  <Palette size={48} />
                  <p>Select a template or add sections to get started</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryLayoutEditor;