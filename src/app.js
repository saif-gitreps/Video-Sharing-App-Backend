require("dotenv").config;
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json({ limit: "16KB" }));
// Extended true means sometimes we have nested objects in our requests,for that.
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

// routes import.
const userRoutes = require("./routes/user.routes");
const videoRoutes = require("./routes/video.routes");

// routes declaration.
// we have to add these versioning as it is RESTful api good practise.
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/videos", videoRoutes);

module.exports = app;
