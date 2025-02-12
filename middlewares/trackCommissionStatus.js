import {User} from '../models/useSchema.js'
import {catchAsyncError} from '../middlewares/catchAsyncError.js'
import ErrorHandler from './error.js'

export const trackCommissionStatus = catchAsyncError(async(req, res, next) => {
    const user = await User.findById(req.user._id)
    if(user.unpaidCommission > 0){
        return next(new ErrorHandler("you have unpaid commissions, please pay them before posting new auction", 400))
    }
    next()
})