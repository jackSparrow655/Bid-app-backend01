import express from 'express'
import { sendProofOfCommission } from '../controllers/commissionController.js'
import {isAuthenticated, isAuthorized} from '../middlewares/auth.js'

const router = express.Router()

router.post('/proof', isAuthenticated, isAuthorized("Auctioneer"), sendProofOfCommission)

export default router