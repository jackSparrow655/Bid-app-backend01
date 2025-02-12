import mongoose from "mongoose";
import { catchAsyncError } from "./catchAsyncError.js";
import ErrorHandler from "./error.js";
import { Auction } from "../models/auctionSchema.js";

export const checkAuctionTime = catchAsyncError(async(req, res, next) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return next(new ErrorHandler("invalid id formate", 400))
    }
    const auction = await Auction.findById(id)
    if(!auction){
        return next(new ErrorHandler("auction not found", 400))
    }
    const now = new Date(Date.now());
    if(new Date(auction.endTime) < now){
        return next(new ErrorHandler("acution is ended", 400))
    }
    else if(new Date(auction.startTime) > now){
        return next(new ErrorHandler("auction is not started yet", 400))
    }
    next()
})