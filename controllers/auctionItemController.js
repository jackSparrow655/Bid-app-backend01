import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { User } from "../models/useSchema.js";
import { Auction } from "../models/auctionSchema.js";
import ErrorHandler from "../middlewares/error.js";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";
import { response } from "express";

export const addAuctionItem = catchAsyncError(async (req, res, next) => {
    try {
        if (!req.files || Object.keys(req.files).length == 0) {
            return next(new ErrorHandler("auction Item's image required", 400));
        }

        const { image } = req.files;
        // console.log(image.mimetype)
        const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
        if (!allowedFormats.includes(image.mimetype)) {
            console.log("hii")
            return next(new ErrorHandler("file formate is not supported", 400));
        }
        const {
            title,
            description,
            category,
            condition,
            startingBit,
            startTime,
            endTime,
        } = req.body;
        if (
            !title ||
            !description ||
            !category ||
            !condition ||
            !startingBit ||
            !startTime ||
            !endTime
        ) {
            return next(new ErrorHandler("please provide all details of auction", 400));
        }
        const startTimeTemp = new Date(startTime)
        const endTimeTemp = new Date(endTime)
        // console.log(startTime)
        if (startTimeTemp < Date.now() || startTimeTemp >= endTimeTemp) {
            return next(new ErrorHandler(
                "auction starting time must be grater than current time and must be less than end time",
                400
            ));
        }
        const alreadyOneAuctionActive = await Auction.findOne({
            createdBy: req.user._id,
            endTime: { $gt: Date.now()},
        });
        if (alreadyOneAuctionActive) {
            return next(new ErrorHandler("you already have one active auction", 400));
        }
        const cloudinaryResponse = await cloudinary.uploader.upload(
            image.tempFilePath,
            {
                folder: "MERN AUCTION PLATFORM AUCTIONS",
            }
        );

        if (!cloudinaryResponse || cloudinaryResponse.error) {
            console.error(
                "cloudinary Error",
                cloudinaryResponse.error || "unknown cloudinary error"
            );
            return next(
                new ErrorHandler(
                    "Failed to upload AUCTION- image to cloudinary",
                    400
                )
            );
        }
        const auctionItem = await Auction.create({
            title,
            description,
            category,
            condition,
            startingBit,
            startTime:new Date(startTime),
            endTime:new Date(endTime),
            image: {
                public_id: cloudinaryResponse.public_id,
                url: cloudinaryResponse.secure_url,
            },
            createdBy: req.user._id,
        });
        return res.status(201).json({
            success: true,
            message: `auction item is listed and will be listed on auction page at ${startTime}`,
            auctionItem,
        });
    } catch (err) {
        return next(new ErrorHandler(err.message, 500));
    }
});

export const getAllItems = catchAsyncError(async(req, res, next) => {
    let items = await Auction.find()
    res.status(200).json({
        success:true,
        message:"all auction fetched successfully",
        items
    })
})
export const getMyAuctinoItems = catchAsyncError(async(req, res, next) => {
    const userId = req.user._id
    const items = await Auction.find({createdBy:userId})
    res.status(200).json({
        success:true,
        items
    })
})
export const getAuctionDetails = catchAsyncError(async(req, res, next) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return next(new ErrorHandler("invalid id formate", 400))
    }
    const auctionItem = await Auction.findById(id)
    if(!auctionItem){
        return next(new ErrorHandler("auction not found", 400))
    }
    const bidder = auctionItem.bids.sort((a,b) => b.bid - a.bid)
    // console.log(bidder)
    res.status(200).json({
        success:true,
        message:"auction details found successfully",
        auctionItem,
        bidder
    })
})
export const removeFromAuction = catchAsyncError(async(req, res, next) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return next(new ErrorHandler("invalid id format", 400))
    }
    const auctionItem = await Auction.findById(id)
    if(!auctionItem){
        return next(new ErrorHandler("auction could't found", 400))
    }
    if(auctionItem.createdBy.equals(req.user._id)){
        const deletedItem = await Auction.findByIdAndDelete(id)
        res.status(200).json({
            success:true,
            message:"item is deleted successfully",
            deletedItem
        })
    }
    else{
        return next(new ErrorHandler("you are not the owner of this auction", 400))
    }
})
export const republishItem = catchAsyncError(async(req, res, next) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return next(new ErrorHandler("invalid id format", 400))
    }
    if(!req.body.startTime || !req.body.endTime){
        return next(new ErrorHandler("startTime and endTime is mandatory", 400))
    }
    let auctionItem = await Auction.findById(id)
    if(!auctionItem){
        return next(new ErrorHandler("auction is not found", 400))
    }
    // if(new Date(auctionItem.endTime) > Date.now()){
    //     return next(new ErrorHandler("auction is currently active can not be deleted", 400))
    // }
    let data = {
        startTime: new Date(req.body.startTime),
        endTime: new Date(req.body.endTime)
    }
    if(data.startTime < Date.now() || data.endTime <= data.startTime){
        return next(new ErrorHandler("auction starting time must be grater than current time and end time must be greater than end time", 400))
    }
    data.bids = []
    data.commissionCalculated = false 
    auctionItem = await Auction.findByIdAndUpdate(id, data, {
        new:true,
        runValidators:false,
        useFindAndModify:false,
    })
    const createdBy = await User.findById(req.user._id)
    createdBy.unpaidCommission = 0
    await createdBy.save()
    res.status(200).json({
        success:true,
        message:`Auction republished and will be active on ${auctionItem.startTime}`,
        auctionItem
    })
})
