const asyncHandler = require("../utils/async-handler");
const ApiError = require("../utils/ApiError");
const Video = require("../models/video.model");
const Like = require("../models/likes.model");
const Post = require("../models/post.model");
const subscription = require("../models/subscription.model");
const ApiResponse = require("../utils/ApiResponse");
const mongoose = require("mongoose");

const getChannelStats = asyncHandler(async (req, res) => {
   const channelId = req.user._id;

   const stats = {
      numberOfSubscribers: 0,
      numberOfChannelsSubscribed: 0,
      numberOfVideos: 0,
      totalViews: 0,
      totalLikes: 0,
   };

   const subscriptions = await subscription.find({ channel: channelId });
   stats.numberOfSubscribers = subscriptions.length;

   const channelsSubscribed = await subscription.find({ subscriber: channelId });
   stats.numberOfChannelsSubscribed = channelsSubscribed.length;

   const videos = await Video.find({ owner: channelId });
   stats.numberOfVideos = videos.length;

   videos.forEach((video) => {
      stats.totalViews += video.view;
   });

   const likes = await Like.find({ owner: channelId });
   stats.totalLikes = likes.length;

   const posts = await Post.find({ owner: channelId });
   stats.totalCommunityPosts = posts.length;

   return res
      .status(200)
      .json(new ApiResponse(200, stats, "Channel stats fetched successfully"));
});

const getChannelVideos = asyncHandler(async (req, res) => {
   const { page = 1, limit = 6, sortBy, sortType, channelId } = req.params;

   const sort = {};
   if (sortBy && (parseInt(sortType) === 1 || parseInt(sortType) === -1)) {
      sort[sortBy] = parseInt(sortType);
   } else {
      // if no sort by was sent, then ill sort it by recent.
      sort["createdAt"] = 1;
   }

   const skip = (page - 1) * limit;

   const videos = await Video.aggregate([
      {
         $match: {
            owner: new mongoose.Types.ObjectId(channelId),
         },
      },
      {
         $sort: sort,
      },
      {
         $skip: skip,
      },
      {
         $limit: limit,
      },
      {
         $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "owner",
         },
      },
      {
         // another way of de constructing the array it seems.
         $unwind: "$owner",
      },
      {
         $project: {
            _id: 1,
            videoFile: 1,
            thumbnail: 1,
            owner: {
               _id: 1,
               username: 1,
            },
            title: 1,
            duration: 1,
            createdAt: 1,
         },
      },
   ]);

   return res
      .status(200)
      .json(new ApiResponse(200, videos, "Channel videos fetched successfully"));
});

module.exports = {
   getChannelStats,
   getChannelVideos,
};
