import mongoose from "mongoose";

const notificationstruct  = mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required: true
    },
    type:{
        type:String,
        enum: ['like','comment','follow','message','mention','tag','story_reply','group_invite','event_reminder','system'],
        required:true
    },
    post:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Post'
    },
    fromUser:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    message:{
        type:String,
        trim: true
    },
    story:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Story'
    },
    group:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Group'
    },
    event:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Event'
    },
    priority:{
        type:String,
        enum: ['low','medium','high','urgent'],
        default: 'medium'
    },
    date:{
        type:Date,
        default : Date.now
    },
    isRead:{
        type:Boolean,
        default:false
    },
    isArchived:{
        type:Boolean,
        default:false
    },
    metadata:{
        type:Map,
        of: String
    }
})

const notificationmodel  = mongoose.model('Notification',notificationstruct)
export default notificationmodel