import { catchAsyncError } from '../middlewares/catchAsyncError.js'
import ErrorHandler from '../middlewares/error.js'
import {Commission} from '../models/commissionSchema.js'
import {User} from '../models/useSchema.js'
import { PaymentProof } from '../models/commissionProofSchema.js'
import {Auction} from '../models/auctionSchema.js'
import mongoose from 'mongoose'

export const deleteAuctionItem = catchAsyncError(async(req, res, next) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return next(new ErrorHandler("invalid id format", 400))
    }
    const deletedItem = await Auction.findByIdAndDelete(id)
    if(!deletedItem){
        return next(new ErrorHandler("auction is not found", 400))
    }
    res.status(200).json({
        success:true,
        message:"item is deleted successfully",
        deletedItem
    })
})


export const getAllPaymentProof = catchAsyncError(async(req, res, next) => {
    let paymentProofs = await PaymentProof.find()
    res.status(200).json({
        success:true,
        message:"all payment proof fetched successfully",
        paymentProofs
    })
})

export const getPaymentProofDetails = catchAsyncError(async(req, res, next) => {
    const {id} = req.params
    const paymentProofDetails = await PaymentProof.findById(id)
    res.status(200).json({
        success:true,
        paymentProofDetails
    })
})

export const updateProofStatus = catchAsyncError(async(req, res, next) =>{
    const {id} = req.params
    const {amount, status} = req.body
    if(!mongoose.Types.ObjectId.isValid(id)){
        return next(new ErrorHandler("invalid id formatte", 400))
    }
    const proof = await PaymentProof.findById(id)
    if(!proof){
        return next(new ErrorHandler("payment proof not found", 400))
    }
    proof = await PaymentProof.findByIdAndUpdate(id,
        {status, amount},
        {
            new:true,
            runValidators:true,
            useFindAndModify:false
        }
    )
    res.status(200).json({
        success:true,
        message:"payment proof status updated",
        proof
    })
    
})

export const deletePaymentProof = catchAsyncError(async(req, res, next) => {
    const {id} = req.params
    const proof = await PaymentProof.findById(id)
    if(!proof){
        return new ErrorHandler("payment proof not found", 400)
    }
    await proof.deleteOne()
    res.status(200).json({
        success:true,
        message:"payment proof deleted"
    })
})


export const fetchAllUsers = catchAsyncError(async (req, res, next) => {
    const users = await User.aggregate([
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $month: "$createdAt" },
            role: "$role",
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          month: "$_id.month",
          year: "$_id.year",
          role: "$_id.role",
          count: 1,
          _id: 0,
        },
      },
      {
        $sort: { year: 1, month: 1 },
      },
    ]);
  
    const bidders = users.filter((user) => user.role === "Bidder");
    const auctioneers = users.filter((user) => user.role === "Auctioneer");
  
    const tranformDataToMonthlyArray = (data, totalMonths = 12) => {
      const result = Array(totalMonths).fill(0);
  
      data.forEach((item) => {
        result[item.month - 1] = item.count;
      });
  
      return result;
    };
  
    const biddersArray = tranformDataToMonthlyArray(bidders);
    const auctioneersArray = tranformDataToMonthlyArray(auctioneers);
  
    res.status(200).json({
      success: true,
      biddersArray,
      auctioneersArray,
    });
  });
  
  export const monthlyRevenue = catchAsyncError(async (req, res, next) => {
    const payments = await Commission.aggregate([
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          totalAmount: { $sum: "$amount" },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);
  
    const tranformDataToMonthlyArray = (payments, totalMonths = 12) => {
      const result = Array(totalMonths).fill(0);
  
      payments.forEach((payment) => {
        result[payment._id.month - 1] = payment.totalAmount;
      });
  
      return result;
    };
  
    const totalMonthlyRevenue = tranformDataToMonthlyArray(payments);
    res.status(200).json({
      success: true,
      totalMonthlyRevenue,
    });
  });

