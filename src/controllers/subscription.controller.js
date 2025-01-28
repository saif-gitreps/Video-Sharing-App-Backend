const asyncHandler = require("../utils/async-handler");
const Subscription = require("../models/subscription.model");
const ApiResponse = require("../utils/ApiResponse");
const { create } = require("../models/user.model");

const subOrUnsubAchannel = asyncHandler(async (req, res) => {
   const { channelId } = req.params;

   let channelToSubscribe = await Subscription.findOne({
      $and: [{ channel: channelId }, { subscriber: req.user?._id }],
   });

   if (!channelToSubscribe) {
      channelToSubscribe = await Subscription.create({
         subscriber: req.user._id,
         channel: channelId,
      });
   } else {
      channelToSubscribe = await Subscription.findByIdAndDelete(channelToSubscribe._id, {
         new: true,
      });
   }

   return res
      .status(200)
      .json(
         new ApiResponse(
            200,
            channelToSubscribe,
            "Channel subscription toggled successfully"
         )
      );
});

const getSubscribedUsers = asyncHandler(async (req, res) => {
   const { channelId } = req.params;

   const subscribers = await Subscription.find({ channel: channelId });

   return res
      .status(200)
      .json(new ApiResponse(200, subscribers, "Subscribers fetched successfully"));
});

const getSubscribedChannel = asyncHandler(async (req, res) => {
   const userId = req.user._id;

   const channels = await Subscription.aggregate([
      { $match: { subscriber: userId } },
      {
         $lookup: {
            from: "users",
            localField: "channel",
            foreignField: "_id",
            as: "channel",
         },
      },
      { $unwind: "$channel" },
      {
         $project: {
            _id: "$channel._id",
            username: "$channel.username",
            fullname: "$channel.fullname",
            avatar: "$channel.avatar",
            createdAt: 1,
         },
      },
   ]);

   return res
      .status(200)
      .json(new ApiResponse(200, channels, "Subscribed channels fetched successfully"));
});

const isSubscribed = asyncHandler(async (req, res) => {
   const { channelId } = req.params;

   const channelToSubscribe = await Subscription.findOne({
      $and: [{ channel: channelId }, { subscriber: req.user?._id }],
   });

   return res
      .status(200)
      .json(
         new ApiResponse(
            200,
            !!channelToSubscribe,
            "Channel subscription status fetched successfully"
         )
      );
});

module.exports = {
   subOrUnsubAchannel,
   getSubscribedUsers,
   getSubscribedChannel,
   isSubscribed,
};
