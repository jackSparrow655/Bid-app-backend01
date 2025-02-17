import mongoose from 'mongoose'

const auctionSchema = new mongoose.Schema({
    title:String,
    description:String,
    startingBit:Number,
    category:String,
    condition:{
        type:String,
        enum:["new", "used"]
    },
    currentBit:{type:Number, default: 0},
    startTime:Date,
    endTime:Date,
    image:{
        public_id:{
            type:String,
            required:true
        },
        url:{
            type:String,
            required:true
        }
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    bids:[
        {
            userId:{type:mongoose.Schema.Types.ObjectId, ref:"User"},
            userName:String,
            profileImage:String,
            amount:Number
        }
    ],
    highestBidder:{
        type:mongoose.Schema.ObjectId,
        ref:"User"
    },
    commissionCalculated:{
        type:Boolean,
        default:false
    },
    createdAt:{
        type:Date,
        default:Date.now()
    }
})

export const Auction = mongoose.model("Auction", auctionSchema)