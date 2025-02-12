import { addAuctionItem, getAllItems, getAuctionDetails, getMyAuctinoItems, removeFromAuction, republishItem } from '../controllers/auctionItemController.js'
import { isAuthenticated, isAuthorized } from '../middlewares/auth.js'
import express from 'express'
import { trackCommissionStatus } from '../middlewares/trackCommissionStatus.js'
const router = express.Router()

router.post('/create', isAuthenticated, isAuthorized("Auctioneer"), trackCommissionStatus, addAuctionItem)
router.get('/allitem', getAllItems)
router.get('/auction/:id', isAuthenticated, getAuctionDetails)
router.get('/myitems', isAuthenticated, isAuthorized("Auctioneer"), getMyAuctinoItems)
router.delete('/delete/:id', isAuthenticated, isAuthorized("Auctioneer"), removeFromAuction)
router.put('/item/republish/:id', isAuthenticated, isAuthorized("Auctioneer"), republishItem)

export default router