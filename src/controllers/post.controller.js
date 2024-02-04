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
            _id: new mongoose.Types.ObjectId(userId),
         },
      },
      {
         $lookup: {
            from: "likes",
            foreignField: "post",
            localField: "_id",
            as: "likesOnThePost",
            pipeline: [
               {
                  $addFields: {
                     numberOfLikes: {
                        $size: "$likesOnThePost",
                     },
                  },
               },
               {
                  $project: {
                     numberOfLikes: 1,
                  },
               },
            ],
         },
      },
   ]);

   if (!posts || !posts.length) {
      throw new ApiError(404, "No posts exists");
   }

   return res.status(200).json(new ApiResponse(200, posts, "Posts fetched successfully"));
});

module.exports = {
   getUserPosts,
};
