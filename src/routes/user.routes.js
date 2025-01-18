const router = require("express").Router();
const userController = require("../controllers/user.controller");
const upload = require("../middlewares/multer.middleware");
const verifyJWT = require("../middlewares/auth.middleware");

router.route("/register").post(
   upload.fields([
      {
         name: "avatar",
         maxCount: 1,
      },
      {
         name: "coverImage",
         maxCount: 1,
      },
   ]),
   userController.register
);

router.route("/login").post(userController.loginUser);

router.route("/refresh-token").post(userController.refreshAccessToken);

// protected routes
router.use(verifyJWT);

router.route("/logout").post(userController.logoutUser);

router.route("/change-password").post(userController.changeCurrentPassword);

router.route("/me").get(userController.getCurrentUser);

router.route("/update-account").patch(userController.updateAccountDetails);

router.route("/avatar").patch(upload.single("avatar"), userController.updateUserAvatar);

router
   .route("/cover-image")
   .patch(upload.single("coverImage"), userController.updateUserCoverImage);

router.route("/channel/:username").get(userController.getUserChannelProfile);

router.route("/history").get(userController.getWatchHistory);

module.exports = router;
