import express from "express";
import bcrypt from "bcrypt";
import usermodel from "../models/UserModel.js";
import { AccessToken, RefreshToken } from "../utils/CreateToken.js";
import followermodel from "../models/FollowModel.js";

// Mock database for development
const mockUsers = [];
let mockUserIdCounter = 1;

import { generateObjectId } from '../utils/ObjectIdGenerator.js';

export const registerUser=async(req,res)=>{
    try{
        const{name,email,password,avatar,bio} = req.body;
        
        // Check if we're using mock database
        if (process.env.USE_MOCK_DB === 'true') {
            // Mock database implementation
            const existingUser = mockUsers.find(user => user.email === email);
            if(existingUser){
                return res.status(200).send({message:"User Already Exists.",success:false});
            }
            
            let hashpass;
            try {
                hashpass = await bcrypt.hash(password, 10);
            } catch (hashError) {
                console.error("Password hashing error:", hashError);
                return res.status(500).send({message:"Password encryption failed",success:false});
            }
            
            const newUser = {
                _id: generateObjectId(),
                name: name,
                email: email,
                password: hashpass,
                avatar: avatar || '',
                bio: bio || '',
                followers: [],
                following: [],
                date: new Date()
            };
            mockUsers.push(newUser);
            console.log("Mock user registered:", newUser);
            return res.status(200).send({message:"User Registered Successfully",success:true});
        } else {
            // Real database implementation
            const exist = await usermodel.findOne({email:email});
            if(exist){
                return res.status(200).send({message:"User Already Exists.",success:false});
            }
            
            let hashpass;
            try {
                hashpass = await bcrypt.hash(password, 10);
            } catch (hashError) {
                console.error("Password hashing error:", hashError);
                return res.status(500).send({message:"Password encryption failed",success:false});
            }
            const userdetails = new usermodel({name:name,email:email,password:hashpass,avatar:avatar,bio:bio});
            await userdetails.save();
            
            if(userdetails){
                return res.status(200).send({message:"User Registered Successfully",success:true});
            } else{
                return res.status(200).send({message:"Failed to update profile",success:false});
            }
        }
    }
    catch(error){
        console.error("Registration error:", error);
        res.status(500).send({message:"Server error during registration",success:false});
    }
}

export const loginUser = async(req,res)=>{
    try{
        const {email,password} = req.body;
        
        // Check if we're using mock database
        if (process.env.USE_MOCK_DB === 'true') {
            // Mock database implementation
            const exist = mockUsers.find(user => user.email === email);
            if(exist){
                const verify = await bcrypt.compare(password,exist.password);
                if (verify){
                    const accesstoken = await AccessToken(exist);
                    const refreshtoken = await RefreshToken(exist);
                    return res.status(200).send({message:"User Login SuccessFul",success:true,accesstoken,refreshtoken,userId:exist._id});
                }
                else{
                    return res.status(200).send({message:"Incorrect Password , Please Try Again ",success:false});
                }
            }
            else{
                return res.status(200).send({message:"User Not Found",success:false});
            }
        } else {
            // Real database implementation
            const exist = await usermodel.findOne({email:email});
            if(exist){
                const verify = await bcrypt.compare(password,exist.password);
                if (verify){
                    const accesstoken = await  AccessToken(exist);
                    const refreshtoken = await  RefreshToken(exist);
                    return res.status(200).send({message:"User Login SuccessFul",success:true,accesstoken,refreshtoken,userId:exist._id});
                }
                else{
                    return res.status(200).send({message:"Incorrect Password , Please Try Again ",success:false});
                }
            }
            else{
                return res.status(200).send({message:"User Not Found",success:false});
            }
        }
    }
    catch(error){
        console.error("Login error:", error);
        res.status(500).send({message:"Server error during login",success:false});
    }
}

