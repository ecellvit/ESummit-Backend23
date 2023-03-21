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
// adminRouter.route("/team/ehack").post(adminController.basicAuthLogIn);
// adminRouter.route("/team/impetus").post(adminController.basicAuthLogIn);
// adminRouter.route("/team/innoventure").post(adminController.basicAuthLogIn);

module.exports = adminRouter;
