const Events = require("../../models/eventModel");
const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const { errorCodes } = require("../../utils/constants");

exports.getAllEvents = catchAsync(async (req, res, next) => {
  const events = await Events.find({});
  res.status(200).json({
    message: "Event Details sent successfully",
    events,
  });
});
