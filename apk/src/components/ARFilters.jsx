import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Download, Heart, Share2, Sparkles, Palette, Sliders } from 'lucide-react';

const ARFilters = ({ onClose, onApplyFilter, mediaType = 'image' }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('normal');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [filters] = useState([
    { id: 'normal', name: 'Normal', icon: '📷' },
    { id: 'clarendon', name: 'Clarendon', icon: '🌅' },
    { id: 'juno', name: 'Juno', icon: '🌸' },
    { id: 'lark', name: 'Lark', icon: '🌿' },
    { id: 'moon', name: 'Moon', icon: '🌙' },
    { id: 'reyes', name: 'Reyes', icon: '🌇' },
    { id: 'slumber', name: 'Slumber', icon: '😴' },
    { id: 'crema', name: 'Crema', icon: '☕' },
    { id: ' Ludwig', name: 'Ludwig', icon: '🎨' },
    { id: 'aden', name: 'Aden', icon: '🔮' },
    { id: 'perpetua', name: 'Perpetua', icon: '⚡' },
    { id: 'amaro', name: 'Amaro', icon: '💎' }
  ]);

  const [stickers] = useState([
    { id: 'heart', emoji: '❤️', name: 'Heart' },
    { id: 'star', emoji: '⭐', name: 'Star' },
    { id: 'fire', emoji: '🔥', name: 'Fire' },
    { id: 'sparkles', emoji: '✨', name: 'Sparkles' },
    { id: 'rainbow', emoji: '🌈', name: 'Rainbow' },
    { id: 'sunglasses', emoji: '😎', name: 'Sunglasses' },
    { id: 'crown', emoji: '👑', name: 'Crown' },
    { id: 'unicorn', emoji: '🦄', name: 'Unicorn' }
  ]);

  const [selectedStickers, setSelectedStickers] = useState([]);
  const [stickerPosition, setStickerPosition] = useState({ x: 50, y: 50 });
  const recordingIntervalRef = useRef(null);

  // Initialize camera
  useEffect(() => {
    const initCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'user',
            width: { ideal: 1080 },
            height: { ideal: 1920 }
          } 
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        alert('Could not access camera. Please check permissions.');
      }
    };

    initCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, [stream]);

  // Apply filter to canvas
  const applyFilter = (filterType) => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Apply filter based on type
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    switch (filterType) {
      case 'clarendon':
        applyClarendonFilter(data);
        break;
      case 'juno':
        applyJunoFilter(data);
        break;
      case 'lark':
        applyLarkFilter(data);
        break;
      case 'moon':
        applyMoonFilter(data);
        break;
      case 'reyes':
        applyReyesFilter(data);
        break;
      case 'slumber':
        applySlumberFilter(data);
        break;
      case 'crema':
        applyCremaFilter(data);
        break;
      case 'ludwig':
        applyLudwigFilter(data);
        break;
      case 'aden':
        applyAdenFilter(data);
        break;
      case 'perpetua':
        applyPerpetuaFilter(data);
        break;
      case 'amaro':
        applyAmaroFilter(data);
        break;
      default:
        // Normal filter - no changes
        break;
    }

    ctx.putImageData(imageData, 0, 0);

    // Apply stickers
    selectedStickers.forEach(sticker => {
      drawSticker(ctx, sticker, canvas.width, canvas.height);
    });
  };

  // Filter implementations
  const applyClarendonFilter = (data) => {
    for (let i = 0; i < data.length; i += 4) {
      // Increase contrast and saturation
      data[i] = Math.min(255, data[i] * 1.1);     // Red
      data[i + 1] = Math.min(255, data[i + 1] * 1.1); // Green
      data[i + 2] = Math.min(255, data[i + 2] * 1.2); // Blue
    }
  };

  const applyJunoFilter = (data) => {
    for (let i = 0; i < data.length; i += 4) {
      // Warm tones
      data[i] = Math.min(255, data[i] * 1.15);    // Red
      data[i + 1] = Math.min(255, data[i + 1] * 1.05); // Green
      data[i + 2] = Math.min(255, data[i + 2] * 0.9);  // Blue
    }
  };

  const applyLarkFilter = (data) => {
    for (let i = 0; i < data.length; i += 4) {
      // Bright and fresh
      data[i] = Math.min(255, data[i] * 1.08);    // Red
      data[i + 1] = Math.min(255, data[i + 1] * 1.12); // Green
      data[i + 2] = Math.min(255, data[i + 2] * 1.05); // Blue
      // Increase brightness
      data[i] = Math.min(255, data[i] + 20);
      data[i + 1] = Math.min(255, data[i + 1] + 15);
      data[i + 2] = Math.min(255, data[i + 2] + 10);
    }
  };

  const applyMoonFilter = (data) => {
    for (let i = 0; i < data.length; i += 4) {
      // Black and white with blue tint
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      data[i] = avg * 0.8;      // Red (reduced)
      data[i + 1] = avg * 0.9;  // Green (slightly reduced)
      data[i + 2] = Math.min(255, avg * 1.2); // Blue (enhanced)
    }
  };

  const applyReyesFilter = (data) => {
    for (let i = 0; i < data.length; i += 4) {
      // Sepia tones
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
      data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
      data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
    }
  };

  const applySlumberFilter = (data) => {
    for (let i = 0; i < data.length; i += 4) {
      // Soft, dreamy effect
      data[i] = Math.min(255, data[i] * 0.9);     // Red
      data[i + 1] = Math.min(255, data[i + 1] * 0.95); // Green
      data[i + 2] = Math.min(255, data[i + 2] * 1.1);  // Blue
      // Reduce contrast
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      data[i] = avg + (data[i] - avg) * 0.7;
      data[i + 1] = avg + (data[i + 1] - avg) * 0.7;
      data[i + 2] = avg + (data[i + 2] - avg) * 0.7;
    }
  };

  const applyCremaFilter = (data) => {
    for (let i = 0; i < data.length; i += 4) {
      // Warm, vintage look
      data[i] = Math.min(255, data[i] * 1.1);     // Red
      data[i + 1] = Math.min(255, data[i + 1] * 1.05); // Green
      data[i + 2] = Math.min(255, data[i + 2] * 0.95); // Blue
      // Add slight warmth
      data[i] = Math.min(255, data[i] + 15);
    }
  };

  const applyLudwigFilter = (data) => {
    for (let i = 0; i < data.length; i += 4) {
      // Artistic, enhanced colors
      data[i] = Math.min(255, data[i] * 1.12);    // Red
      data[i + 1] = Math.min(255, data[i + 1] * 1.08); // Green
      data[i + 2] = Math.min(255, data[i + 2] * 1.15); // Blue
    }
  };

  const applyAdenFilter = (data) => {
    for (let i = 0; i < data.length; i += 4) {
      // Cool, pastel tones
      data[i] = Math.min(255, data[i] * 0.95);    // Red
      data[i + 1] = Math.min(255, data[i + 1] * 1.05); // Green
      data[i + 2] = Math.min(255, data[i + 2] * 1.1);  // Blue
      // Add blue tint
      data[i + 2] = Math.min(255, data[i + 2] + 20);
    }
  };

  const applyPerpetuaFilter = (data) => {
    for (let i = 0; i < data.length; i += 4) {
      // Golden hour effect
      data[i] = Math.min(255, data[i] * 1.15);    // Red
      data[i + 1] = Math.min(255, data[i + 1] * 1.1);  // Green
      data[i + 2] = Math.min(255, data[i + 2] * 0.9);  // Blue
      // Add warm tone
      data[i] = Math.min(255, data[i] + 25);
      data[i + 1] = Math.min(255, data[i + 1] + 15);
    }
  };

  const applyAmaroFilter = (data) => {
    for (let i = 0; i < data.length; i += 4) {
      // Rich, saturated colors
      data[i] = Math.min(255, data[i] * 1.1);     // Red
      data[i + 1] = Math.min(255, data[i + 1] * 1.15); // Green
      data[i + 2] = Math.min(255, data[i + 2] * 1.05); // Blue
      // Increase contrast
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      data[i] = avg + (data[i] - avg) * 1.2;
      data[i + 1] = avg + (data[i + 1] - avg) * 1.2;
      data[i + 2] = avg + (data[i + 2] - avg) * 1.2;
    }
  };

  // Draw sticker on canvas
  const drawSticker = (ctx, sticker, canvasWidth, canvasHeight) => {
    const x = (stickerPosition.x / 100) * canvasWidth;
    const y = (stickerPosition.y / 100) * canvasHeight;
    const fontSize = Math.min(canvasWidth, canvasHeight) * 0.1;
    
    ctx.font = `${fontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(sticker.emoji, x, y);
  };

  // Handle filter selection
  const handleFilterSelect = (filterId) => {
    setSelectedFilter(filterId);
    applyFilter(filterId);
  };

  // Handle sticker selection
  const handleStickerSelect = (sticker) => {
    setSelectedStickers(prev => {
      const newStickers = [...prev, sticker];
      // Apply filter to show sticker
      setTimeout(() => applyFilter(selectedFilter), 100);
      return newStickers;
    });
  };

  // Handle sticker removal
  const removeSticker = (stickerId) => {
    setSelectedStickers(prev => prev.filter(s => s.id !== stickerId));
    setTimeout(() => applyFilter(selectedFilter), 100);
  };

  // Start/stop recording
  const toggleRecording = () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      // Capture final frame
      applyFilter(selectedFilter);
    } else {
      // Start recording
      setIsRecording(true);
      setRecordingTime(0);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 59) { // 59 seconds max
            toggleRecording();
            return 0;
          }
          applyFilter(selectedFilter);
          return prev + 1;
        });
      }, 1000);
    }
  };

  // Capture photo
  const capturePhoto = () => {
    applyFilter(selectedFilter);
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        onApplyFilter(url, 'image');
        onClose();
      }, 'image/jpeg', 0.9);
    }
  };

  // Save video
  const saveVideo = () => {
    // This would typically use MediaRecorder API
    // For now, we'll capture the current frame as a photo
    capturePhoto();
  };

  return (
    <div className="ar-filters-modal">
      <div className="ar-filters-container">
        {/* Header */}
        <div className="ar-filters-header">
          <h2>AR Filters & Effects</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Camera Preview */}
        <div className="camera-preview">
          <video 
            ref={videoRef} 
            autoPlay 
            muted 
            playsInline
            className="camera-video"
            style={{ display: 'none' }}
          />
          <canvas 
            ref={canvasRef} 
            className="filter-canvas"
          />
          
          {/* Recording indicator */}
          {isRecording && (
            <div className="recording-indicator">
              <div className="recording-dot"></div>
              <span>{Math.floor(recordingTime / 60)}:{String(recordingTime % 60).padStart(2, '0')}</span>
            </div>
          )}
        </div>

        {/* Filter Controls */}
        <div className="filter-controls">
          <div className="filter-selector">
            <h3><Palette size={20} /> Filters</h3>
            <div className="filter-grid">
              {filters.map(filter => (
                <button
                  key={filter.id}
                  className={`filter-option ${selectedFilter === filter.id ? 'active' : ''}`}
                  onClick={() => handleFilterSelect(filter.id)}
                >
                  <span className="filter-icon">{filter.icon}</span>
                  <span className="filter-name">{filter.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Stickers */}
          <div className="sticker-selector">
            <h3><Sparkles size={20} /> Stickers</h3>
            <div className="sticker-grid">
              {stickers.map(sticker => (
                <button
                  key={sticker.id}
                  className="sticker-option"
                  onClick={() => handleStickerSelect(sticker)}
                >
                  <span className="sticker-emoji">{sticker.emoji}</span>
                  <span className="sticker-name">{sticker.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Applied Stickers */}
          {selectedStickers.length > 0 && (
            <div className="applied-stickers">
              <h4>Applied Stickers:</h4>
              <div className="sticker-list">
                {selectedStickers.map(sticker => (
                  <div key={sticker.id} className="applied-sticker">
                    <span>{sticker.emoji}</span>
                    <button 
                      onClick={() => removeSticker(sticker.id)}
                      className="remove-sticker"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="ar-actions">
          {mediaType === 'video' ? (
            <button 
              className={`record-btn ${isRecording ? 'recording' : ''}`}
              onClick={toggleRecording}
            >
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </button>
          ) : (
            <button className="capture-btn" onClick={capturePhoto}>
              <Camera size={24} />
              Capture Photo
            </button>
          )}
          
          <div className="utility-buttons">
            <button className="download-btn">
              <Download size={20} />
            </button>
            <button className="share-btn">
              <Share2 size={20} />
            </button>
            <button className="like-btn">
              <Heart size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ARFilters;