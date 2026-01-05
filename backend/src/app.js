const express = require("express");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
dotenv.config();

const { handle404Error, handleGlobalError, syncConfigHandler } = require("./middlewares");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { v1Routes } = require("./routes/v1");
const { cors } = require("./config");
const path = require("path");
const app = express();

app.use(helmet());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(limiter);

app.use(cors)
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(cookieParser());

app.use("/api/v1", v1Routes);

app.use(handle404Error);
app.use(handleGlobalError);
syncConfigHandler();

module.exports = { app };