export const getUserProfile = async (req,res) =>{
    try{
        const { id } = req.params;
        
        // Check if we're using mock database
        if (process.env.USE_MOCK_DB === 'true') {
            // Mock database implementation
            const exist = mockUsers.find(user => user._id == id);
            if (exist) {
                // For mock database, we'll simulate followers/following
                exist.followers = [];
                exist.following = [];
                return res.status(200).send({ exist, success: true });
            }
            else{
                return res.status(200).send({message:"User Profile Not Found",success:false});
            }
        } else {
            // Real database implementation
            const exist = await usermodel.findOne({ _id: id });
            if (exist) {
                // Fetch followers and following using the correct conditions
                const followers = await followermodel.find({ following: id }).populate('follower', 'name avatar username');  // Users who follow this profile
                const following = await followermodel.find({ follower: id }).populate('following', 'name avatar username');  // Users whom this profile follows

                // Create a modified user object with populated followers/following data
                const userData = {
                    ...exist.toObject(),
                    followers: followers,
                    following: following
                };

                // Send the response with the modified user data
                res.status(200).send({ exist: userData, success: true });
            }
            else{
                res.status(200).send({message:"User Profile Not Found",success:false});
            }
        }
    }
    catch(error){
        res.status(200).send({message:"Failed to get user data",success:false});
    }
}

