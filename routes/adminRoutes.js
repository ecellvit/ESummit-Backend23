const express = require("express");
const adminController = require("../controllers/admin/adminController");
const adminRouter = express.Router();

adminRouter.route("/user/registrations").get(adminController.getAllCounts);

adminRouter.route("/user").get(adminController.getLoggedInUsers);
adminRouter.route("/user/ehack").get(adminController.getEhackUsers);
adminRouter.route("/user/impetus").get(adminController.getImpetusUsers);
adminRouter.route("/user/innoventure").get(adminController.getInnoventureUsers);
adminRouter.route("/user/etalk").get(adminController.getEtalkUsers);

adminRouter
  .route("/user/tradingworkshop")
  .get(adminController.getTradingWorkshopUsers);
adminRouter.route("/team/ehack").get(adminController.getEhackDetails);
adminRouter.route("/team/impetus").get(adminController.getImpetusDetails);
adminRouter
  .route("/team/innoventure")
  .get(adminController.getInnoventureDetails);

adminRouter
  .route("/innoventure/merge41")
  .get(adminController.innoventureMerge4Ones);
adminRouter
  .route("/innoventure/merge21")
  .get(adminController.innoventureMerge2With1);
adminRouter
  .route("/innoventure/merge")
  .get(adminController.innoventureMergeRegistered);

adminRouter.route("/impetus/merge41").get(adminController.impetusMerge4Ones);
adminRouter.route("/impetus/merge21").get(adminController.impetusMerge2With1);
adminRouter.route("/impetus/merge").get(adminController.impetusMergeRegistered);

adminRouter.route("/ehack/merge41").get(adminController.eHackMerge4Ones);
adminRouter.route("/ehack/merge21").get(adminController.eHackMerge2With1);
adminRouter.route("/ehack/merge").get(adminController.eHackMergeRegistered);
adminRouter.route("/ehack/submissions").get(adminController.getSubmissionsCount);


module.exports = adminRouter;
