const router = require("express").Router();
const verifyJWT = require("../middlewares/auth.middleware");
const playlistControllers = require("../controllers/playlist.controller");

router.use(verifyJWT);

router.route("/").post(playlistControllers.createPlaylist);

router.route("/:playlistId").get(playlistControllers.getPlaylist);
router.route("/:playlistId").patch(playlistControllers.updatePlaylist);
router.route("/:playlistId").delete(playlistControllers.deletePlaylist);

router.route("/:playlistId/add/:videoId").patch(playlistControllers.addVideoToPlaylist);
router
   .route("/:playlistId/remove/:videoId")
   .patch(playlistControllers.removeVideoFromPlaylist);

router.route("/user/:userId").get(playlistControllers.getUserPlaylists);

module.exports = router;
