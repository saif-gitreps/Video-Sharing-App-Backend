const asyncHandler = require("../utils/async-handler");
const ApiError = require("../utils/ApiError");
const Like = require("../models/likes.model");
const Video = require("../models/video.model");
const Post = require("../models/post.model");
const ApiResponse = require("../utils/ApiResponse");
const mongoose = require("mongoose");

const getLikedVideo = asyncHandler(async (req, res) => {
   const userId = req.user._id;

   const likedVideos = await Like.aggregate([
      {
         $match: {
            likedBy: new mongoose.Types.ObjectId(userId),
         },
      },
      {
         $lookup: {
            from: "videos",
            localField: "video",
            foreignField: "_id",
            as: "video",
            pipeline: [
               {
                  $lookup: {
                     from: "users",
                     localField: "owner",
                     foreignField: "_id",
                     as: "owner",
                     pipeline: [
                        {
                           $project: {
                              username: 1,
                              avatar: 1,
                           },
                        },
                     ],
                  },
               },
               {
                  $unwind: "$owner",
               },
            ],
         },
      },
      {
         $unwind: "$video",
      },
      {
         $project: {
            _id: 0,
            video: {
               _id: 1,
               title: 1,
               views: 1,
               thumbnail: 1,
               createdAt: 1,
               owner: 1,
            },
         },
      },
   ]);
});
