require("dotenv").config();
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/async-handler");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

// i have to do some research on why we are setting try block although we have an async handler.
const verifyJWT = asyncHandler(async (req, res, next) => {
   try {
      // we are accessing our cookie , we are able to do this because we are using
      // cookie-parser middleware.

      // here we either check if coookies exists or when a user might be sending req through mobile app
      // or when using postman, we will have this header where Authorization as key and Bearer <token>
      // as value may exist, we can grab the accessToken that way as well.
      const token =
         req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

      if (!token) {
         throw new ApiError(401, "Unauthorized Req");
      }

      // we use jwt object's methods to retreive the infos from the cookies.
      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

      // if you see the User model , then while creating the jwt access token we passed _id and etc.
      const user = await User.findById(decodedToken?._id).select(
         "-password -refreshToken"
      );

      if (!user) {
         throw new ApiError(401, "Invalid access credentials");
      }

      // now one imp thing is , we know we are making this request go through a middleware first,
      // before it hits our controller. so take access of the req object and and we create a new object
      // of the user that we have just retrieved . now another imp thing, since this is a middleware we
      // have to use next() to indicate that this middleware has finished its operation,
      // lets move to the next middleware inline/inorder.
      req.user = user;
      next();
   } catch (error) {
      throw new ApiError(401, "Invalid token");
   }
});

// const verifyJWT = asyncHandler(async (req, res, next) => {
//    const token =
//       req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

//    if (!token) {
//       throw new ApiError(401, "Unauthorized Req");
//    }

//    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

//    const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

//    if (!user) {
//       throw new ApiError(401, "Invalid access credentials");
//    }

//    req.user = user;
//    next();
// });

module.exports = verifyJWT;
