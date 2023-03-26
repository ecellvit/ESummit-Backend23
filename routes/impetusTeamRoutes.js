const express = require("express");
const impetusTeamController = require("../controllers/impetusTeam/impetusTeamController");
const impetusTeamRouter = express.Router();
const auth = require("../middleware/authMiddleware");
const { pagination, paginateAddMembers } = require("../controllers/impetusTeam/pagination");

impetusTeamRouter
  .route("/")
  .get(auth, pagination(), impetusTeamController.getAllTeams);
impetusTeamRouter.route("/team").post(auth, impetusTeamController.createTeam);
impetusTeamRouter
  .route("/team/:teamId")
  .get(auth, impetusTeamController.getTeamDetails);
impetusTeamRouter
  .route("/team/:teamId")
  .patch(auth, impetusTeamController.updateTeam);
impetusTeamRouter
  .route("/team/:teamId")
  .delete(auth, impetusTeamController.deleteTeam);

impetusTeamRouter
  .route("/requests/:teamId")
  .get(auth, impetusTeamController.getTeamRequests);
impetusTeamRouter
  .route("/requests/:teamId")
  .post(auth, impetusTeamController.updateRequest);

impetusTeamRouter
  .route("/token/:teamId")
  .get(auth, impetusTeamController.getTeamToken);

impetusTeamRouter
  .route("/remove/:teamId")
  .patch(auth, impetusTeamController.removeMember);
impetusTeamRouter.route("/user").get(auth,impetusTeamController.getAllMembers);

impetusTeamRouter
  .route("/addMember")
  .get(auth, impetusTeamController.getMemberRequests);
impetusTeamRouter
  .route("/addMember/:userId")
  .post(auth, impetusTeamController.addMemberRequest);
impetusTeamRouter
  .route("/addMember/:userId")
  .delete(auth, impetusTeamController.removeMemberRequest);

module.exports = impetusTeamRouter;
