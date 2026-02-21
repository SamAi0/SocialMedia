import HashtagModel from "../models/HashtagModel.js";

export const getTrendingHashtags = async (req, res) => {
    try {
        // Get top 10 used hashtags
        const trending = await HashtagModel.find()
            .sort({ count: -1 })
            .limit(10);

        res.status(200).json({
            success: true,
            hashtags: trending
        });
    } catch (error) {
        console.error("Get trending hashtags error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch trending hashtags" });
    }
};
