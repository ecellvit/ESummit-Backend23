const express = require("express");
const adminController = require("../controllers/admin/adminController");
const adminRouter = express.Router();

adminRouter.route("/user/registrations").get(adminController.getAllCounts);
adminRouter.route("/user").get(adminController.getLoggedInUsers);
adminRouter.route("/user/ehack").get(adminController.getEhackUsers);
adminRouter.route("/user/impetus").get(adminController.getImpetusUsers);
adminRouter.route("/user/innoventure").get(adminController.getInnoventureUsers);
adminRouter.route("/user/etalk").get(adminController.getEtalkUsers);
adminRouter.route("/user/tradingworkshop").get(adminController.getTradingWorkshopUsers);
adminRouter.route("/team/ehack").get(adminController.getEhackDetails);
adminRouter.route("/team/impetus").get(adminController.getImpetusDetails);
adminRouter.route("/team/innoventure").get(adminController.getInnoventureDetails);
adminRouter.route("/my").get(adminController.myFunction);

module.exports = adminRouter;
