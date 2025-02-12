import {placeBid} from '../controllers/bidController.js'
import express from 'express'
import { isAuthenticated, isAuthorized } from '../middlewares/auth.js'
import { checkAuctionTime } from '../middlewares/checkAuctionTime.js'

const router = express.Router()

router.post('/place/:id', isAuthenticated, isAuthorized("Bidder"), checkAuctionTime, placeBid)


export default router