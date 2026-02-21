import mongoose from "mongoose";

const poststruct = mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    text:{
        type:String,
        required:true
    },
    image:{
        type:String
    },
    video:{
        type:String
    },
    postType:{
        type:String,
        enum: ['post', 'reel'],
        default: 'post'
    },
    likes: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    comments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}],
    date:{
        type:Date,
        default:Date.now
    },
    // Reaction counts for different reaction types
    reactionCounts: {
        like: { type: Number, default: 0 },
        love: { type: Number, default: 0 },
        haha: { type: Number, default: 0 },
        wow: { type: Number, default: 0 },
        sad: { type: Number, default: 0 },
        angry: { type: Number, default: 0 }
    },
    // Hashtags for better discoverability
    hashtags: [String],
    // Location information
    location: {
        name: String,
        latitude: Number,
        longitude: Number
    },
    // Scheduled post reference
    scheduledPostId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ScheduledPost'
    }
})

const postmodel = mongoose.model('Post',poststruct)
export default postmodel