const mongoose = require("mongoose");

const playlistSchema = new mongoose.Schema(
   {
      name: {
         type: String,
         required: true,
      },
      description: {
         type: String,
         required: true,
      },
      videos: {
         type: [
            {
               types: mongoose.Schema.Types.ObjectId,
               ref: "Video",
            },
         ],
      },
      owner: {
         types: mongoose.Schema.Types.ObjectId,
         ref: "User",
      },
   },
   {
      timestamps,
   }
);

const Playlist = mongoose.model("Playlist", playlistSchema);

module.exports = Playlist;
