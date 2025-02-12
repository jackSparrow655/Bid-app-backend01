import cron from "node-cron";
import { Auction } from "../models/auctionSchema.js";
import { User } from "../models/useSchema.js";
import { Bid } from "../models/bidSchema.js";
import { sendEmail } from "../utils/sendEmail.js";
import { calculateCommission } from "../controllers/commissionController.js";

export const endedAuctionCron = () => {
  cron.schedule("*/10 * * * * *", async () => {
    const now = new Date(Date.now());
    console.log("Cron for ended auction running...");

    const allAuctions = await Auction.find()
    const endedAuctions = allAuctions.filter(auction => {
      // const auctionEndTime = new Date(auction.endTime); // Convert string to Date
      const auctionEndTime = auction.endTime
      const isCommissionCalculated = auction.commissionCalculated
      return (auctionEndTime < now && isCommissionCalculated == false); // Compare as Date objects
    });
    
    for (const auction of endedAuctions) {
      try {
        // console.log("auction end time = ", auction.endTime.toLocaleString())
        const commissionAmount = await calculateCommission(auction._id);
        auction.commissionCalculated = true;
        const highestBidder = await Bid.findOne({
          auctionItem: auction._id,
          amount: auction.currentBit,
        });
        const auctioneer = await User.findById(auction.createdBy);
        // console.log(auctioneer.email)
        auctioneer.unpaidCommission = commissionAmount;
        if (highestBidder) {
          auction.highestBidder = highestBidder.bidder.id;
          await auction.save();
          const bidder = await User.findById(highestBidder.bidder.id);
          // console.log("bidder = ", bidder.email)
          await User.findByIdAndUpdate(
            bidder._id,
            {
              $inc: {
                moneySpend: highestBidder.amount,
                auctionsWon: 1,
              },
            },
            { new: true }
          );
          await User.findByIdAndUpdate(
            auctioneer._id,
            {
              $inc: {
                unpaidCommission: commissionAmount,
              },
            },
            { new: true }
          );
          const subject = `Congratulations! You won the auction for ${auction.title}`
          const message = `Dear ${bidder.userName}, \n\nCongratulations! You have won the auction for ${auction.title}. \n\nBefore proceeding for payment contact your auctioneer via your auctioneer email: ${auctioneer.email} \n\nPlease complete your payment using one of the following methods:\n\n1. **Bank Transfer**: \n- Bank Name: ${auctioneer.paymentMethods.bankTransfer.bankName} \n- Account Number: ${auctioneer.paymentMethods.bankTransfer.bankAccountNumber} \n- IFSC: ${auctioneer.paymentMethods.bankTransfer.bankAccountIFSC}\n\n2. **Easypaise**:\n- You can send payment via UPI: ${auctioneer.paymentMethods.upi.upiId}\n\n3. **mobile**:\n- Send payment to: ${auctioneer.paymentMethods.mobile.mobileNo}\n\n4. **Cash on Delivery (COD)**:\n- If you prefer COD, you must pay 20% of the total amount upfront before delivery.\n- To pay the 20% upfront, use any of the above methods.\n- The remaining 80% will be paid upon delivery.\n- If you want to see the condition of your auction item then send your email on this: ${auctioneer.email}\n\nPlease ensure your payment is completed by [Payment Due Date]. Once we confirm the payment, the item will be shipped to you.\n\nThank you for participating!\n\nBest regards,\nArijit Auction Team`;
          console.log("SENDING EMAIL TO HIGHEST BIDDER");
          await sendEmail({ email: bidder.email, subject, message });
          console.log("SUCCESSFULLY EMAIL SEND TO HIGHEST BIDDER");
        } else {
          await auction.save();
        }
      } catch (error) {
        return next(console.error(error || "Some error in ended auction cron"));
      }
    }
    console.log("cron for ended auction is ended")
  });
};
