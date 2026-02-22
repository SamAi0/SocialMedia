import React, { useState, useRef, useEffect } from 'react';
import { 
  Image as ImageIcon, 
  Video, 
  X, 
  Upload, 
  Film, 
  Camera, 
  Bold, 
  Italic, 
  Underline, 
  Link, 
  Hash, 
  MapPin, 
  Calendar, 
  Lock, 
  Globe, 
  Users,
  Edit3,
  Eye
} from 'lucide-react';
import { uploadMediaToCloudinary } from '../utils/MediaUploadService';
import { useNavigate } from 'react-router-dom';
import MediaEditor from './MediaEditor';
import PostPreview from './PostPreview';
import '../styles/CreatePost.css';
import '../styles/MediaEditor.css';
import '../styles/PostPreview.css';
import API from '../utils/api';

const CreatePost = ({ onPostCreated, onCancel }) => {
  const [text, setText] = useState('');
  const [media, setMedia] = useState(null);
  const [mediaType, setMediaType] = useState(null); // 'image' or 'video'
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaFiles, setMediaFiles] = useState([]); // For multiple media
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [postType, setPostType] = useState('post'); // 'post' or 'reel'
  const [activeTab, setActiveTab] = useState('post'); // 'post' or 'reel'
  const [aspectRatio, setAspectRatio] = useState('4:5'); // Default Instagram post ratio
  const [duration, setDuration] = useState(0); // For video duration in seconds
  const [privacy, setPrivacy] = useState('public'); // 'public', 'friends', 'private'
  const [location, setLocation] = useState(null);
  const [scheduledTime, setScheduledTime] = useState('');
  const [hashtags, setHashtags] = useState([]);
  const [mentions, setMentions] = useState([]);
  const [textFormatting, setTextFormatting] = useState({
    bold: false,
    italic: false,
    underline: false,
    link: false
  });
  const [showHashtagSuggestions, setShowHashtagSuggestions] = useState(false);
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [suggestedHashtags, setSuggestedHashtags] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [showMediaEditor, setShowMediaEditor] = useState(false);
  const [currentEditingMedia, setCurrentEditingMedia] = useState(null);
  const [showPostPreview, setShowPostPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const formRef = useRef(null);
  const submitButtonRef = useRef(null);
  const navigate = useNavigate();

  // Scroll detection for the form
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = form;
      const isScrollable = scrollHeight > clientHeight;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      
      form.classList.toggle('scrollable', isScrollable);
      form.classList.toggle('at-bottom', isAtBottom);
    };

    form.addEventListener('scroll', handleScroll);
    // Initial check
    handleScroll();

    return () => {
      form.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Create a manual scroll to bottom function
  const scrollToBottom = () => {
    submitButtonRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Add click handler directly on the ::after pseudo-element using JavaScript
  useEffect(() => {
    const handleFormClick = (e) => {
      // Calculate if the click was on the area where the ::after pseudo-element is
      const form = formRef.current;
      if (!form) return;
      
      const rect = form.getBoundingClientRect();
      const isInRightBottomCorner = 
        e.clientX > rect.right - 60 && 
        e.clientX < rect.right - 20 &&
        e.clientY > rect.bottom - 140 && 
        e.clientY < rect.bottom - 100;
      
      if (isInRightBottomCorner) {
        scrollToBottom();
      }
    };

    const form = formRef.current;
    if (form) {
      form.addEventListener('click', handleFormClick);
    }

    return () => {
      if (form) {
        form.removeEventListener('click', handleFormClick);
      }
    };
  }, []);

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    
    // Extract hashtags and mentions in real-time
    const hashtagMatches = newText.match(/#[a-z0-9_]+/gi) || [];
    const mentionMatches = newText.match(/@[a-z0-9_]+/gi) || [];
    
    setHashtags([...new Set(hashtagMatches.map(tag => tag.toLowerCase()))]);
    setMentions([...new Set(mentionMatches.map(mention => mention.toLowerCase()))]);
    
    // Show suggestions when typing hashtags or mentions
    setShowHashtagSuggestions(hashtagMatches.length > 0 && newText.endsWith('#'));
    setShowMentionSuggestions(mentionMatches.length > 0 && newText.endsWith('@'));
  };

  const applyFormatting = (format, value) => {
    const textarea = document.querySelector('.post-text-input');
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = text.substring(start, end);
    
    let formattedText = selectedText;
    
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'underline':
        formattedText = `__${selectedText}__`;
        break;
      case 'link':
        formattedText = `[${selectedText}](${value || 'https://'})`;
        break;
      default:
        break;
    }
    
    const newText = text.substring(0, start) + formattedText + text.substring(end);
    setText(newText);
    
    // Reset formatting
    setTextFormatting({
      bold: false,
      italic: false,
      underline: false,
      link: false
    });
  };

  const handleHashtagSuggestionClick = (hashtag) => {
    const textarea = document.querySelector('.post-text-input');
    if (!textarea) return;
    
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = text.substring(0, cursorPos);
    const textAfterCursor = text.substring(cursorPos);
    
    // Find the last # character before cursor
    const lastHashIndex = textBeforeCursor.lastIndexOf('#');
    if (lastHashIndex !== -1) {
      const newText = textBeforeCursor.substring(0, lastHashIndex) + hashtag + ' ' + textAfterCursor;
      setText(newText);
      setShowHashtagSuggestions(false);
      textarea.focus();
    }
  };

  const handleMentionSuggestionClick = (username) => {
    const textarea = document.querySelector('.post-text-input');
    if (!textarea) return;
    
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = text.substring(0, cursorPos);
    const textAfterCursor = text.substring(cursorPos);
    
    // Find the last @ character before cursor
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const newText = textBeforeCursor.substring(0, lastAtIndex) + '@' + username + ' ' + textAfterCursor;
      setText(newText);
      setShowMentionSuggestions(false);
      textarea.focus();
    }
  };

  // Fetch hashtag suggestions
  useEffect(() => {
    const fetchHashtagSuggestions = async () => {
      if (showHashtagSuggestions) {
        try {
          const response = await API.get('/hashtags/popular');
          setSuggestedHashtags(response.data.hashtags || []);
        } catch (error) {
          console.error('Error fetching hashtag suggestions:', error);
          // Fallback to common hashtags
          setSuggestedHashtags(['#trending', '#popular', '#viral', '#follow', '#like']);
        }
      }
    };
    
    fetchHashtagSuggestions();
  }, [showHashtagSuggestions]);

  // Fetch user suggestions
  useEffect(() => {
    const fetchUserSuggestions = async () => {
      if (showMentionSuggestions) {
        try {
          const response = await API.get('/users/search?limit=10');
          setSuggestedUsers(response.data.users || []);
        } catch (error) {
          console.error('Error fetching user suggestions:', error);
          setSuggestedUsers([]);
        }
      }
    };
    
    fetchUserSuggestions();
  }, [showMentionSuggestions]);

  const openMediaEditor = (mediaFile) => {
    setCurrentEditingMedia(mediaFile);
    setShowMediaEditor(true);
  };

  const handleMediaEditSave = (editedFile) => {
    // Update the media with the edited version
    setMedia(editedFile);
    
    // Create new preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaPreview(reader.result);
    };
    reader.readAsDataURL(editedFile);
    
    // Close editor
    setShowMediaEditor(false);
    setCurrentEditingMedia(null);
  };

  const handleMediaEditCancel = () => {
    setShowMediaEditor(false);
    setCurrentEditingMedia(null);
  };

  const generatePreviewData = () => {
    const previewData = {
      text: text.trim(),
      postType: postType,
      privacy: privacy,
      hashtags: hashtags,
      mentions: mentions,
      location: location,
      scheduledTime: scheduledTime,
      duration: duration
    };
    
    // Add media data
    if (mediaFiles.length > 0) {
      previewData.media = mediaFiles.map((file, index) => ({
        url: URL.createObjectURL(file),
        type: file.type.split('/')[0],
        name: file.name,
        isPrimary: index === 0
      }));
    }
    
    return previewData;
  };

  const showPreview = () => {
    const data = generatePreviewData();
    setPreviewData(data);
    setShowPostPreview(true);
  };

  const closePreview = () => {
    setShowPostPreview(false);
    setPreviewData(null);
  };

  const handleMediaChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    const fileType = file.type.split('/')[0];
    if (fileType !== 'image' && fileType !== 'video') {
      alert('Please upload an image or video file.');
      return;
    }

    // Check video duration if it's a reel
    if (fileType === 'video' && activeTab === 'reel') {
      const isValid = await checkVideoDuration(file);
      if (!isValid) return;
      processMedia(file, fileType);
    } else {
      processMedia(file, fileType);
    }
  };
  
  const checkVideoDuration = (file) => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = function() {
        window.URL.revokeObjectURL(video.src);
        const durationSeconds = video.duration;

        // Instagram reels can be 3-90 seconds
        if (durationSeconds < 3) {
          alert('Reels must be at least 3 seconds long.');
          resolve(false);
          return;
        }

        if (durationSeconds > 90) {
          alert('Reels must be no longer than 90 seconds.');
          resolve(false);
          return;
        }

        setDuration(durationSeconds);
        resolve(true);
      };
      
      video.onerror = function() {
        window.URL.revokeObjectURL(video.src);
        alert('Error reading video file. Please try another file.');
        resolve(false);
      };
      
      video.src = URL.createObjectURL(file);
    });
  };

  const processMedia = (file, fileType) => {
    // Set media type
    setMediaType(fileType);
    setMedia(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeMedia = () => {
    setMedia(null);
    setMediaPreview(null);
    setMediaType(null);
    setUploadProgress(0);
    setDuration(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!text.trim() && !media) {
      alert('Please add some text or media to your post.');
      return;
    }
    
    // For reels, a video is required
    if (postType === 'reel' && (!media || mediaType !== 'video')) {
      alert('Reels require a video.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('accessToken');
      
      if (!userId || !token) {
        alert('You must be logged in to create a post.');
        setIsSubmitting(false);
        return;
      }

      let mediaUrl = null;
      
      // Upload media to Cloudinary if present
      if (media) {
        try {
          mediaUrl = await uploadMediaToCloudinary(media, postType === 'reel' ? 'reels' : 'posts', setUploadProgress, 'postMedia');
        } catch (uploadError) {
          console.error('Media upload failed:', uploadError);
          alert('Media upload failed. Please make sure Cloudinary is properly configured or try again later.');
          setIsSubmitting(false);
          return;
        }
      }
      
      // Prepare post data
      const postData = {
        text: text.trim(),
        postType: postType, // Add postType to differentiate posts and reels
        privacy: privacy,
        hashtags: hashtags,
        mentions: mentions
      };
      
      // Add aspect ratio for better display
      if (aspectRatio) {
        postData.aspectRatio = aspectRatio;
      }
      
      // Add location if provided
      if (location) {
        postData.location = location;
      }
      
      // Add scheduled time if provided
      if (scheduledTime) {
        postData.scheduledTime = scheduledTime;
      }
      
      // Add media URL based on type
      if (mediaUrl) {
        if (mediaType === 'image') {
          postData.image = mediaUrl;
        } else if (mediaType === 'video') {
          postData.video = mediaUrl;
          if (duration) {
            postData.duration = duration;
          }
        }
      }
      
      // Create post via API
      const response = await API.post(
        `/user/${userId}/post/userpost/create`,
        postData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      if (response.data.success) {
        // Reset form
        setText('');
        removeMedia();
        
        // Notify parent component if provided
        if (typeof onPostCreated === 'function') {
          onPostCreated();
        } else {
          // Navigate to profile page if no callback was provided
          navigate(`/profile/${userId}`);
        }
      } else {
        alert('Failed to create post. Please try again.');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };
  
  // Set post type based on active tab
  useEffect(() => {
    setPostType(activeTab);
    // Clear media when switching tabs
    removeMedia();
  }, [activeTab]);
  
  // Get video duration when video is loaded
  useEffect(() => {
    if (videoRef.current && mediaType === 'video') {
      videoRef.current.onloadedmetadata = () => {
        setDuration(videoRef.current.duration);
      };
    }
  }, [mediaPreview, mediaType]);

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleMultipleMedia(files);
  };

  const handleMultipleMedia = (files) => {
    const validFiles = files.filter(file => {
      const fileType = file.type.split('/')[0];
      return fileType === 'image' || fileType === 'video';
    });
    
    if (validFiles.length === 0) {
      alert('Please upload only image or video files.');
      return;
    }
    
    // For reels, only allow one video
    if (postType === 'reel') {
      const videoFiles = validFiles.filter(file => file.type.startsWith('video/'));
      if (videoFiles.length > 1) {
        alert('Reels can only contain one video.');
        return;
      }
      if (videoFiles.length === 1) {
        // Check video duration
        checkVideoDuration(videoFiles[0]).then(isValid => {
          if (isValid) {
            setMediaFiles([videoFiles[0]]);
            processMedia(videoFiles[0], 'video');
          }
        });
        return;
      }
    }
    
    // For regular posts, allow multiple media
    if (validFiles.length > 10) {
      alert('You can upload maximum 10 files at once.');
      return;
    }
    
    setMediaFiles(validFiles);
    
    // Set first file as primary media
    if (validFiles.length > 0) {
      const firstFile = validFiles[0];
      const fileType = firstFile.type.split('/')[0];
      processMedia(firstFile, fileType);
    }
  };

  const removeMediaFile = (index) => {
    const newMediaFiles = [...mediaFiles];
    newMediaFiles.splice(index, 1);
    setMediaFiles(newMediaFiles);
    
    // If we removed the primary media, set the next one as primary
    if (index === 0 && newMediaFiles.length > 0) {
      const nextFile = newMediaFiles[0];
      const fileType = nextFile.type.split('/')[0];
      processMedia(nextFile, fileType);
    } else if (index === 0 && newMediaFiles.length === 0) {
      // No more files
      setMedia(null);
      setMediaPreview(null);
      setMediaType(null);
    }
  };

  const handleMultipleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    handleMultipleMedia(files);
  };

  const moveMediaFile = (fromIndex, toIndex) => {
    const newMediaFiles = [...mediaFiles];
    const [movedFile] = newMediaFiles.splice(fromIndex, 1);
    newMediaFiles.splice(toIndex, 0, movedFile);
    setMediaFiles(newMediaFiles);
    
    // If we moved the primary media, update it
    if (fromIndex === 0 || toIndex === 0) {
      const newPrimaryFile = newMediaFiles[0];
      const fileType = newPrimaryFile.type.split('/')[0];
      processMedia(newPrimaryFile, fileType);
    }
  };

  // Add drag and drop event listeners to the upload area
  useEffect(() => {
    const uploadArea = document.querySelector('.upload-prompt');
    if (uploadArea) {
      uploadArea.addEventListener('dragover', handleDragOver);
      uploadArea.addEventListener('dragleave', handleDragLeave);
      uploadArea.addEventListener('drop', handleDrop);
      
      return () => {
        uploadArea.removeEventListener('dragover', handleDragOver);
        uploadArea.removeEventListener('dragleave', handleDragLeave);
        uploadArea.removeEventListener('drop', handleDrop);
      };
    }
  }, [postType]);

  // Keyboard navigation and accessibility
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + Enter to submit
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !isSubmitting) {
        e.preventDefault();
        if (text.trim() || mediaFiles.length > 0) {
          handleSubmit(e);
        }
      }
      
      // Escape to close
      if (e.key === 'Escape') {
        if (showMediaEditor) {
          handleMediaEditCancel();
        } else if (showPostPreview) {
          closePreview();
        } else if (onCancel) {
          onCancel();
        }
      }
      
      // Ctrl/Cmd + P for preview
      if ((e.ctrlKey || e.metaKey) && e.key === 'p' && !isSubmitting) {
        e.preventDefault();
        if (text.trim() || mediaFiles.length > 0) {
          showPreview();
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [text, mediaFiles, isSubmitting, showMediaEditor, showPostPreview]);

  // Focus management for accessibility
  const focusFirstInput = () => {
    const firstInput = document.querySelector('.post-text-input') || 
                      document.querySelector('.upload-button');
    if (firstInput) {
      firstInput.focus();
    }
  };

  // Initialize focus when component mounts
  useEffect(() => {
    focusFirstInput();
  }, []);

  // Validation feedback
  const validatePost = () => {
    const errors = [];
    
    if (!text.trim() && mediaFiles.length === 0) {
      errors.push('Post must contain text or media');
    }
    
    if (postType === 'reel' && (!media || mediaType !== 'video')) {
      errors.push('Reels require a video file');
    }
    
    if (postType === 'reel' && mediaType === 'video') {
      if (duration < 3) {
        errors.push('Reel videos must be at least 3 seconds long');
      }
      if (duration > 90) {
        errors.push('Reel videos must be no longer than 90 seconds');
      }
    }
    
    if (scheduledTime) {
      const scheduledDate = new Date(scheduledTime);
      const now = new Date();
      if (scheduledDate <= now) {
        errors.push('Scheduled time must be in the future');
      }
    }
    
    return errors;
  };

  const validationErrors = validatePost();

  return (
    <div className="create-post-container">
      <form onSubmit={handleSubmit} className="create-post-form" ref={formRef}>
        <div className="create-post-header">
          <h2>{postType === 'reel' ? 'Create Reel' : 'Create Post'}</h2>
          {onCancel && (
            <button type="button" className="cancel-button" onClick={onCancel}>
              <X size={20} />
            </button>
          )}
        </div>
        
        <div className="create-post-tabs">
          <button 
            type="button"
            className={`tab-button ${activeTab === 'post' ? 'active' : ''}`}
            onClick={() => setActiveTab('post')}
            aria-label="Switch to post creation mode"
            aria-selected={activeTab === 'post'}
            role="tab"
          >
            <Camera size={18} />
            <span>Post</span>
          </button>
          <button 
            type="button"
            className={`tab-button ${activeTab === 'reel' ? 'active' : ''}`}
            onClick={() => setActiveTab('reel')}
            aria-label="Switch to reel creation mode"
            aria-selected={activeTab === 'reel'}
            role="tab"
          >
            <Film size={18} />
            <span>Reel</span>
          </button>
        </div>
        
        <div className="create-post-content">
          {activeTab === 'reel' ? (
            <div className="reel-info">
              <span>Reels must be 3-90 seconds long</span>
            </div>
          ) : null}
        
          {mediaPreview ? (
            <div className={`media-preview-container ${postType} ${isDragOver ? 'drag-over' : ''}`}>
              {/* Primary Media Preview */}
              <div className="primary-media-preview">
                {mediaType === 'image' ? (
                  <img src={mediaPreview} alt="Preview" className={`media-preview ${aspectRatio.replace(':', '-')}`} />
                ) : (
                  <video 
                    src={mediaPreview} 
                    controls 
                    className={`media-preview ${aspectRatio.replace(':', '-')}`}
                    ref={videoRef}
                  />
                )}
                <button 
                  type="button" 
                  className="remove-media-button"
                  onClick={removeMedia}
                  disabled={isSubmitting}
                >
                  <X size={16} />
                </button>
                
                {mediaType === 'image' && (
                  <button 
                    type="button" 
                    className="edit-media-button"
                    onClick={() => openMediaEditor(media)}
                    disabled={isSubmitting}
                    title="Edit Media"
                  >
                    <Edit3 size={16} />
                  </button>
                )}
                
                {mediaType === 'video' && duration > 0 && (
                  <div className="video-duration">
                    {Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, '0')}
                  </div>
                )}
              </div>
              
              {/* Multiple Media Thumbnails */}
              {mediaFiles.length > 1 && (
                <div className="media-thumbnails">
                  <h4>Media Files ({mediaFiles.length})</h4>
                  <div className="thumbnails-container">
                    {mediaFiles.map((file, index) => (
                      <div key={index} className={`thumbnail-item ${index === 0 ? 'primary' : ''}`}>
                        <div className="thumbnail-preview">
                          {file.type.startsWith('image/') ? (
                            <img src={URL.createObjectURL(file)} alt={`Media ${index + 1}`} />
                          ) : (
                            <div className="video-thumbnail">
                              <Film size={20} />
                              <span>Video</span>
                            </div>
                          )}
                        </div>
                        <div className="thumbnail-info">
                          <span className="file-name">{file.name}</span>
                          <div className="thumbnail-actions">
                            {index > 0 && (
                              <button 
                                type="button" 
                                className="move-up-button"
                                onClick={() => moveMediaFile(index, index - 1)}
                                title="Move up"
                              >
                                ↑
                              </button>
                            )}
                            {index < mediaFiles.length - 1 && (
                              <button 
                                type="button" 
                                className="move-down-button"
                                onClick={() => moveMediaFile(index, index + 1)}
                                title="Move down"
                              >
                                ↓
                              </button>
                            )}
                            <button 
                              type="button" 
                              className="remove-thumbnail-button"
                              onClick={() => removeMediaFile(index)}
                              title="Remove"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div 
              className={`upload-prompt ${isDragOver ? 'drag-over' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="upload-icon">
                {activeTab === 'reel' ? <Film size={48} /> : <Upload size={48} />}
              </div>
              <p className="upload-text">
                {activeTab === 'reel' 
                  ? 'Upload a video for your reel' 
                  : 'Drag photos and videos here or click to upload'}
              </p>
              <p className="upload-subtext">
                {activeTab === 'reel' 
                  ? 'Supports: MP4, MOV (3-90 seconds)' 
                  : 'Supports: JPG, PNG, GIF, MP4, MOV (Max 10 files)'}
              </p>
              <label className="upload-button">
                {activeTab === 'reel' ? 'Select Video' : 'Select Media'}
                <input
                  type="file"
                  accept={activeTab === 'reel' ? "video/*" : "image/*,video/*"}
                  onChange={handleMultipleMediaChange}
                  disabled={isSubmitting}
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  multiple={activeTab !== 'reel'}
                />
              </label>
            </div>
          )}
          
          {/* Text Formatting Toolbar */}
          <div className="text-formatting-toolbar">
            <button 
              type="button" 
              className={`format-button ${textFormatting.bold ? 'active' : ''}`}
              onClick={() => applyFormatting('bold')}
              title="Bold"
              aria-label="Apply bold formatting"
              aria-pressed={textFormatting.bold}
            >
              <Bold size={16} />
            </button>
            <button 
              type="button" 
              className={`format-button ${textFormatting.italic ? 'active' : ''}`}
              onClick={() => applyFormatting('italic')}
              title="Italic"
              aria-label="Apply italic formatting"
              aria-pressed={textFormatting.italic}
            >
              <Italic size={16} />
            </button>
            <button 
              type="button" 
              className={`format-button ${textFormatting.underline ? 'active' : ''}`}
              onClick={() => applyFormatting('underline')}
              title="Underline"
              aria-label="Apply underline formatting"
              aria-pressed={textFormatting.underline}
            >
              <Underline size={16} />
            </button>
            <button 
              type="button" 
              className={`format-button ${textFormatting.link ? 'active' : ''}`}
              onClick={() => {
                const url = prompt('Enter URL:');
                if (url) applyFormatting('link', url);
              }}
              title="Add Link"
              aria-label="Add link"
              aria-pressed={textFormatting.link}
            >
              <Link size={16} />
            </button>
            <button 
              type="button" 
              className="format-button"
              onClick={() => setShowHashtagSuggestions(true)}
              title="Add Hashtag"
              aria-label="Add hashtag"
            >
              <Hash size={16} />
            </button>
          </div>
          
          <div className="text-input-container">
            <textarea
              value={text}
              onChange={handleTextChange}
              placeholder={activeTab === 'reel' ? "Write a caption for your reel..." : "What's on your mind?"}
              className="post-text-input"
              rows={4}
              disabled={isSubmitting}
              aria-describedby="text-stats"
              aria-invalid={validationErrors.some(error => error.includes('text'))}
            />
            <div className="text-stats" id="text-stats">
              <span className="word-count">
                Words: {text.trim() ? text.trim().split(/\s+/).length : 0}
              </span>
              <span className="char-count">
                Characters: {text.length}
              </span>
              {text.length > 2200 && (
                <span className="char-warning">
                  ⚠️ Approaching character limit
                </span>
              )}
            </div>
          </div>
          
          {/* Hashtag and Mention Suggestions */}
          {showHashtagSuggestions && suggestedHashtags.length > 0 && (
            <div className="suggestions-dropdown">
              <div className="suggestions-header">
                <Hash size={16} />
                <span>Suggested Hashtags</span>
              </div>
              <div className="suggestions-list">
                {suggestedHashtags.map((hashtag, index) => (
                  <button
                    key={index}
                    type="button"
                    className="suggestion-item"
                    onClick={() => handleHashtagSuggestionClick(hashtag)}
                  >
                    {hashtag}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {showMentionSuggestions && suggestedUsers.length > 0 && (
            <div className="suggestions-dropdown">
              <div className="suggestions-header">
                <Users size={16} />
                <span>Suggested Users</span>
              </div>
              <div className="suggestions-list">
                {suggestedUsers.map((user, index) => (
                  <button
                    key={index}
                    type="button"
                    className="suggestion-item"
                    onClick={() => handleMentionSuggestionClick(user.username)}
                  >
                    <img src={user.avatar || '/default-avatar.svg'} alt={user.username} />
                    <span>@{user.username}</span>
                    <span className="user-name">{user.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="validation-errors" role="alert" aria-live="assertive">
              <h4>Validation Issues:</h4>
              <ul>
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Post Info Tags */}
          {(hashtags.length > 0 || mentions.length > 0) && (
            <div className="post-info-tags">
              {hashtags.length > 0 && (
                <div className="info-section">
                  <Hash size={14} />
                  <div className="tags-list">
                    {hashtags.map((tag, index) => (
                      <span key={index} className="tag-item">{tag}</span>
                    ))}
                  </div>
                </div>
              )}
              {mentions.length > 0 && (
                <div className="info-section">
                  <Users size={14} />
                  <div className="tags-list">
                    {mentions.map((mention, index) => (
                      <span key={index} className="tag-item">{mention}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          

          
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="upload-progress">
              <div 
                className="upload-progress-bar" 
                style={{ width: `${uploadProgress}%` }}
              />
              <span className="upload-progress-text">{Math.round(uploadProgress)}%</span>
            </div>
          )}
          
          {/* Advanced Features Section */}
          <div className="advanced-features-section">
            <div className="feature-group">
              <h4><Lock size={16} /> Privacy Settings</h4>
              <div className="privacy-options">
                <label className={`privacy-option ${privacy === 'public' ? 'selected' : ''}`}>
                  <input 
                    type="radio" 
                    name="privacy" 
                    value="public" 
                    checked={privacy === 'public'}
                    onChange={(e) => setPrivacy(e.target.value)}
                  />
                  <Globe size={16} />
                  <span>Public</span>
                </label>
                <label className={`privacy-option ${privacy === 'friends' ? 'selected' : ''}`}>
                  <input 
                    type="radio" 
                    name="privacy" 
                    value="friends" 
                    checked={privacy === 'friends'}
                    onChange={(e) => setPrivacy(e.target.value)}
                  />
                  <Users size={16} />
                  <span>Friends</span>
                </label>
                <label className={`privacy-option ${privacy === 'private' ? 'selected' : ''}`}>
                  <input 
                    type="radio" 
                    name="privacy" 
                    value="private" 
                    checked={privacy === 'private'}
                    onChange={(e) => setPrivacy(e.target.value)}
                  />
                  <Lock size={16} />
                  <span>Private</span>
                </label>
              </div>
            </div>
            
            <div className="feature-group">
              <h4><MapPin size={16} /> Location</h4>
              <div className="location-input">
                <input
                  type="text"
                  placeholder="Add location"
                  value={location?.name || ''}
                  onChange={(e) => setLocation({ name: e.target.value })}
                  className="location-field"
                />
                <button 
                  type="button" 
                  className="location-button"
                  onClick={() => {
                    // Geolocation API integration
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        (position) => {
                          setLocation({
                            name: 'Current Location',
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude
                          });
                        },
                        (error) => {
                          console.error('Error getting location:', error);
                          alert('Unable to get your location');
                        }
                      );
                    }
                  }}
                >
                  <MapPin size={16} />
                </button>
              </div>
            </div>
            
            <div className="feature-group">
              <h4><Calendar size={16} /> Schedule Post</h4>
              <input
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="schedule-input"
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
          </div>
          
          {mediaType === 'image' && (
            <div className="aspect-ratio-selector">
              <span>Aspect Ratio:</span>
              <select 
                value={aspectRatio} 
                onChange={(e) => setAspectRatio(e.target.value)}
                disabled={isSubmitting}
              >
                <option value="1:1">Square (1:1)</option>
                <option value="4:5">Portrait (4:5)</option>
                <option value="16:9">Landscape (16:9)</option>
              </select>
            </div>
          )}
        </div>
        
        <div className="create-post-actions">
          {!mediaPreview && (
            <div className="media-actions">
              {activeTab === 'post' ? (
                <>
                  <label className="media-button">
                    <ImageIcon size={20} />
                    <span>Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleMediaChange}
                      disabled={isSubmitting || media !== null}
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                    />
                  </label>
                  
                  <label className="media-button">
                    <Video size={20} />
                    <span>Video</span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleMediaChange}
                      disabled={isSubmitting || media !== null}
                      style={{ display: 'none' }}
                    />
                  </label>
                </>
              ) : (
                <label className="media-button">
                  <Film size={20} />
                  <span>Video</span>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleMediaChange}
                    disabled={isSubmitting || media !== null}
                    style={{ display: 'none' }}
                  />
                </label>
              )}
            </div>
          )}
          
          <div className="action-buttons">
            <button 
              type="button" 
              className="preview-button"
              onClick={showPreview}
              disabled={isSubmitting || (!text.trim() && mediaFiles.length === 0)}
            >
              <Eye size={16} />
              Preview
            </button>
            
            <button 
              type="submit" 
              className="post-button"
              disabled={isSubmitting || 
                (!text.trim() && !media) || 
                (postType === 'reel' && (!media || mediaType !== 'video'))}
              ref={submitButtonRef}
            >
              {isSubmitting ? 'Posting...' : postType === 'reel' ? 'Share Reel' : 'Share Post'}
            </button>
          </div>
        </div>
      </form>
      
      {/* Media Editor Modal */}
      {showMediaEditor && currentEditingMedia && (
        <MediaEditor
          mediaFile={currentEditingMedia}
          mediaType={mediaType}
          onSave={handleMediaEditSave}
          onCancel={handleMediaEditCancel}
        />
      )}
      
      {/* Post Preview Modal */}
      {showPostPreview && previewData && (
        <PostPreview
          postData={previewData}
          onClose={closePreview}
        />
      )}
    </div>
  );
};

export default CreatePost; 