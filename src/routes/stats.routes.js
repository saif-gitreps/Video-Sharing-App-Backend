const router = require("express").Router();
const verifyJWT = require("../middlewares/auth.middleware");
const statsControllers = require("../controllers/stats.controller");

router.use(verifyJWT);

router.route("/stats").get(statsControllers.getChannelStats);
router.route("/videos").get(statsControllers.getChannelVideos);

module.exports = router;
