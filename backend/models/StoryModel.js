import mongoose from 'mongoose';
const storySchema = new mongoose.Schema({
    // Reference to the User who created the story
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true,
    },
    // URL for the image or video file
    mediaUrl: {
        type: String,
        required: true,
    },
    // Type of media: 'image' or 'video'
    mediaType: {
        type: String,
        enum: ['image', 'video'],
        required: false,
    },
    caption: {
        type: String,
        maxlength: 2200, 
        default: '',
    },
    // Highlight information
    highlight: {
        name: {
            type: String,
            trim: true
        },
        // Position in the highlight collection
        position: {
            type: Number,
            default: 0
        }
    },
    views: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    // REMOVE the expires field from here
    // Let the query handle the 24/48 hour logic
    createdAt: {
        type: Date,
        default: Date.now,
        // REMOVE: expires: 60 * 60 * 24, 
    },
    // Custom layout reference for advanced story features
    layoutId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StoryLayout'
    },
    // Multiple media sections for complex layouts
    mediaSections: [{
        type: {
            type: String,
            enum: ['image', 'video', 'text', 'poll', 'link']
        },
        url: String,
        content: String,
        position: {
            x: Number,
            y: Number
        },
        size: {
            width: Number,
            height: Number
        }
    }],
}, { 
    timestamps: true 
});

// If you want automatic cleanup after 24 hours, add this instead:
storySchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 }); // 24 hours

const Story = mongoose.model('Story', storySchema);
export default Story;