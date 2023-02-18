const express = require("express");
const impetusTeamController = require("../controllers/impetusTeam/impetusTeamController");
const impetusTeamRouter = express.Router();
const auth = require("../middleware/authMiddleware");
const { pagination } = require("../controllers/impetusTeam/pagination");

impetusTeamRouter
  .route("/")
  .get(auth, pagination(), impetusTeamController.getAllTeams);
impetusTeamRouter.route("/").post(auth, impetusTeamController.createTeam);
impetusTeamRouter
  .route("/:teamId")
  .get(auth, impetusTeamController.getTeamDetails);
impetusTeamRouter
  .route("/:teamId")
  .patch(auth, impetusTeamController.updateTeam);
impetusTeamRouter
  .route("/:teamId")
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
  .route("/user/:teamId")
  .patch(auth, impetusTeamController.removeMember);
impetusTeamRouter.route("/user").get(auth, impetusTeamController.getAllMembers);

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
