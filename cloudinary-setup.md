# Cloudinary Setup Instructions

To properly configure Cloudinary for media uploads in this social media app, follow these steps:

## 1. Sign Up for Cloudinary
- Go to [Cloudinary Console](https://cloudinary.com/users/register)
- Create a free account or sign in if you already have one

## 2. Get Your Cloudinary Credentials
- Once logged in, go to your dashboard
- Note down your:
  - Cloud name
  - API Key
  - API Secret

## 3. Update Environment Variables
- In the `apk/.env` file, update the Cloudinary URL with your credentials:
  ```
  REACT_APP_CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME
  ```

## 4. No Additional Configuration Needed
- The application is configured to use your Cloudinary account directly with API key authentication
- No upload presets are required

## 6. Restart the Application
- After updating the environment variables, restart your development server:
  ```bash
  npm start
  ```

## Troubleshooting
- If uploads fail, check that your Cloudinary URL is properly formatted
- Ensure your Cloudinary account has the necessary permissions for image/video uploads
- Check browser console for any error messages during upload

## Free Tier Limitations
- The Cloudinary free tier includes 25/month video transformation minutes and 25/month image transformation units
- For heavy usage, consider upgrading to a paid plan