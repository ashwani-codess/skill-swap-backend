const express = require("express")
const coinController = require("../controllers/claimCoin.controller")
const { authMiddleware } = require("../middleware/auth.middleware")
const router = express.Router()

router.post("/claim", authMiddleware, coinController.claimCoin)
router.get("/balance", authMiddleware, coinController.getBalance)

module.exports = router