# Social Media App Backend

Node.js RESTful API server for the Social Media App with real-time features, built with Express.js and MongoDB.

## 🚀 Features

### Core API Services
- **User Management** - Authentication, registration, profile management
- **Content Management** - Posts, stories, comments, reactions
- **Social Features** - Following, blocking, messaging system
- **Notifications** - Real-time alert system
- **Search Engine** - Advanced search and filtering
- **Admin Panel** - Content moderation and user management

### Advanced Services
- **Real-time Communication** - WebSocket integration with Socket.io
- **Media Processing** - Image/video upload and optimization with Cloudinary
- **Payment Integration** - Stripe and PayPal for premium features
- **Scheduled Posts** - Content scheduling with cron jobs
- **Peer-to-Peer Communication** - WebRTC video/audio calls
- **Audit Logging** - Comprehensive security and compliance logging
- **Rate Limiting** - API protection and abuse prevention

## 🛠️ Technology Stack

- **Node.js** with ES Modules
- **Express.js** - Web framework
- **MongoDB** with Mongoose ODM
- **Socket.io** - Real-time communication
- **JWT** - Authentication and authorization
- **Bcrypt** - Password hashing
- **Multer** - File upload handling
- **Cloudinary** - Media storage and processing
- **Stripe/PayPal** - Payment processing
- **Node-cron** - Task scheduling
- **Express-validator** - Input validation
- **Cors** - Cross-origin resource sharing

## 📁 Project Structure

```
backend/
├── config/          # Database and configuration files
├── controllers/     # Request handlers and business logic
├── middleware/      # Authentication and validation middleware
├── models/         # Database schemas and models
├── routes/         # API route definitions
├── services/       # Business logic and external services
├── uploads/        # Local file storage (development)
├── utils/          # Helper functions and utilities
├── .env           # Environment variables
├── server.js      # Main server entry point
└── package.json   # Dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites
- Node.js v16+
- MongoDB v4.4+
- npm or yarn

### Installation
```bash
cd backend
npm install
```

### Environment Setup
Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/socialmedia
USE_MOCK_DB=false

# Authentication
ACCESS_TOKEN_KEY=your_secret_access_key_here
REFRESH_TOKEN_KEY=your_secret_refresh_key_here

# CORS
CORS_ORIGIN=http://localhost:3000

# Cloudinary (for media)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Payment Services
STRIPE_SECRET_KEY=sk_test_your_stripe_key
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_secret

# PeerJS
PEERJS_HOST=localhost
PEERJS_PORT=9000
```

### Running the Server
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## 🧩 API Endpoints

### Authentication
```
POST /user/register        # Register new user
POST /user/login          # User login
POST /user/refresh        # Refresh access token
POST /user/logout         # User logout
```

### Users
```
GET /user/get/all         # Get all users
GET /user/profile/:id     # Get user profile
PATCH /user/update/:id    # Update user profile
DELETE /user/delete/:id   # Delete user account
GET /user/:userid/followers  # Get followers
GET /user/:userid/following  # Get following
POST /user/:userid/follow    # Follow user
POST /user/:userid/unfollow  # Unfollow user
```

### Posts
```
POST /user/:userid/post/userpost/create     # Create post
GET /user/post/get                         # Get all posts
GET /user/:userid/post/userpost/get        # Get user posts
GET /user/post/:userid/feed                # Get personalized feed
PATCH /user/:userid/post/userpost/:postid/update  # Update post
DELETE /user/:userid/post/userpost/:postid/delete # Delete post
POST /user/:userid/post/userpost/:postid/like     # Like post
POST /user/:userid/post/userpost/:postid/unlike   # Unlike post
```

### Stories
```
POST /user/story/create    # Create story
GET /user/story/feed      # Get stories feed
GET /user/story/:storyid  # Get specific story
DELETE /user/story/:storyid/delete  # Delete story
```

