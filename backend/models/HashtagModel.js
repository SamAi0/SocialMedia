import mongoose from "mongoose";

const HashtagSchema = new mongoose.Schema({
    tag: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
    }],
    count: {
        type: Number,
        default: 1
    },
    lastUsed: {
        type: Date,
        default: Date.now
    }
});

const HashtagModel = mongoose.model("Hashtag", HashtagSchema);
export default HashtagModel;
