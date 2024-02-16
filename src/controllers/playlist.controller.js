const asyncHandler = require("../utils/async-handler");
const ApiError = require("../utils/ApiError");
const Playlist = require("../models/playlist.model");
const Video = require("../models/video.model");
const ApiResponse = require("../utils/ApiResponse");
const mongoose = require("mongoose");

const createPlaylist = asyncHandler(async (req, res) => {
   const { name, description } = req.body;

   if (!name || !description) {
      throw new ApiError(401, "Name and description are required.");
   }

   let playlist = new Playlist({
      name: name,
      description: description,
      owner: req.user._id,
   });

   playlist = await playlist.save();

   if (!playlist) {
      throw new ApiError(500, "Failure while creating playlist. Please try again.");
   }

   return res
      .status(201)
      .json(new ApiResponse(200, playlist, "Playlist created successfully."));
});

const getPlaylist = asyncHandler(async (req, res) => {
   const { playlistId } = req.params;
   const playlist = await Playlist.aggregate([
      {
         $match: {
            _id: new mongoose.Types.ObjectId(playlistId),
         },
      },
      {
         $lookup: {
            from: "videos",
            localField: "videos",
            foreignField: "_id",
            as: "videos",
            pipeline: [
               {
                  $project: {
                     _id: 1,
                     title: 1,
                     videoFile: 1,
                     thumbnail: 1,
                     duration: 1,
                     createdAt: 1,
                  },
               },
            ],
         },
      },
   ]);

   if (!playlist || playlist.length === 0) {
      throw new ApiError(404, "Playlist not found.");
   }

   return res
      .status(200)
      .json(new ApiResponse(200, playlist[0], "Playlist retrieved successfully."));
});

const updatePlaylist = asyncHandler(async (req, res) => {
   const { playlistId } = req.params;
   const { name, description } = req.body;

   if (!name || !description) {
      throw new ApiError(401, "Name and description are required.");
   }

   const playlist = await Playlist.findOneAndUpdate(
      { _id: playlistId, owner: req.user._id },
      { name, description },
      { new: true }
   );

   if (!playlist) {
      throw new ApiError(404, "Playlist not found.");
   }

   return res
      .status(200)
      .json(new ApiResponse(200, playlist, "Playlist updated successfully."));
});

const deletePlaylist = asyncHandler(async (req, res) => {
   const { playlistId } = req.params;

   const playlist = await Playlist.findOneAndDelete({
      _id: playlistId,
      owner: req.user._id,
   });

   if (!playlist) {
      throw new ApiError(404, "Playlist not found.");
   }

   return res
      .status(200)
      .json(new ApiResponse(200, playlist, "Playlist deleted successfully."));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
   const { playlistId, videoId } = req.params;

   const video = await Video.findById(videoId);
   let playlist = await Playlist.findById(playlistId);

   if (!playlist) {
      throw new ApiError(404, "Playlist not found.");
   }
   if (!video) {
      throw new ApiError(404, "No such video exists.");
   }

   for (let i = 0; i < playlist.videos.length; i++) {
      if (playlist.videos[i].toString() === videoId) {
         throw new ApiError(400, "Video already exists in playlist.");
      }
   }

   playlist.videos.push(videoId);

   playlist = await playlist.save();

   return res
      .status(200)
      .json(new ApiResponse(200, playlist, "Video added to playlist successfully."));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
   const { playlistId, videoId } = req.params;

   const video = await Video.findById(videoId);
   let playlist = await Playlist.findById(playlistId);

   if (!playlist) {
      throw new ApiError(404, "Playlist not found.");
   }
   if (!video) {
      throw new ApiError(404, "No such video exists.");
   }

   if (!playlist.videos.some((existingVideo) => existingVideo.equals(videoId))) {
      throw new ApiError(400, "Video is not in the playlist.");
   }

   playlist = await Playlist.findByIdAndUpdate(
      playlistId,
      {
         $pull: { videos: new mongoose.Types.ObjectId(videoId) },
      },
      { new: true }
   );

   return res
      .status(200)
      .json(new ApiResponse(200, playlist, "Video removed from playlist successfully."));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
   const { userId } = req.params;

   const playlists = await Playlist.find({ owner: userId });

   if (!playlists) {
      throw new ApiError(404, "No playlists found.");
   }

   return res
      .status(200)
      .json(new ApiResponse(200, playlists, "Playlists retrieved successfully."));
});

module.exports = {
   createPlaylist,
   getPlaylist,
   updatePlaylist,
   deletePlaylist,
   addVideoToPlaylist,
   removeVideoFromPlaylist,
   getUserPlaylists,
};