export const updateProfile = async (req, res) => {
    try {
        const { id } = req.params; 
        const { name, email, password, avatar, bio, username, coverPhoto, theme, privacySettings, lifeEvents, accountType } = req.body;

        // Validate user ID
        if (!id) {
            return res.status(400).send({ message: "User ID is required.", success: false }); 
        }

        // Check if we're using mock database
        if (process.env.USE_MOCK_DB === 'true') {
            // Mock database implementation
            const userIndex = mockUsers.findIndex(user => user._id == id);
            if (userIndex === -1) {
                return res.status(404).send({ message: "User Does Not Exist.", success: false }); 
            }
            
            const updateFields = {};

            // Validate and sanitize inputs
            if (name && typeof name === 'string' && name.trim().length > 0) {
                updateFields.name = name.trim();
            }
            if (email && typeof email === 'string' && email.includes('@')) {
                updateFields.email = email.toLowerCase().trim();
            }
            if (password && typeof password === 'string' && password.length >= 6) {
                let hashpass;
                try {
                    hashpass = await bcrypt.hash(password, 10);
                } catch (hashError) {
                    console.error("Password hashing error:", hashError);
                    return res.status(500).send({message:"Password encryption failed",success:false});
                }
                updateFields.password = hashpass; 
            }
            if (avatar && typeof avatar === 'string') {
                updateFields.avatar = avatar;
            }
            if (bio && typeof bio === 'string') {
                updateFields.bio = bio.substring(0, 500); // Limit bio length
            }
            if (username && typeof username === 'string' && /^[a-zA-Z0-9_]+$/.test(username) && username.length <= 30) {
                updateFields.username = username.toLowerCase().trim();
            }
            if (coverPhoto && typeof coverPhoto === 'string') {
                updateFields.coverPhoto = coverPhoto;
            }
            // Only allow updating specific fields for theme and privacySettings
            if (theme && typeof theme === 'object') {
                // Validate theme structure
                const validThemeKeys = ['primaryColor', 'secondaryColor', 'layout'];
                const sanitizedTheme = {};
                for (const key of validThemeKeys) {
                    if (theme[key] !== undefined) {
                        sanitizedTheme[key] = theme[key];
                    }
                }
                updateFields.theme = sanitizedTheme;
            }
            if (privacySettings && typeof privacySettings === 'object') {
                // Validate privacySettings structure
                const validPrivacyKeys = ['profileVisibility', 'activityStatus', 'showOnlineStatus'];
                const sanitizedPrivacy = {};
                for (const key of validPrivacyKeys) {
                    if (privacySettings[key] !== undefined) {
                        sanitizedPrivacy[key] = privacySettings[key];
                    }
                }
                updateFields.privacySettings = sanitizedPrivacy;
            }
            if (lifeEvents && Array.isArray(lifeEvents)) {
                // Sanitize life events array
                updateFields.lifeEvents = lifeEvents.slice(0, 50); // Limit to 50 events
            }
            if (accountType && (accountType === 'personal' || accountType === 'business')) {
                updateFields.accountType = accountType;
            }

            // Update the user in the mock array
            mockUsers[userIndex] = { ...mockUsers[userIndex], ...updateFields };
            
            console.log("Mock user updated:", mockUsers[userIndex]);
            
            return res.status(200).send({ message: "User Details Updated Successfully", success: true });
        } else {
            // Real database implementation
            const exist = await usermodel.findOne({ _id: id });
            if (!exist) {
                return res.status(404).send({ message: "User Does Not Exist.", success: false }); 
            }
            const updateFields = {};

            // Validate and sanitize inputs
            if (name && typeof name === 'string' && name.trim().length > 0) {
                updateFields.name = name.trim();
            }
            if (email && typeof email === 'string' && email.includes('@')) {
                updateFields.email = email.toLowerCase().trim();
            }
            if (password && typeof password === 'string' && password.length >= 6) {
                let hashpass;
                try {
                    hashpass = await bcrypt.hash(password, 10);
                } catch (hashError) {
                    console.error("Password hashing error:", hashError);
                    return res.status(500).send({message:"Password encryption failed",success:false});
                }
                updateFields.password = hashpass; 
            }
            if (avatar && typeof avatar === 'string') {
                updateFields.avatar = avatar;
            }
            if (bio && typeof bio === 'string') {
                updateFields.bio = bio.substring(0, 500); // Limit bio length
            }
            if (username && typeof username === 'string' && /^[a-zA-Z0-9_]+$/.test(username) && username.length <= 30) {
                updateFields.username = username.toLowerCase().trim();
            }
            if (coverPhoto && typeof coverPhoto === 'string') {
                updateFields.coverPhoto = coverPhoto;
            }
            // Only allow updating specific fields for theme and privacySettings
            if (theme && typeof theme === 'object') {
                // Validate theme structure
                const validThemeKeys = ['primaryColor', 'secondaryColor', 'layout'];
                const sanitizedTheme = {};
                for (const key of validThemeKeys) {
                    if (theme[key] !== undefined) {
                        sanitizedTheme[key] = theme[key];
                    }
                }
                updateFields.theme = sanitizedTheme;
            }
            if (privacySettings && typeof privacySettings === 'object') {
                // Validate privacySettings structure
                const validPrivacyKeys = ['profileVisibility', 'activityStatus', 'showOnlineStatus'];
                const sanitizedPrivacy = {};
                for (const key of validPrivacyKeys) {
                    if (privacySettings[key] !== undefined) {
                        sanitizedPrivacy[key] = privacySettings[key];
                    }
                }
                updateFields.privacySettings = sanitizedPrivacy;
            }
            if (lifeEvents && Array.isArray(lifeEvents)) {
                // Sanitize life events array
                updateFields.lifeEvents = lifeEvents.slice(0, 50); // Limit to 50 events
            }
            if (accountType && (accountType === 'personal' || accountType === 'business')) {
                updateFields.accountType = accountType;
            }

            const updatedetails = await usermodel.findByIdAndUpdate(
                id, 
                { $set: updateFields }, 
                { new: true } 
            );

            if (updatedetails) {
                return res.status(200).send({ message: "User Details Updated Successfully", success: true });
            } else {
                return res.status(200).send({ message: "Update Failed", success: false }); 
            }
        }
    } catch (error) {
        res.status(200).send({ message: "Internal Server Error", success: false }); 
    }
};

export const getAllUsers = async (req, res) => {
    try {
        console.log("Getting all users");
        console.log("USE_MOCK_DB value:", process.env.USE_MOCK_DB);
        
        // Check if we're using mock database
        if (process.env.USE_MOCK_DB === 'true') {
            console.log("Using mock database");
            // Mock database implementation
            // Exclude sensitive information like passwords
            const users = mockUsers.map(user => ({
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                bio: user.bio,
                followers: user.followers,
                following: user.following,
                date: user.date
            }));
            
            if (users && users.length > 0) {
                console.log(`Found ${users.length} users (mock)`);
                return res.status(200).send({ 
                    users: users,
                    success: true 
                });
            } else {
                console.log("No users found (mock)");
                return res.status(200).send({ 
                    message: "No users found", 
                    users: [],
                    success: false 
                });
            }
        } else {
            console.log("Using real database");
            // Real database implementation
            // Exclude sensitive information like passwords
            const users = await usermodel.find({}, { password: 0 });
            console.log("Users found in database:", users.length);
            
            if (users && users.length > 0) {
                console.log(`Found ${users.length} users`);
                return res.status(200).send({ 
                    users: users,
                    success: true 
                });
            } else {
                console.log("No users found in database");
                return res.status(200).send({ 
                    message: "No users found", 
                    users: [],
                    success: false 
                });
            }
        }
    } catch (error) {
        console.error("Error getting all users:", error);
        res.status(500).send({ 
            message: "Error retrieving users: " + error.message, 
            success: false 
        });
    }
};

