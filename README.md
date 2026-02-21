# Social Media App

A full-stack social media application built with React, Node.js, Express, and MongoDB with advanced real-time features and modern web technologies.

## 🚀 Features

### Core Social Features
- **User Authentication**: Secure registration and login with JWT
- **Post Creation**: Share text, images, and videos with rich media support
- **Social Interactions**: Follow, like, comment, and react to posts with emoji reactions
- **Real-time Messaging**: Instant messaging with typing indicators, read receipts, and online status
- **Stories**: Share temporary content like Instagram Stories with AR filters and templates
- **Notifications**: Real-time notifications for all interactions with enhanced notification system
- **Search**: Advanced search for users, posts, and hashtags with autocomplete
- **Profiles**: Customizable user profiles with themes and personalization
- **Saved Posts**: Bookmark and organize favorite content
- **Blocking**: Control who can interact with you with comprehensive blocking system
- **Trending Hashtags**: Discover popular topics and trending content

### Advanced Messaging Features
- **One-on-One & Group Chats**: Private and group conversations with multiple participants
- **Vanishing Mode**: Temporary chats where messages disappear after being viewed
- **View-Once Media**: Photos and videos that disappear after being viewed
- **Message Reactions**: React to messages with emojis (❤️, 👍, 😂, etc.)
- **Quoted Replies**: Reply to specific messages within chat threads
- **Voice & Video Messages**: Send audio and video messages
- **Media Sharing**: Share images, videos, and files with preview
- **Message Mentions**: Tag users with @username for notifications
- **Spam Filtering**: Report and filter spam messages
- **Read Receipts**: See when messages are delivered and read
- **Typing Indicators**: Real-time typing status
- **Online Status**: See when contacts are online
- **Chat Colors**: Custom message bubble colors
- **Message Timestamps**: Track when messages were sent
- **Group Admin Controls**: Manage group members and permissions
- **Message Search**: Search through conversation history
- **Activity Feed**: Track interactions like likes, comments, and shares

### Other Advanced Features
- **Admin Panel**: Complete admin dashboard for user management and content moderation
- **Scheduled Posts**: Plan and schedule content for future publication
- **Collaborative Spaces**: Real-time collaborative content creation with multiple users
- **AR Filters**: Augmented reality filters for stories and posts using TensorFlow.js
- **Story Templates**: Professional templates for creating engaging stories
- **Story Layout Editor**: Custom layout design for stories with drag-and-drop interface
- **Challenges System**: Community challenges and engagement features
- **Groups**: Create and join community groups
- **Peer-to-Peer Communication**: Direct P2P video/audio calls using WebRTC
- **Payment Integration**: Stripe and PayPal integration for premium features
- **Cloud Storage**: Cloudinary integration for media management
- **Audit Logging**: Comprehensive activity logging for security and compliance

## 🛠️ Tech Stack

### Frontend
- **React 18** with Hooks and Context API
- **Material-UI** for modern UI components
- **React Router** for client-side routing
- **Axios** for HTTP requests
- **Socket.io-client** for real-time communication
- **TensorFlow.js** for machine learning and AR features
- **PeerJS** for WebRTC peer-to-peer communication
- **Firebase** for additional services
- **Bootstrap 5** for responsive design
- **Lucide React** for beautiful icons

### Backend
- **Node.js** with ES Modules
- **Express.js** for RESTful API
- **MongoDB** with Mongoose ODM
- **Socket.io** for real-time features
- **JWT** for authentication
- **Bcrypt** for password hashing
- **Multer** for file uploads
- **Cloudinary** for media storage
- **Stripe & PayPal** for payment processing
- **Node-cron** for scheduled tasks

## 📋 Prerequisites

