const userModel = require("../models/user.model")
const reviewModel = require("../models/reviewModel")
const exchangeModel = require("../models/exchangeRequest.model");
const asyncHandler = require("../utils/asyncHandler")
const skillModel = require("../models/Skill.model")


const createReview = asyncHandler(async (req, res) => {

    const { reviewee, exchangeRequest, rating, comment, didKnowSubject, explainedClearly, skillId } = req.body;
    const reviewer = req.user._id
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ message: "rating must be between 1 and 5" })
    const request = await exchangeModel.findById(exchangeRequest);


    if (reviewer.toString() === reviewee.toString()) {  //avoid Self Review
    return res.status(400).json({ message: "You cannot review yourself" })
}


    if (  //reviewee sirf wahi ho sakta hai jo is exchange mein tha — koi random user nahi.
        reviewee.toString() !== request.sender.toString() &&
        reviewee.toString() !== request.reciever.toString()
    ) {
        return res.status(400).json({ message: "Invalid reviewee" })
    }



    if (!request) return res.status(404).json({ message: "no such request exists" })
    const existing = await reviewModel.findOne({ reviewer, exchangeRequest })
    if (existing) return res.status(400).json({ message: "You already reviewed this exchange" })

    if (request.status !== "completed") return res.status(400).json({ message: "reviews can be only given to completed exchanges" })
    if (reviewer.toString() !== request.sender.toString() && reviewer.toString() !== request.reciever.toString()) {
        return res.status(403).json({ message: "unauthorised access" })
    }
    const review = await reviewModel.create({
        reviewer, reviewee, exchangeRequest, rating, comment, didKnowSubject, explainedClearly
    })

    // User ki average rating update karo
    const allReviews = await reviewModel.find({ reviewee })
    const average = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length

    await userModel.findByIdAndUpdate(reviewee, {
        'rating.average': Number(average.toFixed(1)),
        'rating.count': allReviews.length
    })

    if (rating === 5 || rating === 4) {

        await userModel.findByIdAndUpdate(
            reviewee,
            { $inc: { reliabilityScore: 2 },
            $min: { reliabilityScore: 100 } }

        )
    }
    if (rating === 1 || rating === 2) {

        await userModel.findByIdAndUpdate(
            reviewee,
            { $inc: { reliabilityScore: -3 } }

        )
    }



    // peer verification threshold check
    const totalReviews = allReviews.length
    const yesCount = allReviews.filter(r => r.didKnowSubject === true).length
    const yesPercentage = yesCount / totalReviews

    if (totalReviews >= 3 && average >= 3.5 && yesPercentage >= 0.7) {
        const skill = await skillModel.findById(skillId)
        if (skill && skill.owner.toString() === reviewee.toString() && !skill.isVerified) {
            skill.isVerified = true
            await skill.save()
        }
    }

    res.status(201).json({ review })



})

const getUserReviews = asyncHandler(async (req, res) => {
    const reviews = await reviewModel.find({ reviewee: req.params.userId })
        .populate('reviewer', 'name avatar')

    res.status(200).json({ reviews })
})


module.exports = { createReview, getUserReviews }