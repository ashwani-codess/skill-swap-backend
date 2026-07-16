const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const asyncHandler = require("../utils/asyncHandler");

const userRegistrationController = asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;
  const isExists = await userModel.findOne({ email: email });
  if (isExists) {
    return res.status(422).json({
      message: "user already exists",
      status: "failed",
    });
  }

  const user = await userModel.create({
    email,
    name,
    password,
  });

  //"Auto Login after Register"
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });

  res.cookie("jwt_token", token); // Browser ke liye
  res.status(201).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
    token: token, // Mobile App ke liye
  });
});

const userLoginController = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email }).select("+password");
  if (!user) {
    return res.status(401).json({
      message: "email o password is invalid",
    });
  }
  const isValidPassword = await user.comparePassword(password);
  if (!isValidPassword) {
    return res.status(401).json({
      message: "wrong password for this email",
    });
  }
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });
  res.cookie("jwt_token", token);
  res.status(200).json({
    message: "logged in successfully",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
    token: token,
  });
});

const userLogoutController = asyncHandler(async (req, res) => {
  const token =
    req.cookies.jwt_token || req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(400).json({
      message: "already logged out ",
    });
  }
  res.clearCookie("jwt_token");
  res.status(200).json({
    message: "user logged out successfully",
  });
});

module.exports = {
  userRegistrationController,
  userLoginController,
  userLogoutController,
};