- **Node.js** (v16 or higher recommended)
- **MongoDB** (local installation v4.4+ or MongoDB Atlas)
- **npm** or **yarn** package manager
- **Git** for version control
- **Modern web browser** (Chrome, Firefox, Edge, Safari)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Social_Media_App
```

### 2. Install Dependencies

Install all dependencies for both frontend and backend:

```bash
npm run install
```

Or install manually:

#### Backend:
```bash
cd backend
npm install
```

#### Frontend:
```bash
cd apk
npm install
```

### 3. Environment Configuration

#### Backend Configuration (.env):
Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGO_URI=mongodb://localhost:27017/socialmedia
# Or for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/socialmedia

# Authentication Keys (Generate strong random strings)
ACCESS_TOKEN_KEY=your_super_secret_access_token_key_here_make_it_long_and_random_at_least_32_characters
REFRESH_TOKEN_KEY=your_super_secret_refresh_token_key_here_make_it_long_and_random_at_least_32_characters

# Database Mode
USE_MOCK_DB=false  # Set to true for development without MongoDB

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# Cloudinary Configuration (for media uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Payment Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret

# PeerJS Configuration
PEERJS_HOST=localhost
PEERJS_PORT=9000
```

#### Frontend Configuration (.env):
Create a `.env` file in the `apk` directory:

```env
# API Configuration
REACT_APP_API_BASE_URL=http://localhost:5000
REACT_APP_WS_PORT=5000

# Cloudinary Configuration
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=your_upload_preset

# Payment Configuration
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
REACT_APP_PAYPAL_CLIENT_ID=your_paypal_client_id
```

### 4. Run the Application

#### Method 1: Using the startup script (Windows)
```bash
# Double-click start_app.bat or run in command prompt
start_app.bat
```

#### Method 2: Using npm scripts
```bash
# Run both frontend and backend simultaneously
npm start

# Run only backend
npm run backend-only

# Run only frontend
npm run frontend-only
```

#### Method 3: Manual startup
Start backend server:
```bash
cd backend
npm run dev
```

