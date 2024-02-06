const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
   {
      subscriber: {
         type: mongoose.Schema.Types.ObjectId, // the guy dat will sub
         ref: "User",
      },
      channel: {
         type: mongoose.Schema.Types.ObjectId, // the guy that is getting subbed
         ref: "User",
      },
   },
   { timestamps: true }
);

const Subscription = mongoose.model("Subscription", subscriptionSchema);

module.exports = Subscription;
