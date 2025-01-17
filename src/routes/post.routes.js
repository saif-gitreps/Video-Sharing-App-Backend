const router = require("express").Router();
const verifyJWT = require("../middlewares/auth.middleware");
const postControllers = require("../controllers/post.controller");

router.use(verifyJWT);

router.route("/user/:userId").get(postControllers.getUserPosts);

router.route("/").get(postControllers.getSubbedChannelsPosts);

// task to add: search post by a query.

router.route("/").post(postControllers.addPost);
router.route("/:postId").get(postControllers.getPostDetails);
router.route("/:postId").patch(postControllers.updatePost);
router.route("/:postId").delete(postControllers.deletePost);

module.exports = router;
