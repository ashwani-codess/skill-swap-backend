const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const authRouter = require("./routes/auth.routes");
const skillRouter = require("./routes/skill.routes");
const exchangeRouter = require("./routes/exchange.routes")
const reviewRouter = require("./routes/reviewRoutes");
const coinRouter = require("./routes/coin.routes");
const verifyRouter = require("./routes/verify.routes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// =======================
// Middleware
// =======================

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

// =======================
// Routes
// =======================
app.use("/api/auth", authRouter);
app.use("/api/skills", skillRouter);
app.use("/api/exchanges", exchangeRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/coins", coinRouter);
app.use("/api/verify", verifyRouter);

// =======================
// Error Handler
// =======================

app.use(errorHandler);

module.exports = app;
