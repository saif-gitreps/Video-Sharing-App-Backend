const router = require("express").Router();
const verifyJWT = require("../middlewares/auth.middleware");

router.use(verifyJWT);

router.route("/toggle/video/:videoId").post();

router.route("/toggle/post/:postId").post();

router.route("/toggle/comment/commentId").post();

router.router("/video").get();

router.router("/post").get();
