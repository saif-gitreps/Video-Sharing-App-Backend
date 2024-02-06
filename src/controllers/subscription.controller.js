const asyncHandler = require("../utils/async-handler");
const ApiError = require("../utils/ApiError");
const Subscription = require("../models/subscription.model");
const ApiResponse = require("../utils/ApiResponse");
const mongoose = require("mongoose");

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
   const { userId } = req.params;

   const channels = await Subscription.find({
      subscriber: userId,
   });

   return res
      .status(200)
      .json(new ApiResponse(200, channels, "Subscribed channels fetched successfully"));
});

module.exports = {
   subOrUnsubAchannel,
   getSubscribedUsers,
   getSubscribedChannel,
};