// NEW: Get user profile with analytics
export const getUserProfileWithAnalytics = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if we're using mock database
        if (process.env.USE_MOCK_DB === 'true') {
            // Mock database implementation
            const exist = mockUsers.find(user => user._id == id);
            if (exist) {
                // For mock database, we'll simulate followers/following and analytics
                exist.followers = [];
                exist.following = [];
                
                // Increment profile views counter
                exist.analytics = exist.analytics || { profileViews: 0 };
                exist.analytics.profileViews = (exist.analytics.profileViews || 0) + 1;
                
                return res.status(200).send({ 
                    exist, 
                    success: true 
                });
            }
            else{
                return res.status(200).send({message:"User Profile Not Found",success:false});
            }
        } else {
            // Real database implementation
            const exist = await usermodel.findOne({ _id: id });
            if (exist) {
                // Fetch followers and following using the correct conditions
                const followers = await followermodel.find({ following: id }).populate('follower', 'name avatar');  // Users who follow this profile
                const following = await followermodel.find({ follower: id }).populate('following', 'name avatar');  // Users whom this profile follows

                // Add the followers and following arrays to the 'exist' object
                exist.followers = followers;
                exist.following = following;
                
                // Increment profile views counter
                exist.analytics = exist.analytics || { profileViews: 0 };
                exist.analytics.profileViews = (exist.analytics.profileViews || 0) + 1;

                // Optionally, update the user document if needed
                await usermodel.findByIdAndUpdate(id, {
                    analytics: exist.analytics
                });

                // Send the response with the updated 'exist' object
                res.status(200).send({ exist, success: true });
            }
            else{
                res.status(200).send({message:"User Profile Not Found",success:false});
            }
        }
    }
    catch(error){
        res.status(200).send({message:"Failed to get user data",success:false});
    }
}

// NEW: Update user theme
export const updateUserTheme = async (req, res) => {
    try {
        const { id } = req.params;
        const { theme } = req.body;
        
        // Check if we're using mock database
        if (process.env.USE_MOCK_DB === 'true') {
            // Mock database implementation
            const userIndex = mockUsers.findIndex(user => user._id == id);
            if (userIndex === -1) {
                return res.status(404).send({ message: "User Does Not Exist.", success: false }); 
            }
            
            mockUsers[userIndex].theme = { ...mockUsers[userIndex].theme, ...theme };
            
            return res.status(200).send({ 
                message: "User theme updated successfully", 
                success: true 
            });
        } else {
            // Real database implementation
            const updatedUser = await usermodel.findByIdAndUpdate(
                id,
                { $set: { theme } },
                { new: true }
            );
            
            if (updatedUser) {
                res.status(200).send({ 
                    message: "User theme updated successfully", 
                    success: true 
                });
            } else {
                res.status(404).send({ message: "User not found", success: false });
            }
        }
    } catch (error) {
        res.status(500).send({ message: "Internal Server Error", success: false });
    }
};

