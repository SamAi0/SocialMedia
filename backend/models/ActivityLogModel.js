import mongoose from "mongoose";

const activitylogstruct = mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    action:{
        type:String,
        enum:['login','logout','post','comment','like','message_sent','message_received','message_read','profile_view','follow','unfollow','block','unblock','group_create','group_join','group_leave','story_create','story_view'],
        required:true
    },
    details:{
        type:String
    },
    // Additional fields for messaging activities
    targetUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    targetGroup: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group'
    },
    messageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    },
    date:{
        type:Date,
        default:Date.now
    }
})

const activitylogmodel = mongoose.model('ActivityLog',activitylogstruct)
export default activitylogmodel