const asyncHandler = require("../utils/async-handler");
const ApiError = require("../utils/ApiError");
const User = require("../models/user.model");
const {
   uploadOnCloudinary,
   deleteFromCloudinary,
   retrievePublicIdFromUrl,
} = require("../utils/cloudinary");
const ApiResponse = require("../utils/ApiResponse");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

async function generateAccessAndRefreshToken(userId) {
   try {
      const user = await User.findById(userId);
      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();

      user.refreshToken = refreshToken;
      await user.save({ validateBeforeSave: false });

      return {
         accessToken,
         refreshToken,
      };
   } catch (error) {
      throw new ApiError(
         500,
         "Something went wrong while generating access and refresh tokens"
      );
   }
}

const register = asyncHandler(async (req, res, next) => {
   const { fullname, username, email, password } = req.body;
   if (
      [fullname, username, email, password].some((fields) => {
         return fields === undefined || fields?.trim() === "";
      })
   ) {
      throw new ApiError(400, "Please fill all fields");
   }

   const existingUser = await User.findOne({ $or: [{ email }, { username }] });

   if (existingUser) {
      // 409 status code for conflict.
      throw new ApiError(409, "User already exists");
   }

   const avatarLocalPath = req.files?.avatar[0]?.path;

   let coverImageLocalPath;
   if (
      req.files &&
      Array.isArray(req.files.coverImage) &&
      req.files.coverImage.length > 0
   ) {
      coverImageLocalPath = req.files.coverImage[0].path;
   }

   if (!avatarLocalPath) {
      throw new ApiError(400, "Please upload avatar");
   }

   const uploadedAvatar = await uploadOnCloudinary(avatarLocalPath);
   const uploadedCoverImage = await uploadOnCloudinary(coverImageLocalPath);

   // if we fail to upload it on cloudinary then we throw an error.
   if (!uploadedAvatar) {
      throw new ApiError(500, "Failed to upload avatar");
   }

   const user = await User.create({
      fullname: fullname,
      avatar: uploadedAvatar.url,
      //  not mandatory that to have a cover image , no cover im, no probs.
      coverImage: uploadedCoverImage?.url || "",
      email: email,
      username: username.toLowerCase(),
      password: password,
   });

   const createdUser = await User.findById(user._id).select("-password -refreshToken");

   if (!createdUser) {
      throw new ApiError(500, "Something went during User registration.");
   }

   return res
      .status(201)
      .json(new ApiResponse(200, createdUser, "User was successfully registered"));
});

const loginUser = asyncHandler(async (req, res) => {
   const { email, password } = req.body;

   if (!email) {
      throw new ApiError(400, "email is required");
   }

   let existingUser = await User.findOne({
      $or: [{ email }],
   });

   if (!existingUser) {
      throw new ApiError(404, "User does not exist");
   }

   const check = await existingUser.isPasswordValid(password);
   if (!check) {
      throw new ApiError(401, "Incorrect password, Try again!");
   }

   // using our custom func from the top
   const { refreshToken, accessToken } = await generateAccessAndRefreshToken(
      existingUser._id
   );

   existingUser = await User.findById(existingUser._id).select("-password -refreshToken");

   const options = {
      httpOnly: true,
      secure: true,
   };

   return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
         new ApiResponse(
            200,
            {
               user: existingUser,
               accessToken,
               refreshToken,
            },
            "User logged in successfully"
         )
      );
});

