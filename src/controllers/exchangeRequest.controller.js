const skillModel = require("../models/Skill.model")
const userModel = require("../models/user.model")
const ExchangeRequestModel = require("../models/exchangeRequest.model")
const crypto = require('crypto')
const asyncHandler = require("../utils/asyncHandler")

const sendRequest = asyncHandler(async (req, res) => {
    const { reciever, senderSkill, recieverSkill, message, requestType, coinAmount } = req.body;
    const sender = req.user._id;
    const existingRequest = await ExchangeRequestModel.findOne({
        sender,
        reciever,
        senderSkill,
        status: "pending"
    })

    if (existingRequest) {
        return res.status(400).json({ mesage: "request already sent" })
    }
// handling coin exchange case
    if (requestType === "coin-exchange") {
        const senderUser = await userModel.findById(sender)

        if (senderUser.skillCoins >= coinAmount) {
            const updatedUser = await userModel.findByIdAndUpdate(
                sender,
                { $inc: { skillCoins: -coinAmount } },
                { new: true }
            )
        } else {
            return res.status(400).json({ message: "insufficient coins" })  // ← missing
        }
    }
    const request = await ExchangeRequestModel.create({ sender, reciever, senderSkill, recieverSkill, message, requestType, coinAmount })
    res.status(201).json({ request })
})

const getMyAllRequests = asyncHandler(async (req, res) => {
    const request = await ExchangeRequestModel.find({
        $or: [    //Matlab — "mujhe woh saari requests do jisme main sender hun ya receiver hun" — dono side ki requests ek saath aa jaayengi.
            { sender: req.user._id },
            { reciever: req.user._id }
        ]
    })
        .populate('sender', 'name ')
        .populate('reciever', 'name')
        .populate('senderSkill', 'title level')
        .populate('recieverSkill', 'title level')
    res.status(200).json({ request })
})

const acceptRequest = asyncHandler(async (req, res) => {
    const request = await ExchangeRequestModel.findById(req.params.id)
    if (!request) return res.status(404).json({ message: "no such request exists" })

    if (req.user._id.toString() !== request.reciever.toString()) {
        return res.status(401).json({ message: "unauthorised access" })
    }
    if (request.status !== "pending") {
        return res.status(404).json({ message: "already accepted ya declined request dobara accept nahi ho sakti" })
    }
    const user = await userModel.findById(request.reciever)
    if(request.requestType==="coin-exchange"){
        await userModel.findByIdAndUpdate(
            request.reciever,
            {$inc:{skillCoins:+request.coinAmount}},
            {new:true}
        )
    }
    const roomID = crypto.randomUUID();
    request.status = "accepted";
    request.roomId = roomID
    await request.save()
    return res.status(200).json({
        message: "request is accepted",
        roomId: roomID
    })
})

const declineRequest = asyncHandler(async (req, res) => {
    //obviously reciever pr right hoga request accept or reject krne ka 
    //we gonna fetch reciever
    const request = await ExchangeRequestModel.findById(req.params.id)
    if (!request) return res.status(404).json({ message: "no such request exists" })
    if (request.reciever.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "unauthorised access" })
    }
    if (request.status !== "pending") {
        return res.status(400).json({ message: "already accepted ya declined request dobara accept nahi ho sakti" })
    }

    if(request.requestType==="coin-exchange"){
        await userModel.findByIdAndUpdate(
            request.sender,
            {$inc:{skillCoins:+request.coinAmount}},
            {new:true}
        )
    }
    request.status = "declined";
    await request.save();
    res.status(200).json({ message: "request declined" })
})

const markCompleted = asyncHandler(async (req, res) => {
    //sender and reciever both can mark complete
    const request = await ExchangeRequestModel.findById(req.params.id)
    if (!request) return res.status(404).json({ message: "no such request exists" })
    if (req.user._id.toString() !== request.sender.toString() && req.user._id.toString() !== request.reciever.toString()) {
        return res.status(403).json({ message: "unauthorised access" })
    }
    if (request.status !== "accepted") { //sirf accepted request hi to complete mark ho sakti hai 
        return res.status(400).json({ message: "already pending ya declined request complete nahi ho sakti" })
    }
    request.status = "completed";
    // dono ko +5 score do
await userModel.findByIdAndUpdate(request.sender, {
    $inc: { reliabilityScore: 5 }
})

await userModel.findByIdAndUpdate(request.reciever, {
    $inc: { reliabilityScore: 5 }
})
    await request.save();
    res.status(200).json({ message: "exchange request completed" })
})

const getRoomToken = asyncHandler(async (req, res) => {
    const request = await ExchangeRequestModel.findById(req.params.id)
    if (!request) return res.status(404).json({ message: "no such request exists" })
    if (req.user._id.toString() !== request.sender.toString() && req.user._id.toString() !== request.reciever.toString()) {
        return res.status(403).json({ message: "unauthorised access" })
    }
    if (request.status !== "accepted") { //sirf accepted request hi room id do 
        return res.status(400).json({ message: "already pending ya declined request complete nahi ho sakti" })
    }
    return res.status(200).json({
        message: "room is about to start",
        roomId: request.roomId
    })
})

module.exports = { sendRequest, getMyAllRequests, acceptRequest, declineRequest, markCompleted, getRoomToken }