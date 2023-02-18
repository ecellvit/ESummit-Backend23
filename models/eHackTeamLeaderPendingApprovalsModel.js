const mongoose = require("mongoose");

const pendingApprovalsSchema = mongoose.Schema(
  {
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EHackTeams",
    },
    teamLeaderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
    status: {
      type: Number,
    },
    date: {
      type: Date,
      default: Date.now(),
    },
  },
  { collection: "EHackTeamLeaderPendingApprovals" }
);

module.exports = mongoose.model(
  "EHackTeamLeaderPendingApprovals",
  pendingApprovalsSchema
);
