import jwt from "jsonwebtoken";

export const AccessToken=async(exist)=>{
    if (!process.env.ACCESS_TOKEN_KEY) {
        throw new Error("ACCESS_TOKEN_KEY environment variable is not set");
    }
    const accesstoken =  jwt.sign({id:exist._id},process.env.ACCESS_TOKEN_KEY,{expiresIn:"1d"})
    return accesstoken
}

export const RefreshToken=async(exist)=>{
    if (!process.env.REFRESH_TOKEN_KEY) {
        throw new Error("REFRESH_TOKEN_KEY environment variable is not set");
    }
    const refreshtoken =  jwt.sign({id:exist._id},process.env.REFRESH_TOKEN_KEY,{expiresIn:"10d"})
    return refreshtoken
}