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

// since we are going to use the customer methods for generating access and refresh tokens.
// its best practice to make a method for that.
// would be a best practise to move this to util folders as well. might do that later.
async function generateAccessAndRefreshToken(userId) {
   try {
      const user = await User.findById(userId);
      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();

      // we are saving the refresh token in the dbs, since we have defined that refreshToken
      // property in the model.
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
   // To Do:
   // get use details from frontend.
   // validations.
   // check existing users.
   // check avatar.
   // upload them to cloudinary and retreive the url and check avatar.
   // create user object using model.
   // remove password and refresh token field from response.

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
      // 409 is the status code for conflict.
      throw new ApiError(409, "User already exists");
   }
   /*
   req.files?: It checks if req.files is defined before attempting to access the avatar property. 
   If req.files is undefined or null, the expression short-circuits, 
   and avatarLocalPath becomes undefined.

   ?.avatar[0]?: It checks if avatar is defined on the result of req.files. 
   If avatar is not defined or is null, the expression short-circuits again, 
   and avatarLocalPath remains undefined.

   ?.path: Finally, it checks if the first element of the avatar array has a path property. 
   If the array is empty, or if path is not defined on the first element, 
   the expression short-circuits, and avatarLocalPath remains undefined.

   It's a concise way to handle potentially missing properties in 
   nested structures without having to manually check each level for existence. 
   The overall expression evaluates to undefined if any part of the chain is not present.
  */

   // here we are grabbing the path of the avatar image that we have uploaded to the server.
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

   // now we have to upload this image to cloudinary.
   const uploadedAvatar = await uploadOnCloudinary(avatarLocalPath);
   const uploadedCoverImage = await uploadOnCloudinary(coverImageLocalPath);

   // if we fail to upload it on cloudinary then we throw an error.
   if (!uploadedAvatar) {
      throw new ApiError(500, "Failed to upload avatar");
   }

   // when we create a doc, mongodb will return the _id in this user variable.
   const user = await User.create({
      fullname: fullname,
      avatar: uploadedAvatar.url,
      // here its not mandatory that we have a cover image , so we check if its not
      // undefined then we set the url by which is stored in cloudinary or we just keep it empty.
      coverImage: uploadedCoverImage?.url || "",
      email: email,
      username: username.toLowerCase(),
      password: password,
   });

   // we want to exclude password and refresh token, so we use this select method.
   // by default it selects everything so we use this weird syntax to select which
   // all properties from that object we want to exclude.
   const createdUser = await User.findById(user._id).select("-password -refreshToken");

   if (!createdUser) {
      throw new ApiError(500, "Something went during User registration.");
   }

   return res
      .status(201)
      .json(new ApiResponse(200, createdUser, "User was successfully registered"));
});