// NEW: Update privacy settings
export const updatePrivacySettings = async (req, res) => {
    try {
        const { id } = req.params;
        const { privacySettings } = req.body;
        
        // Check if we're using mock database
        if (process.env.USE_MOCK_DB === 'true') {
            // Mock database implementation
            const userIndex = mockUsers.findIndex(user => user._id == id);
            if (userIndex === -1) {
                return res.status(404).send({ message: "User Does Not Exist.", success: false }); 
            }
            
            mockUsers[userIndex].privacySettings = { ...mockUsers[userIndex].privacySettings, ...privacySettings };
            
            return res.status(200).send({ 
                message: "Privacy settings updated successfully", 
                success: true 
            });
        } else {
            // Real database implementation
            const updatedUser = await usermodel.findByIdAndUpdate(
                id,
                { $set: { privacySettings } },
                { new: true }
            );
            
            if (updatedUser) {
                res.status(200).send({ 
                    message: "Privacy settings updated successfully", 
                    success: true 
                });
            } else {
                res.status(404).send({ message: "User not found", success: false });
            }
        }
    } catch (error) {
        res.status(500).send({ message: "Internal Server Error", success: false });
    }
};

// NEW: Add life event
export const addLifeEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, date, mediaUrl } = req.body;
        
        // Check if we're using mock database
        if (process.env.USE_MOCK_DB === 'true') {
            // Mock database implementation
            const userIndex = mockUsers.findIndex(user => user._id == id);
            if (userIndex === -1) {
                return res.status(404).send({ message: "User Does Not Exist.", success: false }); 
            }
            
            const newEvent = {
                _id: generateObjectId(),
                title,
                description,
                date: date ? new Date(date) : new Date(),
                mediaUrl
            };
            
            if (!mockUsers[userIndex].lifeEvents) {
                mockUsers[userIndex].lifeEvents = [];
            }
            
            mockUsers[userIndex].lifeEvents.push(newEvent);
            
            return res.status(200).send({ 
                message: "Life event added successfully", 
                success: true,
                event: newEvent
            });
        } else {
            // Real database implementation
            const newEvent = {
                title,
                description,
                date: date ? new Date(date) : new Date(),
                mediaUrl
            };
            
            const updatedUser = await usermodel.findByIdAndUpdate(
                id,
                { $push: { lifeEvents: newEvent } },
                { new: true }
            );
            
            if (updatedUser) {
                res.status(200).send({ 
                    message: "Life event added successfully", 
                    success: true,
                    event: newEvent
                });
            } else {
                res.status(404).send({ message: "User not found", success: false });
            }
        }
    } catch (error) {
        res.status(500).send({ message: "Internal Server Error", success: false });
    }
};

// NEW: Get user analytics
export const getUserAnalytics = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if we're using mock database
        if (process.env.USE_MOCK_DB === 'true') {
            // Mock database implementation
            const exist = mockUsers.find(user => user._id == id);
            if (exist) {
                const analytics = exist.analytics || {
                    profileViews: 0,
                    postEngagement: 0,
                    followersGrowth: 0
                };
                
                return res.status(200).send({ 
                    analytics, 
                    success: true 
                });
            }
            else{
                return res.status(404).send({message:"User Not Found",success:false});
            }
        } else {
            // Real database implementation
            const exist = await usermodel.findById(id);
            if (exist) {
                res.status(200).send({ 
                    analytics: exist.analytics, 
                    success: true 
                });
            }
            else{
                res.status(404).send({message:"User Not Found",success:false});
            }
        }
    } catch (error) {
        res.status(500).send({ message: "Internal Server Error", success: false });
    }
};

// NEW: Update account type
export const updateAccountType = async (req, res) => {
    try {
        const { id } = req.params;
        const { accountType } = req.body;
        
        // Check if we're using mock database
        if (process.env.USE_MOCK_DB === 'true') {
            // Mock database implementation
            const userIndex = mockUsers.findIndex(user => user._id == id);
            if (userIndex === -1) {
                return res.status(404).send({ message: "User Does Not Exist.", success: false }); 
            }
            
            mockUsers[userIndex].accountType = accountType;
            
            return res.status(200).send({ 
                message: "Account type updated successfully", 
                success: true 
            });
        } else {
            // Real database implementation
            const updatedUser = await usermodel.findByIdAndUpdate(
                id,
                { $set: { accountType } },
                { new: true }
            );
            
            if (updatedUser) {
                res.status(200).send({ 
                    message: "Account type updated successfully", 
                    success: true 
                });
            } else {
                res.status(404).send({ message: "User not found", success: false });
            }
        }
    } catch (error) {
        res.status(500).send({ message: "Internal Server Error", success: false });
    }
};

