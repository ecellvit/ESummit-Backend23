const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    loginType: {
      type: Number, //0 for google login 1 for basic login
      required: true,
    },
    username: {
      type: String,
    },
    password: {
      type: String,
    },
    email: {
      type: String,
    },
    hasFilledDetails: {
      type: Boolean,
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    mobileNumber: {
      type: String,
    },
    registeredEvents: [
      {
        type: Number,
      },
    ],
    eHackPendingRequests: {
      type: Number,
    },
    impetusPendingRequests: {
      type: Number,
    },
    innoventurePendingRequests: {
      type: Number,
    },
    eHackTeamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EHackTeams",
    },
    impetusTeamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ImpetusTeams",
    },
    innoventureTeamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InnoventureTeams",
    },
    eHackTeamRole: {
      type: Number,
    },
    impetusTeamRole: {
      type: Number,
    },
    innoventureTeamRole: {
      type: Number,
    },
    date: {
      type: Date,
      default: Date.now(),
    },
  },
  { collection: "Users" }
);

module.exports = mongoose.model("Users", userSchema);
