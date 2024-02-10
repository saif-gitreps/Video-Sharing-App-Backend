const router = require("express").Router();
const verifyJWT = require("../middlewares/auth.middleware");
const commentControllers = require("../controllers/comment.controller");

router.use(verifyJWT);

router.post("/video/:videoId", verifyJWT, commentControllers.createCommentOnVideo);

router.post("/post/:postId", verifyJWT, commentControllers.createCommentOnPost);

router.get("/video/:videoId", commentControllers.getCommentsOnVideo);

router.get("/post/:postId", commentControllers.getCommentsOnPost);

router.delete("/:commentId", verifyJWT, commentControllers.deleteComment);

module.exports = router;
