require("dotenv").config();
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/async-handler");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const verifyJWT = asyncHandler(async (req, res, next) => {
   try {
      const token =
         req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

      if (!token) {
         throw new ApiError(401, "Unauthorized Req");
      }
      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

      const user = await User.findById(decodedToken?._id).select(
         "-password -refreshToken"
      );

      if (!user) {
         throw new ApiError(401, "Invalid access credentials");
      }
      req.user = user;
      next();
   } catch (error) {
      throw new ApiError(401, "Invalid token");
   }
});

module.exports = verifyJWT;
