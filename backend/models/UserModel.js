import mongoose from "mongoose";

const userstruct = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    username: {
        type: String,
        unique: true,
        sparse: true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    avatar:{
        type:String
    },
    coverPhoto: {
        type: String
    },
    bio:{
        type:String
    },
    // NEW: Advanced profile features
    theme: {
        primaryColor: {
            type: String,
            default: '#405DE6'
        },
        secondaryColor: {
            type: String,
            default: '#5851DB'
        },
        layout: {
            type: String,
            enum: ['classic', 'modern', 'minimal'],
            default: 'classic'
        }
    },
    privacySettings: {
        profileVisibility: {
            type: String,
            enum: ['public', 'followers', 'private'],
            default: 'public'
        },
        activityStatus: {
            type: String,
            enum: ['online', 'offline', 'away'],
            default: 'online'
        },
        showOnlineStatus: {
            type: Boolean,
            default: true
        }
    },
    lifeEvents: [{
        title: String,
        description: String,
        date: Date,
        mediaUrl: String
    }],
    analytics: {
        profileViews: {
            type: Number,
            default: 0
        },
        postEngagement: {
            type: Number,
            default: 0
        },
        followersGrowth: {
            type: Number,
            default: 0
        }
    },
    accountType: {
        type: String,
        enum: ['personal', 'business'],
        default: 'personal'
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    followers:[{type:mongoose.Schema.Types.ObjectId,ref:'User'}],
    following:[{type:mongoose.Schema.Types.ObjectId,ref:'User'}],
    date:{
        type:Date,
        default:Date.now
    },
    // Multi-account management
    linkedAccounts: [{
        accountId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        relationship: {
            type: String,
            enum: ['personal', 'business', 'brand'],
            default: 'personal'
        },
        isActive: {
            type: Boolean,
            default: true
        }
    }],
    // AI preferences for content suggestions
    aiPreferences: {
        contentCategories: [String],
        preferredTimes: [String],
        engagementHistory: [{
            postId: mongoose.Schema.Types.ObjectId,
            interactionType: String,
            timestamp: Date
        }]
    },
    // Virtual meetup preferences
    meetupPreferences: {
        interests: [String],
        availability: [String],
        preferredActivities: [String]
    }
})

// Index for efficient searching
userstruct.index({ username: 1, name: 1 });

const usermodel = mongoose.model('User',userstruct)
export default usermodel