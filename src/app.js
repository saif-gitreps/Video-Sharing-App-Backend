require("dotenv").config;
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json({ limit: "16KB" }));

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

const userRoutes = require("./routes/user.routes");
const videoRoutes = require("./routes/video.routes");
const postRoutes = require("./routes/post.routes");

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/videos", videoRoutes);
app.use("/api/v1/posts", postRoutes);

module.exports = app;
