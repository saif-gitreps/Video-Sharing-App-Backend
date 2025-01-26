const router = require("express").Router();
const verifyJWT = require("../middlewares/auth.middleware");
const subscriptionControllers = require("../controllers/subscription.controller");

router.use(verifyJWT);

router.route("/channel/:channelId").get(subscriptionControllers.getSubscribedUsers);

router.route("/is-subscribed/:channelId").get(subscriptionControllers.isSubscribed);

router.route("/:channelId").post(subscriptionControllers.subOrUnsubAchannel);

router.route("/user/:userId").get(subscriptionControllers.getSubscribedChannel);

module.exports = router;
