import mongoose from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const userSchema = new mongoose.Schema({
    userName:{
        type:String,
        minLength:[3,"user name must have at least 3 char"],
        maxLeangth:[40,"user name can not exceed 40 charecter"]
    },
    password:{
        type:String,
        selected:false,
        minLength:[3,"password must have at least 3 char"],
        maxLeangth:[40,"password can not exceed 40 charecter"]
    },
    email:{
        type:String,
        required:true
    },
    address:String,
    phone:{
        type:String,
        minLength:[10,"phone number must have at least 10 digits"],
        maxLeangth:[12,"password can not exceed 40 charecter"]
    },
    profileImage:{
        public_id:{
            type:String,
            required:true
        },
        url:{
            type:String,
            required:true
        }
    },
    paymentMethods:{
        bankTransfer:{
            bankAccountNumber:String,
            bankAccountIFSC:String,
            bankName:String,
        },
        upi:{
            upiId:String
        },
        mobile:{
            mobileNo:String
        }
    },
    role:{
        type:String,
        enum:["Auctioneer", "Bidder", "SuperAdmin"]
    },
    unpaidCommission:{
        type:Number,
        default:0
    },
    auctionsWon:{
        type:Number,
        default:0
    },
    moneySpend:{
        type:Number,
        default:0
    },
    createdAt:{
        type:Date,
        default:Date.now()
    }
})

userSchema.pre("save", async function(next){
    if(!this.isModified("password")){
        next()
    }
    else{
        const hashPassword = await bcrypt.hash(this.password, 10)
        this.password = hashPassword
    }
})

userSchema.methods.comparePassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password)
}

userSchema.methods.generateToken = async function() {
    return jwt.sign({id:this._id}, process.env.JWT_SECRET, {
        expiresIn:process.env.JWT_EXPIRE
    })
}

export const User = mongoose.model("User", userSchema)