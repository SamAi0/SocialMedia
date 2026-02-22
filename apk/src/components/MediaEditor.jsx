import React, { useState, useRef, useEffect } from 'react';
import { 
  Crop, 
  RotateCw, 
  Sun, 
  Contrast, 
  Palette,
  Download,
  X,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

const MediaEditor = ({ mediaFile, mediaType, onSave, onCancel }) => {
  const [editedMedia, setEditedMedia] = useState(null);
  const [filters, setFilters] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    hue: 0
  });
  const [cropActive, setCropActive] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    if (mediaFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditedMedia(e.target.result);
      };
      reader.readAsDataURL(mediaFile);
    }
  }, [mediaFile]);

  useEffect(() => {
    if (editedMedia && canvasRef.current) {
      applyFilters();
    }
  }, [editedMedia, filters, rotation, zoom]);

  const applyFilters = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (mediaType === 'image' && imageRef.current) {
      const img = imageRef.current;
      
      // Set canvas dimensions
      canvas.width = img.width * zoom;
      canvas.height = img.height * zoom;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Apply rotation
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      
      // Apply filters
      ctx.filter = `
        brightness(${filters.brightness}%)
        contrast(${filters.contrast}%)
        saturate(${filters.saturation}%)
        blur(${filters.blur}px)
        hue-rotate(${filters.hue}deg)
      `;
      
      // Draw image
      ctx.drawImage(
        img,
        -img.width * zoom / 2,
        -img.height * zoom / 2,
        img.width * zoom,
        img.height * zoom
      );
      
      ctx.restore();
    }
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    canvas.toBlob((blob) => {
      const editedFile = new File([blob], mediaFile.name, { type: mediaFile.type });
      onSave(editedFile);
    }, mediaFile.type);
  };

  const resetFilters = () => {
    setFilters({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
      hue: 0
    });
    setRotation(0);
    setZoom(1);
  };

  if (!mediaFile) return null;

  return (
    <div className="media-editor-overlay">
      <div className="media-editor-container">
        <div className="media-editor-header">
          <h2>Media Editor</h2>
          <button className="close-button" onClick={onCancel}>
            <X size={20} />
          </button>
        </div>
        
        <div className="media-editor-content">
          {/* Preview Area */}
          <div className="preview-area">
            <canvas 
              ref={canvasRef} 
              className="editor-canvas"
              style={{ 
                transform: `scale(${zoom})`,
                cursor: cropActive ? 'crosshair' : 'default'
              }}
            />
            
            {mediaType === 'image' && (
              <img 
                ref={imageRef}
                src={editedMedia}
                alt="Original"
                style={{ display: 'none' }}
                onLoad={applyFilters}
              />
            )}
            
            {mediaType === 'video' && (
              <video
                ref={videoRef}
                src={editedMedia}
                className="editor-video"
                controls
                style={{
                  filter: `
                    brightness(${filters.brightness}%)
                    contrast(${filters.contrast}%)
                    saturate(${filters.saturation}%)
                    blur(${filters.blur}px)
                    hue-rotate(${filters.hue}deg)
                  `
                }}
              />
            )}
          </div>
          
          {/* Tools Panel */}
          <div className="tools-panel">
            {/* Basic Tools */}
            <div className="tools-section">
              <h3>Basic Tools</h3>
              <div className="tool-buttons">
                <button 
                  className={`tool-button ${cropActive ? 'active' : ''}`}
                  onClick={() => setCropActive(!cropActive)}
                >
                  <Crop size={18} />
                  <span>Crop</span>
                </button>
                
                <button 
                  className="tool-button"
                  onClick={() => setRotation(prev => (prev + 90) % 360)}
                >
                  <RotateCw size={18} />
                  <span>Rotate</span>
                </button>
                
                <button className="tool-button" onClick={resetFilters}>
                  <span>Reset</span>
                </button>
              </div>
            </div>
            
            {/* Zoom Controls */}
            <div className="tools-section">
              <h3>Zoom</h3>
              <div className="zoom-controls">
                <button 
                  className="zoom-button"
                  onClick={() => setZoom(prev => Math.max(0.1, prev - 0.1))}
                >
                  <ZoomOut size={16} />
                </button>
                <span className="zoom-value">{Math.round(zoom * 100)}%</span>
                <button 
                  className="zoom-button"
                  onClick={() => setZoom(prev => Math.min(3, prev + 0.1))}
                >
                  <ZoomIn size={16} />
                </button>
              </div>
            </div>
            
            {/* Filter Controls */}
            <div className="tools-section">
              <h3>Filters</h3>
              <div className="filter-controls">
                <div className="filter-group">
                  <label>Brightness</label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={filters.brightness}
                    onChange={(e) => handleFilterChange('brightness', parseInt(e.target.value))}
                  />
                  <span>{filters.brightness}%</span>
                </div>
                
                <div className="filter-group">
                  <label>Contrast</label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={filters.contrast}
                    onChange={(e) => handleFilterChange('contrast', parseInt(e.target.value))}
                  />
                  <span>{filters.contrast}%</span>
                </div>
                
                <div className="filter-group">
                  <label>Saturation</label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={filters.saturation}
                    onChange={(e) => handleFilterChange('saturation', parseInt(e.target.value))}
                  />
                  <span>{filters.saturation}%</span>
                </div>
                
                <div className="filter-group">
                  <label>Blur</label>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={filters.blur}
                    onChange={(e) => handleFilterChange('blur', parseInt(e.target.value))}
                  />
                  <span>{filters.blur}px</span>
                </div>
                
                <div className="filter-group">
                  <label>Hue</label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={filters.hue}
                    onChange={(e) => handleFilterChange('hue', parseInt(e.target.value))}
                  />
                  <span>{filters.hue}°</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="media-editor-footer">
          <button className="cancel-button" onClick={onCancel}>
            Cancel
          </button>
          <button className="save-button" onClick={handleSave}>
            <Download size={16} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default MediaEditor;