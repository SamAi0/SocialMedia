/**
 * Setup script to help configure environment variables
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('Setting up environment variables for Social Media App...\n');

// Function to generate a random secret key
function generateSecret() {
    return crypto.randomBytes(64).toString('hex');
}

// Backend .env file content
const backendEnvContent = `# Server Configuration
PORT=5000

# Database Configuration
# For local MongoDB:
MONGO_URI=mongodb://localhost:27017/socialmedia
# For MongoDB Atlas (cloud), uncomment and use the line below:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/socialmedia?retryWrites=true&w=majority

# Security Keys
ACCESS_TOKEN_KEY=${generateSecret()}
REFRESH_TOKEN_KEY=${generateSecret()}

# Application Settings
USE_MOCK_DB=false
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:3001,http://localhost:5000
`;

// Frontend .env file content
const frontendEnvContent = `# API Configuration
REACT_APP_API_BASE_URL=http://localhost:5000

# WebSocket Configuration
REACT_APP_WS_PORT=5000
`;

// Create backend .env if it doesn't exist
const backendEnvPath = path.join(__dirname, 'backend', '.env');
if (!fs.existsSync(backendEnvPath)) {
    fs.writeFileSync(backendEnvPath, backendEnvContent);
    console.log('✅ Created backend/.env file with secure keys');
} else {
    console.log('⚠️  backend/.env file already exists, skipping creation');
}

// Create frontend .env if it doesn't exist
const frontendEnvPath = path.join(__dirname, 'apk', '.env');
if (!fs.existsSync(frontendEnvPath)) {
    fs.writeFileSync(frontendEnvPath, frontendEnvContent);
    console.log('✅ Created apk/.env file');
} else {
    console.log('⚠️  apk/.env file already exists, skipping creation');
}

console.log('\n📋 Setup complete!');
console.log('\nNext steps:');
console.log('1. Review the generated .env files and customize if needed');
console.log('2. Make sure MongoDB is running on your system');
console.log('3. Run "npm install" in both backend and frontend directories');
console.log('4. Start the application with "npm run dev" from the root directory');
console.log('\n💡 Tip: For production, make sure to use strong, unique keys for ACCESS_TOKEN_KEY and REFRESH_TOKEN_KEY');