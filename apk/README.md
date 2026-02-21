# Social Media App Frontend

This is the React frontend for the Social Media App, built with modern web technologies and featuring a rich user experience.

## 🌟 Features

### User Interface
- **Modern Material-UI Design** - Clean, responsive interface
- **Real-time Updates** - Live notifications and messaging
- **Dark/Light Theme** - User preference toggle
- **Responsive Layout** - Works on all device sizes
- **Smooth Animations** - Enhanced user experience

### Social Features
- **Interactive Feed** - Personalized content discovery
- **Rich Media Posts** - Support for images, videos, and text
- **Story Creation** - Instagram-like stories with AR filters
- **Real-time Messaging** - Instant chat with typing indicators
- **Notification Center** - Comprehensive alert system
- **User Profiles** - Customizable profiles with themes

### Advanced Components
- **AR Filters** - TensorFlow.js powered augmented reality
- **Story Templates** - Professional design templates
- **Layout Editor** - Drag-and-drop story design
- **Reaction System** - Emoji reactions to content
- **Search & Discovery** - Advanced search with autocomplete
- **Admin Panel** - Content moderation dashboard

## 🛠️ Technology Stack

- **React 18** - Latest React features and hooks
- **Material-UI** - Professional UI component library
- **React Router** - Client-side routing
- **Axios** - HTTP client for API communication
- **Socket.io-client** - Real-time WebSocket connections
- **TensorFlow.js** - Machine learning for AR features
- **PeerJS** - WebRTC peer-to-peer communication
- **Firebase** - Additional services and authentication
- **Bootstrap 5** - Responsive grid system
- **Lucide React** - Beautiful SVG icons

## 🚀 Available Scripts

In the project directory, you can run:

### `npm start`
Runs the app in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`
Launches the test runner in interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`
Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`
**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## 📁 Project Structure

```
src/
├── assets/          # Images, logos, and static files
├── components/      # Reusable UI components
├── context/         # React context providers
├── pages/          # Page components
├── styles/         # CSS and styling files
├── utils/          # Helper functions and utilities
├── App.js          # Main application component
├── index.js        # Entry point
└── routes/         # Routing configuration
```

## 🎨 Customization

### Themes
The application supports theme customization through:
- Color scheme preferences
- Dark/light mode toggle
- Custom CSS variables
- Material-UI theme overrides

### Components
All components are built with reusability in mind:
- Consistent design patterns
- Proper prop typing
- Accessibility compliance
- Responsive design

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deployment Options
- **Netlify**: Drag and drop the build folder
- **Vercel**: Connect to GitHub repository
- **AWS S3**: Upload build files to S3
- **Firebase Hosting**: `firebase deploy`
- **Traditional Hosting**: Upload build folder to web server

### Environment Variables
Create a `.env` file in the project root:
```env
REACT_APP_API_BASE_URL=http://localhost:5000
REACT_APP_WS_PORT=5000
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name
REACT_APP_STRIPE_PUBLISHABLE_KEY=your_stripe_key
```

## 🐛 Troubleshooting

### Common Issues
- **Blank screen**: Check browser console for errors
- **API connection**: Verify backend is running and CORS is configured
- **Build errors**: Clear node_modules and reinstall dependencies
- **Performance**: Use React DevTools to identify bottlenecks

### Development Tools
- **React DevTools** browser extension
- **Redux DevTools** (if using Redux)
- **Chrome DevTools** performance tab
- **Network tab** for API debugging

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Make changes with clear commit messages
4. Test thoroughly
5. Submit pull request

## 📄 License

This project is part of the Social Media App and follows the same MIT License.

## 🙏 Acknowledgments

- [Create React App](https://github.com/facebook/create-react-app)
- [Material-UI](https://mui.com/)
- [React Router](https://reactrouter.com/)
- [Socket.io](https://socket.io/)
- [TensorFlow.js](https://www.tensorflow.org/js)
