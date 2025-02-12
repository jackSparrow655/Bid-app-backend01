import mongoose from "mongoose";

export const connection = () =>{
    mongoose.connect(process.env.MONGO_URI,{
        dbName:"AUCTION_PLATFORM",
    }).then(() => {
        console.log("db connection is successfull")
    }).catch((err) => {
        console.log("error in db connection", err)
    })
}