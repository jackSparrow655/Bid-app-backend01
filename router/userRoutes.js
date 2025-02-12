import {fetchLeaderBoard, getProfile, login, logout, register} from "../controllers/userController.js"
import express from "express"
import { isAuthenticated } from "../middlewares/auth.js"

const router = express.Router()

router.post('/test', (req, res) => {
    console.log(req.body)
    if(req.files){
        console.log(req.files)
    }
    // console.log(req.files)

    // if (!req.files || Object.keys(req.files).length == 0) {
    //     // console.log(req.files.file01)
    //     console.log(req.body)
    //     return res.status(400).json({
    //         success:false,
    //         message:"files is required"
    //     })
    // }
    return res.status(200).json({
        success:true,
        message1:`hii mr. app is running well baby`
    })
})

router.post('/register', register)
router.post('/login', login)
router.get('/me', isAuthenticated, getProfile)
router.get('/logout', isAuthenticated, logout)
router.get('/leaderboard', fetchLeaderBoard)


export default router