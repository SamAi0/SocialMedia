import axios from 'axios';

/**
 * Uploads a file to Cloudinary and returns the public URL
 * @param {File} file - The file to upload
 * @param {string} folder - The folder path in Cloudinary (e.g., 'posts', 'reels', 'avatars')
 * @param {function} setProgress - Optional progress callback function
 * @returns {Promise<string>} The public URL of the uploaded file
 */
export const uploadToCloudinary = async (file, folder = 'general', setProgress = null) => {
  try {
    // Check if Cloudinary URL is configured
    const cloudinaryUrl = process.env.REACT_APP_CLOUDINARY_URL;
    if (!cloudinaryUrl) {
      throw new Error('Cloudinary URL is not configured in environment variables');
    }

    // Validate Cloudinary URL format
    if (!cloudinaryUrl.match(/^cloudinary:\/\/[\d\w]+:[\d\w\-_\.\@]+@[\d\w]+$/)) {
      throw new Error('Invalid Cloudinary URL format. Expected: cloudinary://apiKey:apiSecret@cloudName');
    }

    // Parse Cloudinary URL to extract cloud name and API key
    const urlParts = cloudinaryUrl.match(/cloudinary:\/\/([\d\w]+):[\d\w\-_\.\@]+@([\d\w]+)/);
    if (!urlParts || urlParts.length < 3) {
      throw new Error('Invalid Cloudinary URL format');
    }
    const apiKey = urlParts[1];
    const cloudName = urlParts[2];
    
    // Create form data for upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', apiKey); // Use API key for authentication
    formData.append('folder', folder);

    // Cloudinary upload URL
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    // Upload with progress tracking
    const response = await axios.post(uploadUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (setProgress) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(progress);
        }
      },
      timeout: 60000, // 60 seconds timeout
    });
    
    // Validate response
    if (!response.data || !response.data.secure_url) {
      throw new Error('Upload succeeded but no secure URL was returned');
    }

    return response.data.secure_url; // Return the secure URL
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

/**
 * Uploads a video file to Cloudinary
 * @param {File} file - The video file to upload
 * @param {string} folder - The folder path in Cloudinary
 * @param {function} setProgress - Optional progress callback function
 * @returns {Promise<string>} The public URL of the uploaded video
 */
export const uploadVideoToCloudinary = async (file, folder = 'videos', setProgress = null) => {
  try {
    // Check if Cloudinary URL is configured
    const cloudinaryUrl = process.env.REACT_APP_CLOUDINARY_URL;
    if (!cloudinaryUrl) {
      throw new Error('Cloudinary URL is not configured in environment variables');
    }

    // Validate Cloudinary URL format
    if (!cloudinaryUrl.match(/^cloudinary:\/\/[\d\w]+:[\d\w\-_\.\@]+@[\d\w]+$/)) {
      throw new Error('Invalid Cloudinary URL format. Expected: cloudinary://apiKey:apiSecret@cloudName');
    }

    // Parse Cloudinary URL to extract cloud name and API key
    const urlParts = cloudinaryUrl.match(/cloudinary:\/\/([\d\w]+):[\d\w\-_\.\@]+@([\d\w]+)/);
    if (!urlParts || urlParts.length < 3) {
      throw new Error('Invalid Cloudinary URL format');
    }
    const apiKey = urlParts[1];
    const cloudName = urlParts[2];
    
    // Create form data for upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', apiKey); // Use API key for authentication
    formData.append('folder', folder);
    formData.append('resource_type', 'video'); // Specify resource type as video

    // Cloudinary upload URL for videos
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`;

    // Upload with progress tracking
    const response = await axios.post(uploadUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (setProgress) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(progress);
        }
      },
      timeout: 120000, // 120 seconds timeout for videos
    });
    
    // Validate response
    if (!response.data || !response.data.secure_url) {
      throw new Error('Video upload succeeded but no secure URL was returned');
    }

    return response.data.secure_url; // Return the secure URL
  } catch (error) {
    console.error('Error uploading video to Cloudinary:', error);
    throw error;
  }
};