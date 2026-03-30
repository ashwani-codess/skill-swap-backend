const express = require("express")
const { startVerification, submitVerification } = require("../controllers/verification.controller")
const { authMiddleware } = require("../middleware/auth.middleware")
const router = express.Router()

router.post("/:id/start", authMiddleware, startVerification)
router.post("/:id/submit", authMiddleware, submitVerification)

module.exports = router