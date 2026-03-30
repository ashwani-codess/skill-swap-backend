const express= require("express");
const cookieParser= require("cookie-parser")


const authRouter= require("./routes/auth.routes")
const skillRouter= require("./routes/skill.routes")
const exchangeRouter= require("./routes/exchange.routes")
const errorHandler = require('./middleware/errorHandler')
const reviewRouter = require("./routes/reviewRoutes")
const coinRouter = require("./routes/coin.routes")
const verifyRouter = require("./routes/verify.routes")

const app= express();

app.use(express.json()); //will  allow our server to read body

app.use(cookieParser()); // will allow our server to read our cookies

app.use("/api/auth",authRouter)

app.use("/api/skills", skillRouter)

app.use("/api/exchanges", exchangeRouter)

app.use("/api/reviews", reviewRouter)

app.use("/api/coins", coinRouter)

app.use("/api/verify", verifyRouter)

app.use(errorHandler)

module.exports=app;