// utils/MediaUploadService.js
// Updated to use Cloudinary instead of Firebase
import { uploadToCloudinary, uploadVideoToCloudinary } from './CloudinaryUpload';

/**
 * Checks if Cloudinary is properly configured
 */
export const isCloudinaryConfigured = () => {
    const cloudinaryUrl = process.env.REACT_APP_CLOUDINARY_URL;
    if (!cloudinaryUrl) {
        console.error('Cloudinary URL is not set in environment variables');
        return false;
    }
    
    // Validate Cloudinary URL format
    if (!cloudinaryUrl.match(/^cloudinary:\/\/[\d\w]+:[\d\w\-_.@]+@[\d\w]+$/)) {
        console.error('Invalid Cloudinary URL format');
        console.error('Expected format: cloudinary://apiKey:apiSecret@cloudName');
        console.error('Actual format:', cloudinaryUrl);
        return false;
    }
    
    console.log('Cloudinary is properly configured');
    return true;
};

/**
 * Test function to verify Cloudinary configuration
 */
export const testCloudinaryConnection = async () => {
    try {
        if (!isCloudinaryConfigured()) {
            return { success: false, message: 'Cloudinary is not properly configured' };
        }
        
        // Parse Cloudinary URL to extract cloud name
        const cloudinaryUrl = process.env.REACT_APP_CLOUDINARY_URL;
        const urlParts = cloudinaryUrl.match(/cloudinary:\/\/[\d\w]+:[\d\w\-_.@]+@([\d\w]+)/);
        if (!urlParts || urlParts.length < 2) {
            return { success: false, message: 'Could not parse Cloudinary URL' };
        }
        const cloudName = urlParts[1];
        
        // Test the connection by attempting to ping Cloudinary
        // (We'll make a simple API call to get account info)
        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/ping`, {
            method: 'GET'
        });
        
        if (response.ok) {
            return { success: true, message: 'Cloudinary connection successful' };
        } else {
            return { success: false, message: `Cloudinary connection failed: ${response.statusText}` };
        }
    } catch (error) {
        console.error('Error testing Cloudinary connection:', error);
        return { success: false, message: `Error testing connection: ${error.message}` };
    }
};

/**
 * Uploads a file to Cloudinary and returns the public download URL.
 * @param {File} file - The file to upload.
 * @param {string} folder - The folder path in Cloudinary (e.g., 'stories/' or 'posts/').
 * @param {function} setProgress - State setter function (0-100) for tracking upload progress.
 * @returns {Promise<string>} The public URL of the uploaded file.
 */
export const uploadMediaToCloudinary = (file, folder, setProgress, uploadType = 'avatar') => {
    return new Promise(async (resolve, reject) => {
        if (!file) {
            return reject(new Error("No media file provided."));
        }
        
        // Check if Cloudinary is configured
        if (!isCloudinaryConfigured()) {
            console.warn('Cloudinary not configured. Using backend upload service as fallback.');
            
            // Fallback: Use backend upload service to avoid large base64 payload
            const token = localStorage.getItem('accessToken');
            if (!token) {
                reject(new Error('User not authenticated'));
                return;
            }
            
            const formData = new FormData();
            formData.append(uploadType, file); // Use the specified field name
            
            fetch('/api/upload', { // Changed from hardcoded localhost to relative path
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success && data.filePath) {
                    resolve(data.filePath); // Return the file path from backend
                } else {
                    reject(new Error(data.message || 'Upload failed'));
                }
            })
            .catch(error => {
                console.error('Backend upload failed:', error);
                // As final fallback, convert to base64
                console.warn('Backend upload failed, using base64 fallback');
                const reader = new FileReader();
                reader.onload = () => {
                  resolve(reader.result);
                };
                reader.onerror = (readerError) => {
                  console.error('Error reading file:', readerError);
                  reject(readerError);
                };
                reader.readAsDataURL(file);
            });
            return;
        }
        
        try {
            // Determine if it's an image or video
            const isVideo = file.type.startsWith('video/');
            
            if (isVideo) {
                const downloadURL = await uploadVideoToCloudinary(file, folder, setProgress);
                resolve(downloadURL);
            } else {
                const downloadURL = await uploadToCloudinary(file, folder, setProgress);
                resolve(downloadURL);
            }
        } catch (error) {
            console.error('Error uploading file to Cloudinary:', error);
            reject(new Error(`Cloudinary upload failed: ${error.message}`));
        }
    });
};

// Function is already exported as default export above
