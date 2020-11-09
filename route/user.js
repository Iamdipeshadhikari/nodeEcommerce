const express = require("express");
const router = express.Router();
const UserController = require("../controller/user");
const { check } = require("express-validator");

router.get("/signup", UserController.getSignupPage);
router.get("/login", UserController.getLoginPage);
router.get("/forgetPassword", UserController.getForgetPassword);
router.get("/newPassword/:resetToken", UserController.getNewPassword);

// Functionality
router.post(
   "/signup",
   [check("email", "Please provide valid email address").isEmail()],
   UserController.PostSignup
);

router.post("/login", UserController.PostLogin);

router.post("/logout", UserController.PostLoggedOut);

router.post("/forgetPassword", UserController.PostForgetPassword);

router.post("/newPassword/:resetToken", UserController.PostNewPassword);

module.exports = router;
