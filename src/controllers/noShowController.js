const userModel = require("../models/user.model");
const ExchangeRequestModel = require("../models/exchangeRequest.model");
const noShowReportModel = require("../models/noShowReport.model");
const asyncHandler = require("../utils/asyncHandler"); // ← add karo

const reportUser = asyncHandler(async (req, res) => {
  const requestID = req.params.id;

  const request = await ExchangeRequestModel.findById(requestID);

  if (!request)
    return res.status(404).json({ message: "no such exchangeRequest exists" });

  if (request.status !== "accepted")
    return res
      .status(400)
      .json({
        message: "reciever should accept ur request before u report him ",
      });

  const reportedBy = req.user._id;

  // Agar TUM sender ho → tum receiver ko report kar rahe ho
  // Agar TUM receiver ho → tum sender ko report kar rahe ho
  // reporter sender ya receiver hai ya nahi check karo
  if (
    reportedBy.toString() !== request.sender.toString() &&
    reportedBy.toString() !== request.reciever.toString()
  ) {
    return res.status(403).json({ message: "unauthorised" });
  }

  let reportedUser;

  if (reportedBy.toString() === request.sender.toString()) {
    reportedUser = request.reciever; // reporter sender hai toh reported = receiver
  } else {
    reportedUser = request.sender; // reporter receiver hai toh reported = sender
  }

  const alreadyReported = await noShowReportModel.findOne({
    exchange: requestID,
    reportedBy,
  });
  if (alreadyReported)
    return res.status(400).json({ message: "already reported" });

  await noShowReportModel.create({
    exchange: requestID,
    reportedBy,
    reportedUser,
  });

  await userModel.findByIdAndUpdate(reportedUser, {
    $inc: { reliabilityScore: -15, noShowCount: 1 },
  });

  res.status(200).json({ message: "user reported successfully" });
});

module.exports = { reportUser };