const loginUser = asyncHandler(async (req, res) => {
   // To do:
   // take data from req.body
   // username or emaill
   // check existing user.
   // if exists, then check password else throw err
   // if true , then add access and refresh.
   // send cookie
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

   // we are gonna use our custom methods that we defined.
   // while using  User (our model) methods, we are using pre-existing mongoose/method methods.
   // so when we wanna use our custom methods we use the 'existingUser' object in which
   // the data loaded from the dbs is stored.

   const check = await existingUser.isPasswordValid(password);
   if (!check) {
      throw new ApiError(401, "Incorrect password, Try again!");
   }

   // rule of thumb, anything that we may know will take time , needs to be awaited.
   const { refreshToken, accessToken } = await generateAccessAndRefreshToken(
      existingUser._id
   );

   // we want to send some data as resposne.
   // now we did save the refreshToken in the dbs of this user when we made that call.
   // but the current 'user' object in this scope does not have it inside.
   // we could add that property or we could make a dbs call, here the latter is done, but
   // practically i would just test it and modify the 'user' object and update the properties over here.

   existingUser = await User.findById(existingUser._id).select("-password -refreshToken");

   // designing some options for our cookies.
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
   // now we will update the refresh token and reset it or make it undefined/null.
   await User.findByIdAndUpdate(
      req.user._id,
      {
         // [update , which ever field you want to unset it just set it to 1]
         $unset: {
            refreshToken: 1,
         },
      },
      {
         // this paramter will return the newly updated response to be able to store in
         // a variable but we are not storing right now for updating.
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

// so idea is that , when this access token expires, instead of telling the user to
// re login, the frontend UI will instead allow the user to hit some endpoint/url such that
// the accessToken be refreshed. in this endpoint we will compare the refreshtoken at the database
// and the refresh token of the user to give the user a new accessToken.

const refreshAccessToken = asyncHandler(async (req, res) => {
   // this or is for mobile users , lets say their token is in the body.
   const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

   if (!incomingRefreshToken) {
      throw new ApiError(401, "Unauthorized request");
   }

   // now this try block is not necessary but it is a cautinionary move.
   // also i still have doubts about why we should use even use try block since we have async handler.
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

   // We will make this route go through verifyJWT middleware.
   // from there if you see again , we sent user object on the req.body.
   // the other way to get user id would be to take access of our cookie.

   const user = await User.findById(req.user?._id);

   const isPasswordCorrect = await user.isPasswordValid(oldPassword);

   if (!isPasswordCorrect) {
      throw new ApiError(400, "Invalid current password");
   }

   // [When we are making a change in this user object, the isModified password is triggered]
   user.password = newPassword;
   //If you're updating a document and only want to modify
   //certain fields without validating the entire document.
   await user.save({ validateBeforeSave: false });

   return res.status(200).json(new ApiResponse(200, {}, "Password changed successfuly"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
   // since this route will also go through the verifyJWT middle ware.
   // the req will have the user object.
   return res
      .status(200)
      .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
   // add as many fields as you need.
   const { fullname, username } = req.body;

   if (!fullname || !username) {
      throw new ApiError(400, "Please dont fields empty");
   }

   const updatedUser = await User.findByIdAndUpdate(
      req.user?._id,
      {
         $set: {
            fullname: fullname,
            username: username,
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

// making another endpoint for file updatation.
const updateUserAvatar = asyncHandler(async (req, res) => {
   const avatarLocalPath = req.file?.path;

   if (!avatarLocalPath) {
      throw new ApiError(400, "Avatar missing!");
   }

   // deleting the previous avatar.
   // now i could do this in an efficient way without much call of dbs
   // but for the sake of understanding i will make a dbs call.
   let user = await User.findById(req.user._id);

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

   // now note that i didint save the user object and return the details on purpose
   // tho you can if you wanted.
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
   // this one we are taking from the url.
   const { username } = req.params;

   if (!username?.trim()) {
      throw new ApiError(400, "Username missing");
   }

   // using aggregation pipelines.
   // each object inside the this array is a stage of the pipline.
   const channel = await User.aggregate([
      {
         // like filtering.
         $match: {
            username: username?.toLowerCase(),
         },
      },
      {
         // look up is like asking which fields to take.
         // so it goes like , lets say we want to view a channel, we click the profile,
         // now we will do a join with user and subscription collection.
         // here local field is the _id of the user document
         // foreing field is the channel id and AS is like SQL alias.
         $lookup: {
            from: "subscriptions",
            localField: "_id",
            foreignField: "channel",
            as: "subscribers",
         },
      },
      {
         // now this one is for whichever channel this channel has subscribed to
         $lookup: {
            from: "subscriptions",
            localField: "_id",
            foreignField: "subscriber",
            as: "subscribedTo",
         },
      },
      {
         // similar to the one you do in SQL where we cal then add an alias for that.
         $addFields: {
            subscribersCount: {
               $size: "$subscribers",
            },
            channelsSubscribedToCount: {
               $size: "$subscribedTo",
            },
            isSubscribed: {
               // this cond field has 3 field if then else.
               $cond: {
                  // so this is basically checking me as a user is in the subscriber fields of the guy's profile i am looking at.
                  if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                  then: true,
                  else: false,
               },
            },
         },
      },
      {
         // project is like telling whatever you wanted to retrieve.
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
      .json(new ApiResponse(200, channel[0], "User channe fetched successfully"));
});

const getWatchHistory = asyncHandler(async (req, res) => {
   const user = await User.aggregate([
      {
         $match: {
            // note: here mongoose dosnet work so have to give the mongodb original id.
            // but there is mongoose method for tht
            _id: new mongoose.Types.ObjectId(req.user._id),
         },
      },
      {
         $lookup: {
            // the Video model will have collection name of videos and so on for all collections.
            from: "videos",
            localField: "watchHistory",
            foreignField: "_id",
            as: "watchHistory",
            // this is how we add nested pipline
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
                     // value, experiment it and see what would happen if we had given this pipeline outside this lookup
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
                  // now note that the owner pipeline will return an array,
                  // though it will only reutrn 1 value in the array,
                  // we create a new field and store the first value from that array.
                  // overwriting array field.
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
};
