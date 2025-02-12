import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { Auction } from "../models/auctionSchema.js";
import { User } from "../models/useSchema.js";
import { Bid } from "../models/bidSchema.js";

export const placeBid = catchAsyncError(async(req, res, next) => {
    const {id} = req.params
    const auctionItem = await Auction.findById(id)
    if(!auctionItem){
        return next(new ErrorHandler("auction item not found",400))
    }
    const {amount} = req.body
    if(!amount){
        return next(new ErrorHandler("please place your bid", 400))
    }
    if(amount <= auctionItem.currentBit || amount < auctionItem.startingBit){
        return next(new ErrorHandler("bid amount must be grater than current bid and stating bid", 400))
    }
    try{
        const existionBid = await Bid.findOne({
            "bidder.id":req.user._id,
            auctionItem:auctionItem._id
        })
        const existingBidInAuctionItem = await auctionItem.bids.find((bid) => bid.userId.toString() === req.user._id.toString())
        if(existionBid && existingBidInAuctionItem){
            existingBidInAuctionItem.amount = amount
            existionBid.amount = amount
            // await existingBidInAuctionItem.save()
            await existionBid.save()
            auctionItem.currentBit = amount
            await auctionItem.save()
        } else{
            const bidderDetails = await User.findById(req.user._id)
            const bid = await Bid.create({
                amount,
                bidder:{
                    id:bidderDetails._id,
                    userName:bidderDetails.userName,
                    profileImage:bidderDetails.profileImage?.url
                },
                auctionItem:auctionItem._id
            })
            auctionItem.bids.push({
                userId: req.user._id,
                userName:bidderDetails.userName,
                profileImage:bidderDetails.profileImage?.url,
                amount
            })
            auctionItem.currentBit = amount
            await auctionItem.save()
        }
        
        res.status(200).json({
            success:true,
            message:"Bid Placed",
            currentBit:auctionItem.currentBit
        })
        
    } catch(err){
        return next(new ErrorHandler(err.message, 400))
    }
})