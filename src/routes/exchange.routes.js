const express = require("express");
const exchangeController = require("../controllers/exchangeRequest.controller")
const {authMiddleware}= require("../middleware/auth.middleware")
const reportController = require("../controllers/noShowController")
const router = express.Router();

router.post("/", authMiddleware, exchangeController.sendRequest)
router.get("/myRequest", authMiddleware, exchangeController.getMyAllRequests)
router.put("/:id/accept", authMiddleware, exchangeController.acceptRequest)
router.put("/:id/decline", authMiddleware, exchangeController.declineRequest)
router.put("/:id/complete", authMiddleware, exchangeController.markCompleted)
router.get("/:id/room", authMiddleware, exchangeController.getRoomToken)
router.post("/:id/no-show", authMiddleware, reportController.reportUser)
module.exports=router