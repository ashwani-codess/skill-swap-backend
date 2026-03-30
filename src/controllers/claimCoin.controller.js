const userModel = require("../models/user.model")
const reviewModel = require("../models/reviewModel")
const exchangeModel = require("../models/exchangeRequest.model");
const asyncHandler = require("../utils/asyncHandler")

async function claimCoin(req, res) {
    const { exchangeId } = req.body;
    if (!exchangeId) return res.status(404).json({ message: "no such exchange exists" })
    const claimedBy = req.user._id;
    const request = await ExchangeRequestModel.findById(exchaneId)

    if (request.status !== "accepted") return res.status(400).json({ message: "status must be accepted" })
    if (request.sender.toString() !== claimedBy.toString() &&
        request.reciever.toString() !== claimedBy.toString()) {
        return res.status(403).json({ message: "unauthorised access" })
    }


 // pichle 1 ghante mein claim kiya tha?
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const recentClaim = await CoinClaim.findOne({
        exchangeId,
        claimedBy,
        claimedAt: { $gte: oneHourAgo }
    })

    if (recentClaim) {
        return res.status(429).json({ message: "1 ghante mein sirf ek baar claim kar sakte ho" })
    }

    // coin claim create karo
    await CoinClaim.create({ exchangeId, claimedBy, claimedAt: new Date() })

    // user ke skillCoins mein +1 karo
    const updatedUser = await userModel.findByIdAndUpdate(
        claimedBy,
        { $inc: { skillCoins: 1 } },
        { new: true }
    )

    res.status(200).json({
        message: "1 SkillCoin claim ho gaya!",
        skillCoins: updatedUser.skillCoins
    })
}

const getBalance = asyncHandler(async (req, res) => {
    const user = await userModel.findById(req.user._id)
    res.status(200).json({ skillCoins: user.skillCoins })
})

module.exports = { claimCoin, getBalance }
