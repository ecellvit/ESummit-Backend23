const express = require("express");
const authController = require("../controllers/auth/authController");
const authRouter = express.Router();

authRouter.route("/").post(authController.googleAuth);
authRouter.route("/signUp").post(authController.basicAuthSignUp);
authRouter.route("/logIn").post(authController.basicAuthLogIn);

module.exports = authRouter;
