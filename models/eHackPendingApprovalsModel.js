const mongoose = require("mongoose");

const pendingApprovalsSchema = mongoose.Schema(
  {
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EHackTeams",
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
  { collection: "EHackPendingApprovals" }
);

module.exports = mongoose.model(
  "EHackPendingApprovals",
  pendingApprovalsSchema
);
