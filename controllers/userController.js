import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/useSchema.js";
import {v2 as cloudinary} from 'cloudinary'
import { generateToken } from "../utils/jwtToken.js";

export const register = catchAsyncError(async(req, res, next) => {
    if (!req.files || Object.keys(req.files).length == 0) {
        return next(new ErrorHandler("profile image required", 400));
    }

    const { profileImage } = req.files;
    const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
    if (!allowedFormats.includes(profileImage.mimetype)) {
        return next(new ErrorHandler("file formate is not supported", 400));
    }
    const {
        userName,
        email,
        password,
        phone,
        address,
        role,
        bankAccountNumber,
        bankAccountIFSC,
        bankName,
        upiId,
        mobileNo
    } = req.body;
    
    if(!userName || !email || !password || !phone || !role || !address){
        return next(new ErrorHandler("please fill full form", 400))
    }
    
    if(role === "Auctioneer"){
        if(!bankAccountNumber || !bankAccountIFSC || !bankName){
            return next(new ErrorHandler("please provide your full bank details", 400))
        }
        if(!upiId){
            return next(new ErrorHandler("please provide upi id", 400))
        }
    }
    const isRegister = await User.findOne({email})
    if(isRegister){
        return next(new ErrorHandler("user already registered", 400))
    }
    let cloudinaryResponse = ""
    try{
        cloudinaryResponse = await cloudinary.uploader.upload(profileImage.tempFilePath, {
            folder:"MERN AUCTION PLATFORM USERS"
        })
    } catch(err){
        return next(new ErrorHandler(`cloudinary error: ${err}`, 400))
    }
    
    if(!cloudinaryResponse || cloudinaryResponse.error){
        console.error("cloudinary Error", 
            cloudinaryResponse.error || "unknown cloudinary error"
        )   
        return next(new ErrorHandler("Failed to upload image to cloudinary", 400))
    }
    try{
        const user = await User.create({
            userName,
            email,
            password,
            phone,
            address,
            role,
            profileImage:{
                public_id:cloudinaryResponse.public_id,
                url:cloudinaryResponse.secure_url
            },
            paymentMethods:{
                bankTransfer:{
                    bankAccountNumber,
                    bankAccountIFSC,
                    bankName,
                },
                upi:{
                    upiId
                },
                mobile:{
                    mobileNo
                }
            }
        })
        generateToken(user, "user registered successfully", 200, res)
    } catch(err){
        await cloudinary.uploader.destroy(cloudinaryResponse.public_id)
        throw err
    }
    next()
});

export const login = catchAsyncError(async(req, res, next) => {
    const {email, password} = req.body
    if(!email || !password){
        return next(new ErrorHandler("provide all fields", 400))
    }
    const user = await User.findOne({email}).select("+password")
    if(!user){
        return next(new ErrorHandler("invalid credentials",400))
    }
    const isPasswordMatch = await user.comparePassword(password)
    if(!isPasswordMatch){
        return next(new ErrorHandler("invalid password", 400))
    }
    generateToken(user, "logged in succcessfully", 200, res)
    next()
})
export const getProfile = catchAsyncError(async(req, res, next) => {
    const user = req.user
    res.status(200).json({
        success:true,
        user
    })
    next()
})
export const logout = catchAsyncError(async(req, res, next) => {
    res.status(200).cookie("token", "abc", {
        expires: new Date(Date.now()),
        httpOnly:true,
        // sameSite:"none",
        secure:true
    }).json({
        success:true,
        message:"logged out successfully"
    })
})
export const fetchLeaderBoard = catchAsyncError(async(req, res, next) => {
    const users = await User.find({moneySpend: {$gt: 0}})
    const leaderBoard = users.sort((a, b) => b.moneySpend - a.moneySpend)
    res.status(200).json({
        success:true,
        leaderBoard
    })
    next()
})
