const mongoose = require("mongoose");
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate-v2");

const commentSchema = new mongoose.Schema(
   {
      content: {
         type: String,
         required: true,
      },
      video: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Video",
      },
      post: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Post",
      },
      owner: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User",
         required: true,
      },
   },
   {
      timestamps: true,
   }
);

commentSchema.plugin(mongooseAggregatePaginate);

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
