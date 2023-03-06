const mongoose = require("mongoose");

const teamSchema = mongoose.Schema(
  {
    teamName: {
      type: String,
    },
    teamLeaderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
    noOfTimesTeamNameChanged: {
      type: Number,
      default: 0,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
      },
    ],
    noOfPendingRequests: {
      type: Number,
      default: 0,
    },
    file: {
      type: String,
    }
  },
  { collection: "EHackTeams" }
);

module.exports = mongoose.model("EHackTeams", teamSchema);
