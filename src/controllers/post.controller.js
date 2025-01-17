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

const getPostDetails = asyncHandler(async (req, res) => {
   const { postId } = req.params;

   const post = await Post.aggregate([
      {
         $match: {
            _id: new mongoose.Types.ObjectId(postId),
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
         $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "owner",
            pipeline: [
               {
                  $project: {
                     // taking username and not _id as params because when visiting channel
                     // we use username in the url
                     username: 1,
                     avatar: 1,
                     _id: 0,
                  },
               },
            ],
         },
      },
      {
         $addFields: {
            owner: {
               $first: "$owner",
            },
            numberOfLikes: {
               $size: "$likesOnThePost",
            },
         },
      },
      {
         $unset: "likesOnThePost",
      },
   ]);

   if (!post || !post.length) {
      throw new ApiError(404, "No such post exist");
   }

   return res
      .status(200)
      .json(new ApiResponse(200, post[0], "Post fectched successfully"));
});

const addPost = asyncHandler(async (req, res) => {
   const { content } = req.body;

   const post = await Post.create({
      owner: req.user._id,
      content: content,
   });

   if (!post) {
      throw new ApiError(500, "Failure during creation of post.");
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
      throw new ApiError(500, "Failure during updation of post.");
   }

   return res.status(200).json(new ApiResponse(200, post, "Post updated successfully"));
});

const deletePost = asyncHandler(async (req, res) => {
   const { postId } = req.params;

   const post = await Post.findByIdAndDelete(postId, { new: true });

   if (!post) {
      throw new ApiError(500, "Failure during deletion of post.");
   }

   return res.status(200).json(new ApiResponse(200, post, "Post deleted successfully"));
});

const getSubbedChannelsPosts = asyncHandler(async (req, res) => {
   const { page = 1, limit = 6 } = req.params;

   const skip = (page - 1) * limit;

   const posts = await Post.aggregate([
      {
         $lookup: {
            from: "subscriptions",
            let: { postOwnerId: "$owner" },
            pipeline: [
               {
                  $match: {
                     $expr: {
                        $and: [
                           { $eq: ["$subscriber", req.user._id] },
                           { $eq: ["$channel", "$$postOwnerId"] },
                        ],
                     },
                  },
               },
            ],
            as: "subscriptions",
         },
      },
      // Only keep posts where there is at least one matching subscription
      {
         $match: {
            $or: [{ subscriptions: { $ne: [] } }, { owner: { $eq: req.user._id } }],
         },
      },
      {
         $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "ownerDetails",
         },
      },
      {
         $unwind: "$ownerDetails",
      },
      {
         $project: {
            _id: 1,
            content: 1,
            owner: 1,
            ownerDetails: {
               username: 1,
               avatar: 1,
            },
            createdAt: 1,
            updatedAt: 1,
         },
      },
      {
         $sort: { createdAt: 1 },
      },
      {
         $skip: skip,
      },
      {
         $limit: limit,
      },
   ]);

   console.log(posts);

   return res.status(200).json(new ApiResponse(200, posts, "Posts fetched successfully"));
});

module.exports = {
   getUserPosts,
   getPostDetails,
   addPost,
   updatePost,
   deletePost,
   getSubbedChannelsPosts,
};