Start frontend server:
```bash
cd apk
npm start
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Backend Health Check**: http://localhost:5000/health
- **Socket.io**: ws://localhost:5000

## 🧩 API Endpoints

### Authentication
- `POST /user/register` - Register a new user
- `POST /user/login` - Login to existing account
- `POST /user/refresh` - Refresh access token
- `POST /user/logout` - Logout user

### Users
- `GET /user/get/all` - Get all users
- `GET /user/profile/:id` - Get user profile
- `PATCH /user/update/:id` - Update user profile
- `DELETE /user/delete/:id` - Delete user account
- `GET /user/:userid/followers` - Get user's followers
- `GET /user/:userid/following` - Get user's following
- `POST /user/:userid/follow` - Follow a user
- `POST /user/:userid/unfollow` - Unfollow a user

### Posts
- `POST /user/:userid/post/userpost/create` - Create a new post
- `GET /user/post/get` - Get all posts
- `GET /user/:userid/post/userpost/get` - Get user's posts
- `GET /user/post/:userid/feed` - Get user's personalized feed
- `PATCH /user/:userid/post/userpost/:postid/update` - Update a post
- `DELETE /user/:userid/post/userpost/:postid/delete` - Delete a post
- `POST /user/:userid/post/userpost/:postid/like` - Like a post
- `POST /user/:userid/post/userpost/:postid/unlike` - Unlike a post
- `POST /user/:userid/post/userpost/:postid/comment/add` - Add comment to post
- `DELETE /user/:userid/post/userpost/:postid/comment/:commentid/delete` - Delete comment

### Stories
- `POST /user/story/create` - Create a story
- `GET /user/story/feed` - Get stories from people you follow
- `GET /user/story/:storyid` - Get specific story
- `DELETE /user/story/:storyid/delete` - Delete story
- `POST /user/story/:storyid/view` - Mark story as viewed

### Messaging
- `POST /user/:userid/receiver/:receiverid/message/send` - Send a message
- `GET /user/:userid/:senderid/message/get` - Get direct messages
- `GET /user/:userid/messages/contacts` - Get message contacts
- `POST /user/:userid/conversation/:conversationid/read` - Mark conversation as read

### Notifications
- `GET /user/:userid/notifications` - Get user notifications
- `POST /user/:userid/notifications/mark-read` - Mark notifications as read
- `DELETE /user/:userid/notifications/:notificationid` - Delete notification

### Admin
- `GET /admin/dashboard` - Admin dashboard statistics
- `GET /admin/users` - Get all users (admin only)
- `PATCH /admin/users/:userid/status` - Update user status (admin only)
- `DELETE /admin/users/:userid` - Delete user (admin only)
- `GET /admin/reports` - Get content reports (admin only)

### Search
- `GET /search/users?q=query` - Search users
- `GET /search/posts?q=query` - Search posts
- `GET /search/hashtags?q=query` - Search hashtags

## 🔐 Security Features

- **JWT-based authentication** with access and refresh tokens
- **Input validation** and sanitization using express-validator
- **Password hashing** with bcrypt (12 rounds)
- **CORS configuration** for secure cross-origin requests
- **Rate limiting** to prevent abuse
- **SQL injection prevention** through MongoDB with Mongoose
- **XSS protection** with proper escaping
- **CSRF protection** for forms
- **Content Security Policy** headers
- **Audit logging** for all user actions
- **Activity logging** for security monitoring

## 💾 Database Models

The application uses comprehensive MongoDB collections:

### Core Models
- **Users** - User profiles, authentication, and settings
- **Posts** - User-generated content with media support
- **Comments** - Post comments with nested replies
- **Likes** - Post and comment likes
- **Followers/Following** - User relationship management
- **Messages** - Direct messaging between users
- **Notifications** - User notifications and alerts
- **Stories** - Temporary content with expiration
- **Hashtags** - Content tagging and discovery

### Advanced Models
- **Reactions** - Emoji reactions to posts and comments
- **SavedPosts** - User bookmarked content
- **Blocks** - User blocking functionality
- **Groups** - Community groups and discussions
- **Challenges** - Community challenges and achievements
- **ScheduledPosts** - Future content scheduling
- **AuditLogs** - Security and compliance logging
- **ActivityLogs** - User activity tracking
- **StoryLayouts** - Custom story templates
- **EditingSessions** - Collaborative editing sessions
- **Conversations** - Message thread management
- **Products** - E-commerce integration
- **Causes** - Social cause campaigns

## 🔌 Real-time Features

The application leverages Socket.io for comprehensive real-time communication:

### Messaging System
- **Live messaging** with instant delivery
- **Typing indicators** to show when users are typing
- **Read receipts** to confirm message delivery
- **Online presence** indicators
- **Message status** (sent, delivered, read)

### Social Interactions
- **Real-time notifications** for likes, comments, follows
- **Live feed updates** when new content is posted
- **Story view tracking** with real-time counters
- **User status updates** (online/offline)

### Collaborative Features
- **Real-time editing** in collaborative spaces
- **Peer-to-peer communication** for video/audio calls
- **Live reaction updates** on posts
- **Concurrent user tracking** in shared spaces

## 🎨 Customization & Personalization

### Themes & Appearance
- **Custom themes** with color scheme selection
- **Dark/light mode** toggle
- **Profile customization** with banners and avatars
- **Layout preferences** for feed organization

### Privacy & Controls
- **Privacy settings** for profile visibility
- **Content visibility controls** (public, followers, private)
- **Blocking system** with comprehensive controls
- **Activity status** management (online/offline)

### Content Organization
- **Saved posts** with custom collections
- **Hashtag following** for personalized discovery
- **Content filtering** options
- **Feed customization** preferences

## 🧪 Testing & Development

### API Testing
Test the API endpoints using Postman, curl, or your preferred tool:

```bash
# Test health endpoint
curl http://localhost:5000/health

# Test registration
curl -X POST http://localhost:5000/user/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","username":"testuser","email":"test@example.com","password":"password123"}'

