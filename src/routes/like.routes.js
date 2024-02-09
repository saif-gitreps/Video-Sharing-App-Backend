const router = require("express").Router();
const verifyJWT = require("../middlewares/auth.middleware");
const likeControllers = require("../controllers/like.controller");

router.use(verifyJWT);

router.route("/toggle/video/:videoId").post(likeControllers.likeUnlikeVideo);

router.route("/toggle/post/:postId").post(likeControllers.likeUnlikePost);

router.route("/toggle/comment/commentId").post(likeControllers.likeUnlikeComment);

router.router("/video").get(likeControllers.getLikedVideos);

router.router("/post").get(likeControllers.getLikedPosts);

module.exports = router;
