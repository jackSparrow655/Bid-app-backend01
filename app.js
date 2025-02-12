import { config } from 'dotenv'
import cors from 'cors'
import express, { urlencoded } from 'express'
import cookieParser from 'cookie-parser'
import fileUpload from 'express-fileupload'
import { connection } from './config/connection.js'
import { errorMiddleware } from './middlewares/error.js'
import userRouter from './router/userRoutes.js'
import auctonItemRouter from './router/auctionItemRoutes.js'
import bidRouter from './router/bidRoutes.js'
import commissionRouter from './router/commissionRouter.js'
import superAdminRouter from './router/superAdminRoutes.js'
import { endedAuctionCron } from './auto/endedAuctionCron.js'
import { verifyCommissionCron } from './auto/verifyCommissionCron.js'
const app = express()
config({
    path:"./.env"
})

app.use(cors({
    origin:[process.env.FRONTEND_URL],
    methods:['POST', 'GET', 'UPDATE', 'PUT', 'DELETE'],
    credentials:true
}))
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
}))

app.get('/', (req, res) => {
    return res.status(200).json({
        success:true,
        message:"app is running well baby!"
    })
})

app.use('/api/v1/user', userRouter)
app.use('/api/v1/auctionitem', auctonItemRouter)
app.use('/api/v1/bid', bidRouter)
app.use('/api/v1/commission', commissionRouter)
app.use('/api/v1/superadmin', superAdminRouter)

connection()
// endedAuctionCron()
// verifyCommissionCron()

app.use(errorMiddleware)
export default app