const asyncHandler = require("../utils/async-handler");
const ApiError = require("../utils/ApiError");
const Playlist = require("../models/playlist.model");
const ApiResponse = require("../utils/ApiResponse");
const mongoose = require("mongoose");

const createPlaylist = asyncHandler(async (req, res) => {
   const { name, description } = req.body;

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
      .json(new ApiResponse(200, "Playlist created successfully.", playlist));
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
