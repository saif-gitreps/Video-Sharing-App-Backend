const asyncHandler = require("../utils/async-handler");
const ApiError = require("../utils/ApiError");
const Comment = require("../models/comment.model");
const ApiResponse = require("../utils/ApiResponse");
const mongoose = require("mongoose");

const createCommentOnVideo = asyncHandler(async (req, res) => {
   const { videoId } = req.params;
   const { content } = req.body;
   const userId = req.user._id;

   const comment = await Comment.create({
      video: videoId,
      content: content,
      owner: userId,
   });

   if (!comment) {
      throw new ApiError(500, "Failuring while posting the comment");
   }

   return res
      .status(200)
      .json(new ApiResponse(200, comment, "Comment added successfully"));
});

const createCommentOnPost = asyncHandler(async (req, res) => {
   const { postId } = req.params;
   const { content } = req.body;
   const userId = req.user._id;

   const comment = await Comment.create({
      post: postId,
      content: content,
      owner: userId,
   });

   if (!comment) {
      throw new ApiError(500, "Failuring while posting the comment");
   }

   return res
      .status(201)
      .json(new ApiResponse(200, comment, "Comment added successfully"));
});

const getCommentsOnVideo = asyncHandler(async (req, res) => {
   const { videoId } = req.params;

   const comments = await Comment.aggregate([
      {
         $match: {
            video: new mongoose.Types.ObjectId(videoId),
         },
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
         $unwind: "$owner",
      },
      {
         // well i guess this is better than nested piplines
         $project: {
            "owner._id": 1,
            "owner.username": 1,
            "owner.avatar": 1,
         },
      },
   ]);

   if (!comments) {
      throw new ApiError(404, "No comments found");
   }

   return res
      .status(200)
      .json(new ApiResponse(200, comments, "Comments on the video found successfully"));
});

const getCommentsOnPost = asyncHandler(async (req, res) => {
   const { postId } = req.params;

   const comments = await Comment.aggregate([
      {
         $match: {
            post: new mongoose.Types.ObjectId(postId),
         },
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
         $unwind: "$owner",
      },
      {
         $project: {
            "owner._id": 1,
            "owner.username": 1,
            "owner.avatar": 1,
         },
      },
   ]);

   if (!comments) {
      throw new ApiError(404, "No comments found");
   }

   return res
      .status(200)
      .json(new ApiResponse(200, comments, "Comments on the post found successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
   const { commentId } = req.params;
   const userId = req.user._id;

   const comment = await Comment.findOneAndDelete({
      _id: commentId,
      owner: userId,
   });

   if (!comment) {
      throw new ApiError(404, "No such comment found to delete");
   }

   return res
      .status(200)
      .json(new ApiResponse(200, comment, "Comment deleted successfully"));
});

module.exports = {
   createCommentOnVideo,
   createCommentOnPost,
   getCommentsOnVideo,
   getCommentsOnPost,
   deleteComment,
};
