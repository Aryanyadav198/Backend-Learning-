import { Router } from "express";
import { changePassword, getUserProfile, loginUser, logOutUser, refreshAccessToken, registerUser, updateUserAccount, updateUserAvatar } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";


const router = Router();


router.route("/register").post(
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 }
    ]),
    registerUser
);

// router.route("/login").post(upload.none(), loginUser);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJwt, logOutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJwt, changePassword);
router.route("/get-user").get(verifyJwt, getUserProfile);
router.route("/update-account").post(verifyJwt, updateUserAccount);
router.route("/update-avatar").post(verifyJwt,upload.single("avatar"),updateUserAvatar);


export default router;