# Test login
curl -X POST http://localhost:5000/user/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Test with authentication
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5000/user/profile/USER_ID
```

### Development Scripts
```bash
# Run development servers
npm start

# Run tests (when implemented)
npm test

# Build for production
npm run build

# Lint code (when configured)
npm run lint
```

## 🚢 Deployment

### Production Environment Setup

#### Backend Deployment
1. Set production environment variables
2. Use MongoDB Atlas or production MongoDB instance
3. Configure Cloudinary for media storage
4. Set up Stripe/PayPal for payments
5. Use PM2 or similar process manager:
   ```bash
   npm install -g pm2
   pm2 start backend/server.js --name social-media-api
   pm2 startup
   pm2 save
   ```

#### Frontend Deployment
1. Build the React application:
   ```bash
   cd apk
   npm run build
   ```
2. Serve static files with Nginx, Apache, or cloud services:
   - **Netlify**: Drag and drop the build folder
   - **Vercel**: Connect GitHub repository
   - **AWS S3**: Upload build files to S3 bucket
   - **Firebase Hosting**: `firebase deploy`

### Docker Deployment
The project includes Docker configuration:

```bash
# Build and run with Docker Compose
docker-compose up --build

# Build individual services
docker build -t social-media-frontend ./apk
docker build -t social-media-backend ./backend

# Run containers
docker run -p 3000:3000 social-media-frontend
docker run -p 5000:5000 social-media-backend
```

## 📊 Monitoring & Analytics

### Built-in Monitoring
- **Health checks** at `/health` endpoint
- **Request logging** and response times
- **Error tracking** and reporting
- **Database connection monitoring**

### Performance Optimization
- **Database indexing** for fast queries
- **Caching strategies** for frequently accessed data
- **Image optimization** with Cloudinary
- **Code splitting** for faster loading
- **Lazy loading** for components

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes** with clear, descriptive commits
4. **Follow the coding standards** (ESLint, Prettier)
5. **Write tests** for new functionality
6. **Submit a Pull Request** with detailed description

### Development Guidelines
- Follow the existing code style and patterns
- Write meaningful commit messages
- Include documentation for new features
- Test thoroughly before submitting
- Keep PRs focused on single features

## 🐛 Troubleshooting

### Common Issues and Solutions

#### Database Connection Issues
```bash
# Check if MongoDB is running
mongod --version

# For MongoDB Atlas, verify connection string
# Ensure IP whitelist includes your IP address
```

#### Environment Variables
- Verify all required environment variables are set
- Check for typos in variable names
- Ensure proper escaping of special characters

#### CORS Errors
- Confirm CORS_ORIGIN matches your frontend URL
- Check for trailing slashes in URLs
- Verify both frontend and backend are running

#### Authentication Issues
- Check JWT token expiration settings
- Verify token format in Authorization header
- Confirm user credentials are correct

### Debugging Tools
- **Browser DevTools** for frontend debugging
- **Postman** for API testing
- **MongoDB Compass** for database inspection
- **Log files** in backend/logs directory
- **React DevTools** browser extension

### Getting Help
1. Check existing GitHub issues
2. Review documentation and examples
3. Create a detailed issue with:
   - Error messages
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, Node version, etc.)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support & Contact

For support, questions, or feedback:
- **GitHub Issues**: Create an issue for bugs or feature requests
- **Email**: [your-email@example.com]
- **Documentation**: Check the [wiki](link-to-wiki) for detailed guides

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - Frontend library
- [Node.js](https://nodejs.org/) - Backend runtime
- [MongoDB](https://www.mongodb.com/) - Database
- [Socket.io](https://socket.io/) - Real-time communication
- [Material-UI](https://mui.com/) - UI components
- [TensorFlow.js](https://www.tensorflow.org/js) - Machine learning
- [Cloudinary](https://cloudinary.com/) - Media management
- [Stripe](https://stripe.com/) - Payment processing