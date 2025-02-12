export const generateToken = async(user, message, statusCode, res) => {
    const token = await user.generateToken()
    res.status(statusCode).cookie("token", token, {
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24* 60* 60* 1000),
        httpOnly:true,
        secure: true,
        sameSite: "none"
    }).json({
        success:true,
        message,
        user,
        token
    })
}