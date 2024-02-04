const router = require("express").Router();
const verifyJWT = require("../middlewares/auth.middleware");
const postControllers = require("../controllers/post.controller");

router.use(verifyJWT);

router.route("/:userId").get(postControllers.getUserPosts);

router.route("/").post();

router.route("/").patch();

router.route("/").delete();

module.exports = router;
