const express = require("express");
const innoventureTeamController = require("../controllers/innoventureTeam/innoventureTeamController");
const innoventureTeamRouter = express.Router();
const auth = require("../middleware/authMiddleware");
const { pagination } = require("../controllers/innoventureTeam/pagination");

innoventureTeamRouter
  .route("/")
  .get(auth, pagination(), innoventureTeamController.getAllTeams);
innoventureTeamRouter
  .route("/team")
  .post(auth, innoventureTeamController.createTeam);
innoventureTeamRouter
  .route("/team/:teamId")
  .get(auth, innoventureTeamController.getTeamDetails);
innoventureTeamRouter
  .route("/team/:teamId")
  .patch(auth, innoventureTeamController.updateTeam);
innoventureTeamRouter
  .route("/team/:teamId")
  .delete(auth, innoventureTeamController.deleteTeam);

innoventureTeamRouter
  .route("/requests/:teamId")
  .get(auth, innoventureTeamController.getTeamRequests);
innoventureTeamRouter
  .route("/requests/:teamId")
  .post(auth, innoventureTeamController.updateRequest);

innoventureTeamRouter
  .route("/token/:teamId")
  .get(auth, innoventureTeamController.getTeamToken);

innoventureTeamRouter
  .route("/remove/:teamId")
  .patch(auth, innoventureTeamController.removeMember);
innoventureTeamRouter
  .route("/user")
  .get(auth, innoventureTeamController.getAllMembers);

innoventureTeamRouter
  .route("/addMember")
  .get(auth, innoventureTeamController.getMemberRequests);
innoventureTeamRouter
  .route("/addMember/:userId")
  .post(auth, innoventureTeamController.addMemberRequest);
innoventureTeamRouter
  .route("/addMember/:userId")
  .delete(auth, innoventureTeamController.removeMemberRequest);

module.exports = innoventureTeamRouter;
