import {User} from '../models/useSchema.js'
import jwt from 'jsonwebtoken'
import ErrorHandler from './error.js'
import { catchAsyncError } from './catchAsyncError.js'

export const isAuthenticated = catchAsyncError(async(req, res, next) => {
    const token = req.cookies.token
    if(!token){
        return next(new ErrorHandler("user not authenticated", 400))
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decoded.id)
    next()
})

export const isAuthorized = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)){
            return next(new ErrorHandler(`${req.user.role} is not allowed to access this function`, 403))
        }
        next()
    }
}