const asyncHandler = require("../utils/async-handler");
const ApiError = require("../utils/ApiError");
const Like = require("../models/likes.model");
const ApiResponse = require("../utils/ApiResponse");
const mongoose = require("mongoose");

const getLikedVideos = asyncHandler(async (req, res) => {
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
               thumbnail: 1,
               createdAt: 1,
            },
         },
      },
   ]);

   if (!likedVideos) {
      throw new ApiError(404, "No liked videos found");
   }

   return res
      .status(200)
      .json(new ApiResponse(200, likedVideos, "User likes videos fetched successfully"));
});

const getLikedPosts = asyncHandler(async (req, res) => {
   const userId = req.user._id;

   const likedPosts = await Like.aggregate([
      {
         $match: {
            likedBy: new mongoose.Types.ObjectId(userId),
         },
      },
      {
         $lookup: {
            from: "posts",
            localField: "post",
            foreignField: "_id",
            as: "post",
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
         $unwind: "$post",
      },
      {
         $project: {
            _id: 0,
            post: {
               _id: 1,
               content: 1,
               createdAt: 1,
               owner: 1,
            },
         },
      },
   ]);

   if (!likedPosts) {
      throw new ApiError(404, "No liked posts found");
   }

   return res
      .status(200)
      .json(new ApiResponse(200, likedPosts, "User likes posts fetched successfully"));
});

const likeUnlikeVideo = asyncHandler(async (req, res) => {
   const { videoId } = req.params;

   let videoToLike = await Like.findOne({
      $and: [{ video: videoId }, { likedBy: req.user?._id }],
   });

   if (!videoToLike) {
      videoToLike = await Like.create({
         likedBy: req.user._id,
         video: videoId,
      });
   } else {
      videoToLike = await Like.findByIdAndDelete(videoToLike._id, {
         new: true,
      });
   }

   return res
      .status(200)
      .json(new ApiResponse(200, videoToLike, "Like on the video toggled successfully"));
});

const isLiked = asyncHandler(async (req, res) => {
   const { videoId } = req.params;
   const userId = req.user._id;

   const isLiked = await Like.findOne({
      $and: [{ video: videoId }, { likedBy: userId }],
   });

   return res
      .status(200)
      .json(
         new ApiResponse(200, isLiked ? true : false, "Like status fetched successfully")
      );
});

const likeUnlikePost = asyncHandler(async (req, res) => {
   const { postId } = req.params;

   let postToLike = await Like.findOne({
      $and: [{ post: postId }, { likedBy: req.user?._id }],
   });

   if (!postToLike) {
      postToLike = await Like.create({
         likedBy: req.user._id,
         post: postId,
      });
   } else {
      postToLike = await Like.findByIdAndDelete(postToLike._id, {
         new: true,
      });
   }

   return res
      .status(200)
      .json(new ApiResponse(200, postToLike, "Like on the post toggled successfully"));
});

const likeUnlikeComment = asyncHandler(async (req, res) => {
   const { commentId } = req.params;

   let commentToLike = await Like.findOne({
      $and: [{ comment: commentId }, { likedBy: req.user?._id }],
   });

   if (!commentToLike) {
      commentToLike = await Like.create({
         likedBy: req.user._id,
         comment: commentId,
      });
   } else {
      commentToLike = await Like.findByIdAndDelete(commentToLike._id, {
         new: true,
      });
   }

   return res
      .status(200)
      .json(
         new ApiResponse(200, commentToLike, "Like on the comment toggled successfully")
      );
});

module.exports = {
   getLikedVideos,
   getLikedPosts,
   likeUnlikeVideo,
   isLiked,
   likeUnlikePost,
   likeUnlikeComment,
};