const logoutUser = asyncHandler(async (req, res) => {
   await User.findByIdAndUpdate(
      req.user._id,
      {
         $unset: {
            refreshToken: 1,
         },
      },
      {
         new: true,
      }
   );
   const options = {
      httpOnly: true,
      secure: true,
   };

   return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
   const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

   if (!incomingRefreshToken) {
      throw new ApiError(401, "Unauthorized request");
   }
   try {
      const decodedToken = jwt.verify(
         incomingRefreshToken,
         process.env.REFRESH_TOKEN_SECRET
      );

      const user = await User.findById(decodedToken?._id);

      if (!user) {
         throw new ApiError(401, "Invalid refresh token");
      }

      if (incomingRefreshToken !== user.refreshToken) {
         throw new ApiError(401, "Refresh token is expired or Invalid");
      }

      const options = {
         httpOnly: true,
         secure: true,
      };

      const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(
         user._id
      );

      console.log("Access token refreshing");

      return res
         .status(200)
         .cookie("accessToken", accessToken, options)
         .cookie("refreshToken", newRefreshToken, options)
         .json(
            new ApiResponse(
               200,
               { accessToken, newRefreshToken },
               "accessToken refreshed!"
            )
         );
   } catch (error) {
      throw new ApiError(401, "Invalid refreshToken");
   }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
   const { oldPassword, newPassword } = req.body;

   const user = await User.findById(req.user?._id);

   const isPasswordCorrect = await user.isPasswordValid(oldPassword);

   if (!isPasswordCorrect) {
      throw new ApiError(400, "Invalid current password");
   }
   user.password = newPassword;
   // dont want another validation just for save
   await user.save({ validateBeforeSave: false });

   return res.status(200).json(new ApiResponse(200, {}, "Password changed successfuly"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
   return res
      .status(200)
      .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
   // will add more fields according to the frontend.
   const { fullname, username, watchHistory, email } = req.body;

   const updatedUser = await User.findByIdAndUpdate(
      req.user?._id,
      {
         $set: {
            fullname,
            username,
            watchHistory,
            email,
         },
      },
      {
         new: true,
      }
   ).select("-password");

   return res
      .status(200)
      .json(new ApiResponse(200, updatedUser, "User details updated successfully"));
});

// making another endpoints for file updatation.
const updateUserAvatar = asyncHandler(async (req, res) => {
   const avatarLocalPath = req.file?.path;

   if (!avatarLocalPath) {
      throw new ApiError(400, "Avatar missing!");
   }

   let user = await User.findById(req.user._id);

   // deleting the previous avatar.
   if (user.avatar) {
      await deleteFromCloudinary(retrievePublicIdFromUrl(user.avatar).trim());
   }

   const avatar = await uploadOnCloudinary(avatarLocalPath);

   if (!avatar.url) {
      throw new ApiError(400, "Error retrieving avatar url");
   }

   user = await User.findByIdAndUpdate(
      req.user._id,
      {
         $set: {
            avatar: avatar.url,
         },
      },
      {
         new: true,
      }
   ).select("-password");

   // [update i did save the user object and returned it]
   return res.status(200).json(new ApiResponse(200, user, "Avatar updated successfully"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
   const coverImageLocalPath = req.file?.path;

   if (!coverImageLocalPath) {
      throw new ApiError(400, "Cover Image missing!");
   }

   let user = await User.findById(req.user._id);

   if (user.coverImage) {
      await deleteFromCloudinary(retrievePublicIdFromUrl(user.coverImage).trim());
   }

   const coverImage = await uploadOnCloudinary(coverImageLocalPath);

   if (!coverImage.url) {
      throw new ApiError(400, "Error retrieving coverImage url");
   }

   user = await User.findByIdAndUpdate(
      req.user._id,
      {
         $set: {
            coverImage: coverImage.url,
         },
      },
      {
         new: true,
      }
   ).select("-password");

   return res
      .status(200)
      .json(new ApiResponse(200, user, "Cover image updated successfully"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
   const { username } = req.params;

   if (!username?.trim()) {
      throw new ApiError(400, "Username missing");
   }

   const channel = await User.aggregate([
      {
         $match: {
            username: username?.toLowerCase(),
         },
      },
      {
         $lookup: {
            from: "subscriptions",
            localField: "_id",
            foreignField: "channel",
            as: "subscribers",
         },
      },
      {
         $lookup: {
            from: "subscriptions",
            localField: "_id",
            foreignField: "subscriber",
            as: "subscribedTo",
         },
      },
      {
         $addFields: {
            subscribersCount: {
               $size: "$subscribers",
            },
            channelsSubscribedToCount: {
               $size: "$subscribedTo",
            },
            isSubscribed: {
               $cond: {
                  // if the guy checking out the channel is subscribed to the guy getting checked out.
                  if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                  then: true,
                  else: false,
               },
            },
         },
      },
      {
         $project: {
            fullname: 1,
            username: 1,
            subscribersCount: 1,
            channelsSubscribedToCount: 1,
            isSubscribed: 1,
            avatar: 1,
            coverImage: 1,
            email: 1,
         },
      },
   ]);

   if (!channel?.length) {
      throw new ApiError(404, "channel does not exists");
   }

   return res
      .status(200)
      .json(new ApiResponse(200, channel[0], "User channel fetched successfully"));
});

const getWatchHistory = asyncHandler(async (req, res) => {
   const user = await User.aggregate([
      {
         $match: {
            _id: new mongoose.Types.ObjectId(req.user._id),
         },
      },
      {
         $lookup: {
            from: "videos",
            localField: "watchHistory",
            foreignField: "_id",
            as: "watchHistory",
            // we need nested pipline because we need information of the owner
            // of the video that will be retrieved.
            pipeline: [
               {
                  $lookup: {
                     from: "users",
                     localField: "owner",
                     foreignField: "_id",
                     as: "owner",
                     // now here we used another pipeline to bring this entire thing into one
                     pipeline: [
                        {
                           $project: {
                              username: 1,
                              fullname: 1,
                              avatar: 1,
                           },
                        },
                     ],
                  },
               },
               {
                  // de constructing the array
                  $addFields: {
                     owner: {
                        $first: "$owner",
                     },
                  },
               },
            ],
         },
      },
   ]);

   return res
      .status(200)
      .json(new ApiResponse(200, user[0].watchHistory, "Fetched watch history"));
});

const updateWatchHistory = asyncHandler(async (req, res) => {
   const userId = req.user._id;
   const { videoId } = req.body;

   await User.findByIdAndUpdate(new mongoose.Types.ObjectId(userId), {
      $addToSet: { watchHistory: videoId },
   });

   return res.status(200).json(new ApiResponse(200, {}, "Updated watch history"));
});

const deleteVideoFromHistory = asyncHandler(async (req, res) => {
   const { videoId } = req.body;
   const userId = req.user._id;

   await User.findByIdAndUpdate(userId, {
      $pull: {
         watchHistory: videoId,
      },
   });

   return res.status(200).json(new ApiResponse(200, {}, "Video removed from history"));
});

module.exports = {
   register,
   loginUser,
   logoutUser,
   refreshAccessToken,
   changeCurrentPassword,
   getCurrentUser,
   updateAccountDetails,
   updateUserAvatar,
   updateUserCoverImage,
   getUserChannelProfile,
   getWatchHistory,
   updateWatchHistory,
   deleteVideoFromHistory,
};