### Messaging
```
POST /user/:userid/receiver/:receiverid/message/send  # Send message
GET /user/:userid/:senderid/message/get              # Get messages
GET /user/:userid/messages/contacts                  # Get contacts
```

### Admin
```
GET /admin/dashboard      # Admin statistics
GET /admin/users         # Get all users
PATCH /admin/users/:userid/status  # Update user status
DELETE /admin/users/:userid        # Delete user
GET /admin/reports       # Get content reports
```

## 🔐 Security Features

- **JWT Authentication** with access and refresh tokens
- **Password Hashing** using bcrypt (12 rounds)
- **Input Validation** with express-validator
- **Rate Limiting** to prevent abuse
- **CORS Protection** for cross-origin requests
- **XSS Prevention** with proper escaping
- **Audit Logging** for all user actions
- **Activity Monitoring** for security compliance

## 🔄 Real-time Features

### Socket.io Events
```javascript
// Connection events
connection
disconnect

// Messaging
sendMessage
receiveMessage
typing
stopTyping
messageRead

// Notifications
newNotification
markNotificationRead

// Social interactions
userOnline
userOffline
newFollower
newLike
newComment

// Stories
storyViewed
storyExpired
```

## 📊 Database Models

### Core Models
- **User** - User profiles and authentication
- **Post** - User-generated content
- **Comment** - Post comments and replies
- **Like** - Content likes
- **Follow** - User relationships
- **Message** - Direct messages
- **Notification** - User alerts
- **Story** - Temporary content

### Advanced Models
- **Reaction** - Emoji reactions
- **Block** - User blocking
- **Group** - Community groups
- **Challenge** - Social challenges
- **ScheduledPost** - Future content
- **AuditLog** - Security logging
- **ActivityLog** - User activity

## 🧪 Testing

### API Testing with curl
```bash
# Health check
curl http://localhost:5000/health

# User registration
curl -X POST http://localhost:5000/user/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","username":"johndoe","email":"john@example.com","password":"password123"}'

# User login
curl -X POST http://localhost:5000/user/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

### Using Postman
Import the collection file (if available) or create requests manually for each endpoint.

## 🚢 Deployment

### Production Setup
1. Set production environment variables
2. Use MongoDB Atlas or production database
3. Configure Cloudinary for media storage
4. Set up Stripe/PayPal for payments
5. Use PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start server.js --name social-media-api
   pm2 startup
   pm2 save
   ```

### Docker Deployment
```bash
# Build Docker image
docker build -t social-media-backend .

# Run container
docker run -p 5000:5000 social-media-backend
```

## 📈 Monitoring

### Built-in Health Checks
- `/health` endpoint for server status
- Database connection monitoring
- Memory and CPU usage tracking
- Request/response time logging

### Logging
- Request logging with Morgan
- Error logging to files
- Audit trail for security events
- Performance metrics collection

## 🤝 Contributing

### Development Guidelines
- Follow RESTful API design principles
- Use consistent error handling
- Implement proper validation
- Write comprehensive documentation
- Include unit and integration tests

### Code Structure
- Controllers for request handling
- Services for business logic
- Models for data operations
- Middleware for cross-cutting concerns

## 🐛 Troubleshooting

### Common Issues
- **Database Connection**: Verify MongoDB is running and connection string is correct
- **CORS Errors**: Check CORS_ORIGIN configuration
- **Authentication Failures**: Verify JWT keys and token format
- **File Upload Issues**: Check Cloudinary configuration and file size limits

### Debugging Tools
- **MongoDB Compass** for database inspection
- **Postman** for API testing
- **Log files** in logs/ directory
- **Node.js debugger** for code inspection

## 📄 License

This project is part of the Social Media App and follows the same MIT License.

## 🙏 Acknowledgments

- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Socket.io](https://socket.io/)
- [Mongoose](https://mongoosejs.com/)
- [JWT](https://jwt.io/)
- [Cloudinary](https://cloudinary.com/)