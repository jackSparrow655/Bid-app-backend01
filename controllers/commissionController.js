import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/useSchema.js";
import { PaymentProof } from "../models/commissionProofSchema.js";
import {v2 as cloudinary} from 'cloudinary'
import { Auction } from "../models/auctionSchema.js";
import mongoose from "mongoose";

export const sendProofOfCommission = catchAsyncError(async(req, res, next) => {
    if(!req.files || Object.keys(req.files).length == 0){
        return next(new ErrorHandler("payment proof screenshot is required", 400))
    }
    const {proof} = req.files
    const {amount, comment} = req.body
    const user = await User.findById(req.user._id)
    if(!amount || !comment){
        return next(new ErrorHandler("amount and comments are required",400 ))
    }
    if(user.unpaidCommission === 0){
        return res.status(200).json({
            success:true,
            message:"you don't have any unpaid commission"
        })
    }
    if(user.unpaidCommission < amount){
        return next(new ErrorHandler("the amount exceed your unpaid commission", 400))
    }
    
    const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
    console.log("file formatte = ",proof.mimetype)
    if (!allowedFormats.includes(proof.mimetype)) {
        return next(new ErrorHandler("file formate is not supported", 400));
    }
    
    const cloudinaryResponse = await cloudinary.uploader.upload(proof.tempFilePath, {
        folder:"MERN AUCTION PAYMENT PROOF"
    })
    
    if(!cloudinaryResponse || cloudinaryResponse.error){
        console.error("cloudinary Error", 
            cloudinaryResponse.error || "unknown cloudinary error"
        )   
        return next(new ErrorHandler("Failed to upload payment proof", 400))
    }
    const commissionProof = await PaymentProof.create({
        userId:user._id,
        proof:{
            public_id:cloudinaryResponse.public_id,
            url:cloudinaryResponse.secure_url
        },
        amount,
        comment
    })
    return res.status(200).json({
        success:true,
        message:"your proof has been submitted successfully, it will be reviewed and responed to you with in 24h",
        commissionProof
    })
})

export const calculateCommission = async (auctionId) => {
    if (!auctionId || !mongoose.Types.ObjectId.isValid(auctionId)) {
        console.log("invalid id formate")
        throw new ErrorHandler("Auction not found.", 404);
    }      
    const auction = await Auction.findById(auctionId);
    const commissionRate = 0.05;
    const commission = auction.currentBit * commissionRate;
    return commission;
  };

 