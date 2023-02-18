const mongoose = require("mongoose");

const pendingApprovalsSchema = mongoose.Schema(
  {
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ImpetusTeams",
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
  { collection: "ImpetusPendingApprovals" }
);

module.exports = mongoose.model(
  "ImpetusPendingApprovals",
  pendingApprovalsSchema
);
