class ErrorHandler extends Error{
    constructor(message, statusCode){
        super(message)
        this.statusCode = statusCode
    }
}

export const errorMiddleware = (err, req, res, next) => {
    err.message = err.message || "internal server error";
    err.statusCode = err.statusCode || 500;
    // console.log(err)
    if(err.name === "JsonWebTokenError"){
        const message = "invalid json web token, please try again letter"
        err = new ErrorHandler(message, 400)
    } 
    if(err.name === "JsonWebTokenError"){
        const message = "invalid json web token, please try again letter"
        err = new ErrorHandler(message, 400)
    } 
    if(err.name === "CastError"){
        const message = `invalid ${err.path}`
        err = new ErrorHandler(message, 400)
    } 
    
    const errorMessage = err.errors? Object.values(err.errors).map((error) => error.message).join(" "):err.message
    return res.status(err.statusCode).json({
        success:false,
        message: errorMessage
    })
}

export default ErrorHandler