const asyncHandler = require("../utils/async-handler");
const Video = require("../models/video.model");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const mongoose = require("mongoose");
const {
   uploadOnCloudinary,
   deleteFromCloudinary,
   retrievePublicIdFromUrl,
} = require("../utils/cloudinary");

const getAllVideos = asyncHandler(async (req, res) => {
   const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.body;
   //TODO: get all videos based on query, sort, pagination

   // sort types: views, createdAt, duration, title.
   const skip = (page - 1) * limit;
   
   const match = {};
   if (query) {
      match.$text = { $search: query };
      match[isPublished] = true;
      if (userId) {
         match.owner = new mongoose.Types.ObjectId(userId);
      }
   }

   const sort = {};
   if (sortBy && (parseInt(sortType) === 1 || parseInt(sortType) === -1)) {
      sort[sortBy] = parseInt(sortType);
   } else {
      // if no sort by was sent, then ill sort it by recent.
      sort["createdAt"] = 1;
   }

   const videos = await Video.aggregate([
      {
         $match: match,
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
         /*
         In MongoDB aggregation, the $lookup stage is used primarily when you need to perform a left outer join with documents from another collection. It's useful when you want to enrich your documents with additional data that is not directly present in the current collection.
         */
         $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "owner",
         },
      },
      {
         /*
         The $unwind stage is typically used when you have an array field in your documents and you want to "flatten" or deconstruct that array field into multiple documents, each containing one element of the array. This is useful when you want to perform operations or projections on individual elements of the array.

         In your case, the $lookup stage joins documents from the "users" collection with documents from the "videos" collection based on the owner field. After the $lookup stage, the owner field becomes an array of user documents.

         The $unwind stage is used to deconstruct this array field owner into multiple documents, each containing one user document. This allows subsequent stages, such as $project, to access and manipulate fields within the owner array.

         However, if you're certain that each document in your "videos" collection has only one corresponding user document in the "users" collection (i.e., the owner field is not an array, but a single reference to a user document), then using $unwind is not strictly necessary.
         */
         // comment this unwind and console.log the videos to see the difference
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

   if (!videos.length || !videos) {
      throw new ApiError(404, "No videos found");
   }

   return res
      .status(200)
      .json(new ApiResponse(200, videos, "Successfully fetched videos based on query."));
});

const publishAVideo = asyncHandler(async (req, res) => {
   const { title, description } = req.body;
   // we will get thumbnail and the video using multer
   if (!title && !description) {
      throw new ApiError(400, "Title and Description are required.");
   }

   const thumbnailLocalPath = req.files.thumbnail[0].path;
   const videoLocalPath = req.files.video[0].path;

   if (!thumbnailLocalPath) {
      throw new ApiError(400, "Thumnail is required.");
   }
   if (!videoLocalPath) {
      throw new ApiError(400, "Video is required.");
   }

   const uploadedThumbnail = await uploadOnCloudinary(thumbnailLocalPath);
   const uploadedVideo = await uploadOnCloudinary(videoLocalPath);

   if (!uploadedThumbnail.url && !uploadedVideo.url) {
      throw new ApiError(
         400,
         "Failure while uploading thumbnail or video on Cloud.Try again!"
      );
   }

   const newVideo = await Video.create({
      videoFile: uploadedVideo?.url,
      thumbnail: uploadedThumbnail?.url,
      title: title,
      description: description,
      duration: uploadedVideo.duration,
      owner: req.user._id,
   });

   if (!newVideo) {
      throw new ApiError(400, "failure uploading video on the platfrom.");
   }

   return res
      .status(200)
      .json(new ApiResponse(200, newVideo, "Video uploaded successfully."));
});

const getVideo = asyncHandler(async (req, res) => {
   const { videoId } = req.params;
   // we will get all info about the video along with owner informations,
   // all the comments and likes (in numbers).

   // task left in this controller: after making likes and comments controller , convert the result to
   // object.
   const video = await Video.aggregate([
      {
         $match: {
            _id: new mongoose.Types.ObjectId(videoId),
            isPublished: true,
         },
      },
      {
         $lookup: {
            from: "users",
            foreignField: "_id",
            localField: "owner",
            as: "owner",
            pipeline: [
               {
                  $project: {
                     _id: 1,
                     username: 1,
                     avatar: 1,
                  },
               },
            ],
         },
      },
      {
         $lookup: {
            from: "comments",
            foreignField: "_id",
            localField: "video",
            as: "commentsOnTheVideo",
         },
      },
      {
         $lookup: {
            from: "likes",
            foreignField: "_id",
            localField: "video",
            as: "likesOnTheVideo",
         },
      },
      {
         // so this is the technique we use to deconstruct a single element array into its single object
         // something like [result: {1,2,3}] to result: {1,2,3}
         $addFields: {
            owner: {
               $first: "$owner",
            },
            numberOfLikes: {
               $size: "$likesOnTheVideo",
            },
            numberOfLikes: {
               $first: "$numberOfLikes",
            },
         },
      },
   ]);

   if (!video || !video.length) {
      throw new ApiError(400, "No such video exists");
   }

   return res
      .status(200)
      .json(new ApiResponse(200, video[0], "Video fetched successfully"));
});

const updateVideoDetails = asyncHandler(async (req, res) => {
   const { videoId } = req.params;
   const { title, description } = req.body;

   if (!title || !description) {
      throw new ApiError(400, "Please dont keep any fields empty.");
   }

   const video = await Video.findByIdAndUpdate(
      {
         _id: videoId,
      },
      {
         $set: {
            title: title,
            description: description,
         },
      },
      {
         new: true,
      }
   );

   if (!video || !video.length) {
      throw new ApiError(400, "no such video exists to update.");
   }

   return res
      .status(200)
      .json(new ApiResponse(200, video, "Video details updated successfully."));
});

const updateVideoThumbnail = asyncHandler(async (req, res) => {
   const { videoId } = req.params;
   const thumbnailLocalPath = req.file?.path;

   if (!thumbnailLocalPath) {
      throw new ApiError(400, "thumbnail was not received by the server.");
   }

   const uploadedThumbnail = await uploadOnCloudinary(thumbnailLocalPath);

   if (!uploadedThumbnail.url) {
      throw new ApiError(400, "Failure uploading thumbnail to cloudinary.");
   }

   let video = await Video.findById(videoId);

   if (video.thumbnail) {
      await deleteFromCloudinary(
         // i made this alogorithm.
         retrievePublicIdFromUrl(video.thumbnail).trim()
      );
   }

   video = await Video.findByIdAndUpdate(
      {
         _id: videoId,
      },
      {
         $set: {
            thumbnail: uploadedThumbnail.url,
         },
      },
      {
         new: true,
      }
   );

   if (!video || !video.length) {
      throw new ApiError(400, "no such video exists to update.");
   }

   return res
      .status(200)
      .json(new ApiResponse(200, video, "Video thumbnail updated successfully."));
});

const deleteVideo = asyncHandler(async (req, res) => {
   const { videoId } = req.params;

   let video = await Video.findById(videoId);

   if (!video) {
      throw new ApiError(400, "No such video exists.");
   }

   if (video.videoFile && video.thumbnail) {
      await deleteFromCloudinary(retrievePublicIdFromUrl(video.thumbnail).trim());

      const response = await deleteFromCloudinary(
         retrievePublicIdFromUrl(video.videoFile)
      );
      console.log(response);
   }

   video = await Video.findByIdAndDelete(
      {
         _id: videoId,
      },
      {
         new: true,
      }
   );

   if (!video || !video.length) {
      throw new ApiError(400, "no such video exists to delete.");
   }

   return res
      .status(200)
      .json(new ApiResponse(200, video, "Video deleted successfully."));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
   const { videoId } = req.params;

   let video = await Video.findById(videoId);

   if (!video) {
      throw new ApiError(400, "No such video exists to toggle.");
   }

   video.isPublished = video.isPublished == true ? false : true;

   video = await video.save({ validateBeforeSave: false });

   return res
      .status(200)
      .json(new ApiResponse(200, video, "Video publicity toggled successfully."));
});

module.exports = {
   getAllVideos,
   publishAVideo,
   getVideo,
   updateVideoDetails,
   updateVideoThumbnail,
   deleteVideo,
   togglePublishStatus,
};
