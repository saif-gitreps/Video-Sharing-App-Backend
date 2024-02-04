const asyncHandler = require("../utils/async-handler");
const ApiError = require("../utils/ApiError");
const Post = require("../models/post.model");
const ApiResponse = require("../utils/ApiResponse");
const mongoose = require("mongoose");

// for sake of lowering the complexity , will add left join of comments on the post later.
// features to add : search posts.

const getUserPosts = asyncHandler(async (req, res) => {
   const { userId } = req.params;

   const posts = await Post.aggregate([
      {
         $match: {
            owner: new mongoose.Types.ObjectId(userId),
         },
      },
      {
         $lookup: {
            from: "likes",
            foreignField: "post",
            localField: "_id",
            as: "likesOnThePost",
         },
      },
      {
         $addFields: {
            numberOfLikes: {
               $size: "$likesOnThePost",
            },
         },
      },
      {
         $project: {
            _id: 1,
            owner: 1,
            content: 1,
            createdAt: 1,
            updatedAt: 1,
            numberOfLikes: 1,
         },
      },
   ]);

   if (!posts || !posts.length) {
      throw new ApiError(404, "No posts exists.");
   }

   return res.status(200).json(new ApiResponse(200, posts, "Posts fetched successfully"));
});

const addPost = asyncHandler(async (req, res) => {
   const { content } = req.body;

   const post = await Post.create({
      owner: req.user._id,
      content: content,
   });

   if (!post) {
      throw new ApiError(400, "Failure during creation of post.");
   }

   return res.status(200).json(new ApiResponse(200, post, "Post created successfully"));
});

const updatePost = asyncHandler(async (req, res) => {
   const { content } = req.body;
   const { postId } = req.params;

   const post = await Post.findByIdAndUpdate(
      postId,
      {
         content: content,
      },
      { new: true }
   );

   if (!post) {
      throw new ApiError(400, "Failure during updation of post.");
   }

   return res.status(200).json(new ApiResponse(200, post, "Post updated successfully"));
});

const deletePost = asyncHandler(async (req, res) => {
   const { postId } = req.params;

   const post = await Post.findByIdAndDelete(postId, { new: true });

   return res.status(200).json(new ApiResponse(200, post, "Post deleted successfully"));
});

module.exports = {
   getUserPosts,
   addPost,
   updatePost,
   deletePost,
};
