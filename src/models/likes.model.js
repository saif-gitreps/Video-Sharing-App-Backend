const mongoose = require("mongoose");
//const mongooseAggregatePaginate = require("mongoose-aggregate-paginate-v2");

const likeSchema = new mongoose.Schema(
   {
      video: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Video",
      },
      comment: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Comment",
      },
      post: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Post",
      },
      likedBy: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User",
      },
   },
   {
      timestamps: true,
   }
);

//likeSchema.plugin(mongooseAggregatePaginate);

const Like = mongoose.model("Like", likeSchema);

module.exports = Like;
