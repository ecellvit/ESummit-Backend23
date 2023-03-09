const express = require("express");
const eHackTeamController = require("../controllers/eHackTeam/eHackTeamController");
const eHackTeamRouter = express.Router();
const auth = require("../middleware/authMiddleware");
const { pagination } = require("../controllers/eHackTeam/pagination");

eHackTeamRouter
  .route("/")
  .get(auth, pagination(), eHackTeamController.getAllTeams);
eHackTeamRouter.route("/team").post(auth, eHackTeamController.createTeam);
eHackTeamRouter
  .route("/team/:teamId")
  .get(auth, eHackTeamController.getTeamDetails);
eHackTeamRouter
  .route("/team/:teamId")
  .patch(auth, eHackTeamController.updateTeam);
eHackTeamRouter
  .route("/team/:teamId")
  .delete(auth, eHackTeamController.deleteTeam);

eHackTeamRouter
  .route("/requests/:teamId")
  .get(auth, eHackTeamController.getTeamRequests);
eHackTeamRouter
  .route("/requests/:teamId")
  .post(auth, eHackTeamController.updateRequest);

eHackTeamRouter
  .route("/token/:teamId")
  .get(auth, eHackTeamController.getTeamToken);

eHackTeamRouter
  .route("/remove/:teamId")
  .patch(auth, eHackTeamController.removeMember);
eHackTeamRouter.route("/user").get(auth, eHackTeamController.getAllMembers);

eHackTeamRouter
  .route("/addMember")
  .get(auth, eHackTeamController.getMemberRequests);
eHackTeamRouter
  .route("/addMember/:userId")
  .post(auth, eHackTeamController.addMemberRequest);
eHackTeamRouter
  .route("/addMember/:userId")
  .delete(auth, eHackTeamController.removeMemberRequest);

eHackTeamRouter.route("/roundOne").post(auth, eHackTeamController.eHackUploadFile);
eHackTeamRouter.route("/roundOne").get(auth, eHackTeamController.eHackGetFile);

module.exports = eHackTeamRouter;
