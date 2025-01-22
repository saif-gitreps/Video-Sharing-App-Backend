const router = require("express").Router();
const verifyJWT = require("../middlewares/auth.middleware");
const likeControllers = require("../controllers/like.controller");

router.use(verifyJWT);

router.route("/toggle/video/:videoId").post(likeControllers.likeUnlikeVideo);

router.route("/toggle/post/:postId").post(likeControllers.likeUnlikePost);

router.route("/toggle/comment/:commentId").post(likeControllers.likeUnlikeComment);

router.route("/isLiked/video/:videoId").get(likeControllers.isLiked);

router.route("/videos").get(likeControllers.getLikedVideos);

router.route("/posts").get(likeControllers.getLikedPosts);

module.exports = router;
