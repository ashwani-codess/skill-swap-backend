const mongoose = require("mongoose")

const reviewSchema = new mongoose.Schema({
    reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "u need to specify yourself"]

    },
    reviewee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "u need to specify whom u are rating"]
    },
    exchangeRequest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ExchangeRequest",
        required: [true]
    },
    rating: {
        type: Number,
        enum: [1, 2, 3, 4, 5]
    },
    comment: {
        type: String
    }, didKnowSubject: { type: Boolean, default: null },
    explainedClearly: { type: Boolean, default: null }

}, { timestamps: true })



reviewSchema.index({ reviewer: 1, exchangeRequest: 1 }, { unique: true })
// Yeh MongoDB ko bolta hai ki ek reviewer ek exchangeRequest pe sirf ek hi review de sakta hai — same combination dobara aaye toh automatically error throw karega.

// 1 ka matlab ascending order mein index banao — performance ke liye hota hai.



const Review = mongoose.model('Review', reviewSchema)
module.exports = Review