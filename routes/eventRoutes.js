const express = require("express");
const eventController = require("../controllers/events/eventController");
const eventRouter = express.Router();

eventRouter.route("/").get(eventController.getAllEvents);
module.exports = eventRouter;
