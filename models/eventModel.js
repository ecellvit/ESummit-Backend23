const mongoose = require("mongoose");

const eventSchema = mongoose.Schema(
  {
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    date: {
      type: String,
    },
    time: {
      type: String,
    },
    location: {
      type: String,
    },
    imgUrl: {
      type: String,
    },
  },
  { collection: "Events" }
);

module.exports = mongoose.model("Events", eventSchema);
