const express = require("express")
const reviewController = require("../controllers/review.controller")
const { authMiddleware } = require("../middleware/auth.middleware")
const router = express.Router()

router.post("/", authMiddleware, reviewController.createReview)
router.get("/user/:userId", reviewController.getUserReviews)

module.exports = router
