const express = require("express");
const userController = require("../controllers/user/userController");
const userRouter = express.Router();
const auth = require("../middleware/authMiddleware");

userRouter.route("/details").get(userController.hasFilledDetails);
userRouter.route("/details").post(auth, userController.fillUserDetails);
userRouter.route("/register").patch(auth, userController.registerEvent);
userRouter.route("/").get(auth, userController.getDetails);

userRouter
  .route("/impetus/:teamId")
  .patch(auth, userController.impetusLeaveTeam);
userRouter.route("/ehack/:teamId").patch(auth, userController.eHackLeaveTeam);
userRouter
  .route("/innoventure/:teamId")
  .patch(auth, userController.innoventureLeaveTeam);

userRouter
  .route("/impetus/requests")
  .get(auth, userController.impetusGetRequest);
userRouter.route("/ehack/requests").get(auth, userController.eHackGetRequest);
userRouter
  .route("/innoventure/requests")
  .get(auth, userController.innoventureGetRequest);

userRouter
  .route("/impetus/requests/:teamId")
  .post(auth, userController.impetusSendRequest);
userRouter
  .route("/ehack/requests/:teamId")
  .post(auth, userController.eHackSendRequest);
userRouter
  .route("/innoventure/requests/:teamId")
  .post(auth, userController.impetusSendRequest);

userRouter
  .route("/impetus/requests/:teamId")
  .delete(auth, userController.impetusRemoveRequest);
userRouter
  .route("/ehack/requests/:teamId")
  .delete(auth, userController.eHackRemoveRequest);
userRouter
  .route("/innoventure/requests/:teamId")
  .delete(auth, userController.innoventureRemoveRequest);

userRouter
  .route("/impetus/join")
  .patch(auth, userController.impetusJoinTeamViaToken);
userRouter
  .route("/ehack/join")
  .patch(auth, userController.eHackJoinTeamViaToken);
userRouter
  .route("/innoventure/join")
  .patch(auth, userController.innoventureJoinTeamViaToken);

userRouter
  .route("/impetus/addMember")
  .get(auth, userController.impetusGetMemberRequest);
userRouter
  .route("/ehack/addMember")
  .get(auth, userController.eHackGetMemberRequest);
userRouter
  .route("/innoventure/addMember")
  .get(auth, userController.innoventureGetMemberRequest);

userRouter
  .route("/impetus/addMember/:teamId")
  .post(auth, userController.impetusUpdateMemberRequest);
userRouter
  .route("/ehack/addMember/:teamId")
  .post(auth, userController.eHackUpdateMemberRequest);
userRouter
  .route("/innoventure/addMember/:teamId")
  .post(auth, userController.innoventureUpdateMemberRequest);

module.exports = userRouter;
