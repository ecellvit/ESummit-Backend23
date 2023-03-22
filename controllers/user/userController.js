const User = require("../../models/userModel");
const { OAuth2Client } = require("google-auth-library");

const impetusTeams = require("../../models/impetusTeamModel");
const eHackTeams = require("../../models/eHackTeamModel");
const innoventureTeams = require("../../models/innoventureTeamModel");

const impetusPendingApprovals = require("../../models/impetusPendingAprrovalsModel");
const eHackPendingApprovals = require("../../models/eHackPendingApprovalsModel");
const innoventurePendingApprovals = require("../../models/innoventurePendingApprovalsModel");

const innoventureTeamLeaderApprovalsModel = require("../../models/innoventureTeamLeaderPendingApprovalsModel");
const eHackTeamLeaderApprovalsModel = require("../../models/eHackTeamLeaderPendingApprovalsModel");
const impetusTeamLeaderApprovalsModel = require("../../models/impetusTeamLeaderPendingApprovalsModel");

var mongoose = require("mongoose");
const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const {
  errorCodes,
  requestStatusTypes,
  teamRole,
  objectIdLength,
  registerTypes,
  eventCodes,
  approvalStatusTypes,
} = require("../../utils/constants");

const {
  joinTeamViaTokenBodyValidation,
  fillUserDetailsBodyValidation,
  hasFilledDetailsBodyValidation,
  registerEventBodyValidation,
  updateRequestBodyValidation,
} = require("./validationSchema");
const { verifyTeamToken } = require("./utils");
const client = new OAuth2Client(process.env.CLIENT_ID);
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const { transporter } = require("../../utils/nodemailer");

exports.registerEvent = catchAsync(async (req, res, next) => {
  const { error } = registerEventBodyValidation(req.body);
  if (error) {
    return next(
      new AppError(
        error.details[0].message,
        400,
        errorCodes.INPUT_PARAMS_INVALID
      )
    );
  }

  const user = await User.findById({ _id: req.user._id });

  //to register
  if (req.body.op === 0) {
    if (
      user.registeredEvents[req.body.eventCode] === registerTypes.REGISTERED //already registered
    ) {
      return next(
        new AppError(
          "Already Registered to event",
          412,
          errorCodes.ALREADY_REGISTERED
        )
      );
    }

    if (req.body.eventCode === eventCodes.TRADING_WORKSHOP) {
      const usersRegisteredForTradingWorkshop = await User.find({
        "registeredEvents.2": registerTypes.REGISTERED,
      });

      if (usersRegisteredForTradingWorkshop.length >= 350) {
        return next(
          new AppError(
            "Maximum number of registrations reached for this event",
            412,
            errorCodes.MAX_REGISTRATIONS_REACHED
          )
        );
      }
    }
    //registering
    await User.findOneAndUpdate(
      {
        _id: req.user._id,
      },
      {
        $set: {
          [`registeredEvents.${req.body.eventCode}`]: registerTypes.REGISTERED,
        },
      }
    );
  }

  // to unregister
  else {
    //for non team events
    if (
      req.body.eventCode === eventCodes.ETALK ||
      req.body.eventCode === eventCodes.TRADING_WORKSHOP
    ) {
      if (
        user.registeredEvents[req.body.eventCode] ===
        registerTypes.NOT_REGISTERED // not registered
      ) {
        return next(
          new AppError(
            "Not Registered to event",
            412,
            errorCodes.NOT_REGISTERED
          )
        );
      }
      // unregistering
      await User.findOneAndUpdate(
        {
          _id: req.user._id,
        },
        {
          $set: {
            [`registeredEvents.${req.body.eventCode}`]:
              registerTypes.NOT_REGISTERED,
          },
        }
      );
    }
    //for team events
    else {
      if (
        user.registeredEvents[req.body.eventCode] ===
        registerTypes.NOT_REGISTERED // not registered
      ) {
        return next(
          new AppError(
            "Not Registered to event",
            412,
            errorCodes.NOT_REGISTERED
          )
        );
      }

      //part of teams check
      if (req.body.eventCode === eventCodes.IMPETUS) {
        if (user.impetusTeamId) {
          return next(
            new AppError(
              "Part of team. Cant unregister",
              412,
              errorCodes.PART_OF_TEAM_CANT_UNREGSITER
            )
          );
        }
      } else if (req.body.eventCode === eventCodes.EHACK) {
        if (user.eHackTeamId) {
          return next(
            new AppError(
              "Part of team. Cant unregister",
              412,
              errorCodes.PART_OF_TEAM_CANT_UNREGSITER
            )
          );
        }
      } else if (req.body.eventCode === eventCodes.INNOVENTURE) {
        if (user.innoventureTeamId) {
          return next(
            new AppError(
              "Part of team. Cant unregister",
              412,
              errorCodes.PART_OF_TEAM_CANT_UNREGSITER
            )
          );
        }
      }

      await User.findOneAndUpdate(
        {
          _id: req.user._id,
        },
        {
          $set: {
            [`registeredEvents.${req.body.eventCode}`]:
              registerTypes.NOT_REGISTERED,
          },
        }
      );
    }
  }

  res.status(201).json({
    message: "Done successfully",
    userId: user._id,
  });
});

exports.impetusSendRequest = catchAsync(async (req, res, next) => {
  const user = await User.findById({ _id: req.user._id });

  //validate team id
  if (req.params.teamId.length !== objectIdLength) {
    return next(
      new AppError("Invalid TeamId", 412, errorCodes.INVALID_TEAM_ID)
    );
  }

  //validating teamid
  const impetusTeam = await impetusTeams.findById({ _id: req.params.teamId });

  if (!impetusTeam) {
    return next(
      new AppError("Invalid TeamId", 412, errorCodes.INVALID_TEAM_ID)
    );
  }

  if (user.impetusPendingRequests >= 5) {
    return next(
      new AppError(
        "Can't send more than 5 requests",
        412,
        errorCodes.PENDING_REQUESTS_LIMIT_REACHED
      )
    );
  }

  //checking whether user is already a part of team
  if (user.impetusTeamId) {
    return next(
      new AppError(
        "User already part of a Team",
        412,
        errorCodes.USER_ALREADY_IN_TEAM
      )
    );
  }

  if (impetusTeam.members.length === 4) {
    return next(
      new AppError(
        "Team is Full. Can't Send Request",
        412,
        errorCodes.TEAM_IS_FULL
      )
    );
  }

  const isReqSentAlready = await impetusTeamLeaderApprovalsModel.findOne({
    userId: req.user._id,
    teamId: req.params.teamId,
    status: requestStatusTypes.PENDING_APPROVAL,
  });

  if (isReqSentAlready) {
    return next(
      new AppError(
        "Request already sent in other way. Approval Pending",
        412,
        errorCodes.PENDING_REQUEST_OTHER_MODEL
      )
    );
  }

  //checking whether request is already sent and is pending
  const request = await impetusPendingApprovals.findOne({
    userId: req.user._id,
    teamId: req.params.teamId,
    status: requestStatusTypes.PENDING_APPROVAL,
  });

  if (request) {
    return next(
      new AppError(
        "Request already sent. Approval Pending",
        412,
        errorCodes.REQUEST_ALREADY_SENT
      )
    );
  }

  const newRequest = await new impetusPendingApprovals({
    teamId: req.params.teamId,
    userId: req.user._id,
    status: requestStatusTypes.PENDING_APPROVAL,
  }).save();

  await User.findOneAndUpdate(
    {
      _id: req.user._id,
    },
    {
      $inc: { impetusPendingRequests: 1 },
    }
  );

  const teamLeader = await User.findById({ _id: impetusTeam.teamLeaderId });
  transporter.sendMail({
    from: process.env.NODEMAILER_EMAIL,
    to: teamLeader.email,
    subject:
      "ESUMMIT'23-ECELL-VIT. Pending Approval From a Participant for Impetus Event",
    html:
      user.firstName +
      " " +
      user.lastName +
      " " +
      "has sent a request to join your Impetus team " +
      impetusTeam.teamName +
      ".<br>" +
      "To Approve or reject the request click on the link https://esummit.ecellvit.com  <br>" +
      user.firstName +
      " " +
      user.lastName +
      "'s Mobile Number: " +
      user.mobileNumber +
      "<br>" +
      user.firstName +
      " " +
      user.lastName +
      "'s Email: " +
      user.email,
    auth: {
      user: process.env.NODEMAILER_EMAIL,
      refreshToken: process.env.NODEMAILER_REFRESH_TOKEN,
      accessToken: process.env.NODEMAILER_ACCESS_TOKEN,
      expires: 3599,
    },
  });

  res.status(201).json({
    message: "Sent request successfully",
    requestId: newRequest._id,
  });
});

exports.eHackSendRequest = catchAsync(async (req, res, next) => {
  const user = await User.findById({ _id: req.user._id });

  //validate team id
  if (req.params.teamId.length !== objectIdLength) {
    return next(
      new AppError("Invalid TeamId", 412, errorCodes.INVALID_TEAM_ID)
    );
  }

  //validating teamid
  const eHackTeam = await eHackTeams.findById({ _id: req.params.teamId });

  if (!eHackTeam) {
    return next(
      new AppError("Invalid TeamId", 412, errorCodes.INVALID_TEAM_ID)
    );
  }

  if (user.eHackPendingRequests >= 5) {
    return next(
      new AppError(
        "Can't send more than 5 requests",
        412,
        errorCodes.PENDING_REQUESTS_LIMIT_REACHED
      )
    );
  }

  //checking whether user is already a part of team
  if (user.eHackTeamId) {
    return next(
      new AppError(
        "User already part of a Team",
        412,
        errorCodes.USER_ALREADY_IN_TEAM
      )
    );
  }

  if (eHackTeam.members.length === 4) {
    return next(
      new AppError(
        "Team is Full. Can't Send Request",
        412,
        errorCodes.TEAM_IS_FULL
      )
    );
  }

  const isReqSentAlready = await eHackTeamLeaderApprovalsModel.findOne({
    userId: req.user._id,
    teamId: req.params.teamId,
    status: requestStatusTypes.PENDING_APPROVAL,
  });

  if (isReqSentAlready) {
    return next(
      new AppError(
        "Request already sent in other way. Approval Pending",
        412,
        errorCodes.PENDING_REQUEST_OTHER_MODEL
      )
    );
  }

  //checking whether request is already sent and is pending
  const request = await eHackPendingApprovals.findOne({
    userId: req.user._id,
    teamId: req.params.teamId,
    status: requestStatusTypes.PENDING_APPROVAL,
  });

  if (request) {
    return next(
      new AppError(
        "Request already sent. Approval Pending",
        412,
        errorCodes.REQUEST_ALREADY_SENT
      )
    );
  }

  const newRequest = await new eHackPendingApprovals({
    teamId: req.params.teamId,
    userId: req.user._id,
    status: requestStatusTypes.PENDING_APPROVAL,
  }).save();

  await User.findOneAndUpdate(
    {
      _id: req.user._id,
    },
    {
      $inc: { eHackPendingRequests: 1 },
    }
  );

  const teamLeader = await User.findById({ _id: eHackTeam.teamLeaderId });
  transporter.sendMail({
    from: process.env.NODEMAILER_EMAIL,
    to: teamLeader.email,
    subject:
      "ESUMMIT'23-ECELL-VIT. Pending Approval From a Participant for E-Hack Event",
    html:
      user.firstName +
      " " +
      user.lastName +
      " " +
      "has sent a request to join your E-Hack team " +
      eHackTeam.teamName +
      ".<br>" +
      "To Approve or reject the request click on the link https://esummit.ecellvit.com  <br>" +
      user.firstName +
      " " +
      user.lastName +
      "'s Mobile Number: " +
      user.mobileNumber +
      "<br>" +
      user.firstName +
      " " +
      user.lastName +
      "'s Email: " +
      user.email,
    auth: {
      user: process.env.NODEMAILER_EMAIL,
      refreshToken: process.env.NODEMAILER_REFRESH_TOKEN,
      accessToken: process.env.NODEMAILER_ACCESS_TOKEN,
      expires: 3599,
    },
  });

  res.status(201).json({
    message: "Sent request successfully",
    requestId: newRequest._id,
  });
});

exports.innoventureSendRequest = catchAsync(async (req, res, next) => {
  const user = await User.findById({ _id: req.user._id });

  //validate team id
  if (req.params.teamId.length !== objectIdLength) {
    return next(
      new AppError("Invalid TeamId", 412, errorCodes.INVALID_TEAM_ID)
    );
  }

  //validating teamid
  const innoventureTeam = await innoventureTeams.findById({
    _id: req.params.teamId,
  });

  if (!innoventureTeam) {
    return next(
      new AppError("Invalid TeamId", 412, errorCodes.INVALID_TEAM_ID)
    );
  }

  if (user.innoventurePendingRequests >= 5) {
    return next(
      new AppError(
        "Can't send more than 5 requests",
        412,
        errorCodes.PENDING_REQUESTS_LIMIT_REACHED
      )
    );
  }

  //checking whether user is already a part of team
  if (user.innoventureTeamId) {
    return next(
      new AppError(
        "User already part of a Team",
        412,
        errorCodes.USER_ALREADY_IN_TEAM
      )
    );
  }

  if (innoventureTeam.members.length === 4) {
    return next(
      new AppError(
        "Team is Full. Can't Send Request",
        412,
        errorCodes.TEAM_IS_FULL
      )
    );
  }

  const isReqSentAlready = await innoventureTeamLeaderApprovalsModel.findOne({
    userId: req.user._id,
    teamId: req.params.teamId,
    status: requestStatusTypes.PENDING_APPROVAL,
  });

  if (isReqSentAlready) {
    return next(
      new AppError(
        "Request already sent in other way. Approval Pending",
        412,
        errorCodes.PENDING_REQUEST_OTHER_MODEL
      )
    );
  }

  //checking whether request is already sent and is pending
  const request = await innoventurePendingApprovals.findOne({
    userId: req.user._id,
    teamId: req.params.teamId,
    status: requestStatusTypes.PENDING_APPROVAL,
  });

  if (request) {
    return next(
      new AppError(
        "Request already sent. Approval Pending",
        412,
        errorCodes.REQUEST_ALREADY_SENT
      )
    );
  }

  const newRequest = await new innoventurePendingApprovals({
    teamId: req.params.teamId,
    userId: req.user._id,
    status: requestStatusTypes.PENDING_APPROVAL,
  }).save();

  await User.findOneAndUpdate(
    {
      _id: req.user._id,
    },
    {
      $inc: { innoventurePendingRequests: 1 },
    }
  );

  const teamLeader = await User.findById({ _id: innoventureTeam.teamLeaderId });
  transporter.sendMail({
    from: process.env.NODEMAILER_EMAIL,
    to: teamLeader.email,
    subject:
      "ESUMMIT'23-ECELL-VIT. Pending Approval From a Participant for Innoventure Event",
    html:
      user.firstName +
      " " +
      user.lastName +
      " " +
      "has sent a request to join your Innoventure team " +
      innoventureTeam.teamName +
      ".<br>" +
      "To Approve or reject the request click on the link https://esummit.ecellvit.com  <br>" +
      user.firstName +
      " " +
      user.lastName +
      "'s Mobile Number: " +
      user.mobileNumber +
      "<br>" +
      user.firstName +
      " " +
      user.lastName +
      "'s Email: " +
      user.email,
    auth: {
      user: process.env.NODEMAILER_EMAIL,
      refreshToken: process.env.NODEMAILER_REFRESH_TOKEN,
      accessToken: process.env.NODEMAILER_ACCESS_TOKEN,
      expires: 3599,
    },
  });

  res.status(201).json({
    message: "Sent request successfully",
    requestId: newRequest._id,
  });
});

exports.impetusGetRequest = catchAsync(async (req, res, next) => {
  const user = await User.findById({ _id: req.user._id });

  //checking whether user is already a part of team
  if (user.impetusTeamId) {
    return next(
      new AppError(
        "User already part of a Team",
        412,
        errorCodes.USER_ALREADY_IN_TEAM
      )
    );
  }

  const requests = await impetusPendingApprovals
    .find({
      userId: req.user._id,
      status: requestStatusTypes.PENDING_APPROVAL,
    })
    .populate({
      path: "teamId",
      select: "teamName teamLeaderId members",
      populate: {
        path: "teamName teamLeaderId",
        select:
          "email firstName lastName mobileNumber impetusTeamRole eHackTeamRole innoventureTeamRole",
      },
    });

  res.status(200).json({
    message: "Get User Requests Successfull",
    requests,
  });
});

exports.eHackGetRequest = catchAsync(async (req, res, next) => {
  const user = await User.findById({ _id: req.user._id });

  //checking whether user is already a part of team
  if (user.eHackTeamId) {
    return next(
      new AppError(
        "User already part of a Team",
        412,
        errorCodes.USER_ALREADY_IN_TEAM
      )
    );
  }

  const requests = await eHackPendingApprovals
    .find({
      userId: req.user._id,
      status: requestStatusTypes.PENDING_APPROVAL,
    })
    .populate({
      path: "teamId",
      select: "teamName teamLeaderId members",
      populate: {
        path: "teamName teamLeaderId",
        select:
          "email firstName lastName mobileNumber impetusTeamRole eHackTeamRole innoventureTeamRole",
      },
    });

  res.status(200).json({
    message: "Get User Requests Successfull",
    requests,
  });
});

exports.innoventureGetRequest = catchAsync(async (req, res, next) => {
  const user = await User.findById({ _id: req.user._id });

  //checking whether user is already a part of team
  if (user.innoventureTeamId) {
    return next(
      new AppError(
        "User already part of a Team",
        412,
        errorCodes.USER_ALREADY_IN_TEAM
      )
    );
  }

  const requests = await innoventurePendingApprovals
    .find({
      userId: req.user._id,
      status: requestStatusTypes.PENDING_APPROVAL,
    })
    .populate({
      path: "teamId",
      select: "teamName teamLeaderId members",
      populate: {
        path: "teamName teamLeaderId",
        select:
          "email firstName lastName mobileNumber impetusTeamRole eHackTeamRole innoventureTeamRole",
      },
    });

  res.status(200).json({
    message: "Get User Requests Successfull",
    requests,
  });
});

exports.impetusRemoveRequest = catchAsync(async (req, res, next) => {
  const user = await User.findById({ _id: req.user._id });

  //validate team id
  if (req.params.teamId.length !== objectIdLength) {
    return next(
      new AppError("Invalid TeamId", 412, errorCodes.INVALID_TEAM_ID)
    );
  }

  //validating teamid
  const impetusTeam = await impetusTeams.findById({ _id: req.params.teamId });

  if (!impetusTeam) {
    return next(
      new AppError("Invalid TeamId", 412, errorCodes.INVALID_TEAM_ID)
    );
  }

  //checking whether user is already a part of team
  if (user.impetusTeamId) {
    return next(
      new AppError(
        "User already part of a Team",
        412,
        errorCodes.USER_ALREADY_IN_TEAM
      )
    );
  }

  //checking whether pending request is found
  const request = await impetusPendingApprovals.findOne({
    userId: req.user._id,
    teamId: req.params.teamId,
    status: requestStatusTypes.PENDING_APPROVAL,
  });

  if (!request) {
    return next(
      new AppError(
        "No Pending Request Found",
        412,
        errorCodes.NO_PENDING_REQUESTS
      )
    );
  }

  await impetusPendingApprovals.findOneAndDelete(
    {
      userId: req.user._id,
      teamId: req.params.teamId,
      status: requestStatusTypes.PENDING_APPROVAL,
    }
    // { $set: { status: requestStatusTypes.REQUEST_TAKEN_BACK } }
  );

  await User.findOneAndUpdate(
    {
      _id: req.user._id,
    },
    {
      $inc: { impetusPendingRequests: -1 },
    }
  );

  res.status(201).json({
    message: "Removed Request Successfully",
  });
});

exports.eHackRemoveRequest = catchAsync(async (req, res, next) => {
  const user = await User.findById({ _id: req.user._id });

  //validate team id
  if (req.params.teamId.length !== objectIdLength) {
    return next(
      new AppError("Invalid TeamId", 412, errorCodes.INVALID_TEAM_ID)
    );
  }

  //validating teamid
  const eHackTeam = await eHackTeams.findById({ _id: req.params.teamId });

  if (!eHackTeam) {
    return next(
      new AppError("Invalid TeamId", 412, errorCodes.INVALID_TEAM_ID)
    );
  }

  //checking whether user is already a part of team
  if (user.eHackTeamId) {
    return next(
      new AppError(
        "User already part of a Team",
        412,
        errorCodes.USER_ALREADY_IN_TEAM
      )
    );
  }

  //checking whether pending request is found
  const request = await eHackPendingApprovals.findOne({
    userId: req.user._id,
    teamId: req.params.teamId,
    status: requestStatusTypes.PENDING_APPROVAL,
  });

  if (!request) {
    return next(
      new AppError(
        "No Pending Request Found",
        412,
        errorCodes.NO_PENDING_REQUESTS
      )
    );
  }

  await eHackPendingApprovals.findOneAndDelete(
    {
      userId: req.user._id,
      teamId: req.params.teamId,
      status: requestStatusTypes.PENDING_APPROVAL,
    }
    // { $set: { status: requestStatusTypes.REQUEST_TAKEN_BACK } }
  );

  await User.findOneAndUpdate(
    {
      _id: req.user._id,
    },
    {
      $inc: { eHackPendingRequests: -1 },
    }
  );

  res.status(201).json({
    message: "Removed Request Successfully",
  });
});

exports.innoventureRemoveRequest = catchAsync(async (req, res, next) => {
  const user = await User.findById({ _id: req.user._id });

  //validate team id
  if (req.params.teamId.length !== objectIdLength) {
    return next(
      new AppError("Invalid TeamId", 412, errorCodes.INVALID_TEAM_ID)
    );
  }

  //validating teamid
  const innoventureTeam = await innoventureTeams.findById({
    _id: req.params.teamId,
  });

  if (!innoventureTeam) {
    return next(
      new AppError("Invalid TeamId", 412, errorCodes.INVALID_TEAM_ID)
    );
  }

  //checking whether user is already a part of team
  if (user.innoventureTeamId) {
    return next(
      new AppError(
        "User already part of a Team",
        412,
        errorCodes.USER_ALREADY_IN_TEAM
      )
    );
  }

  //checking whether pending request is found
  const request = await innoventurePendingApprovals.findOne({
    userId: req.user._id,
    teamId: req.params.teamId,
    status: requestStatusTypes.PENDING_APPROVAL,
  });

  if (!request) {
    return next(
      new AppError(
        "No Pending Request Found",
        412,
        errorCodes.NO_PENDING_REQUESTS
      )
    );
  }

  await innoventurePendingApprovals.findOneAndDelete(
    {
      userId: req.user._id,
      teamId: req.params.teamId,
      status: requestStatusTypes.PENDING_APPROVAL,
    }
    // { $set: { status: requestStatusTypes.REQUEST_TAKEN_BACK } }
  );

  await User.findOneAndUpdate(
    {
      _id: req.user._id,
    },
    {
      $inc: { innoventurePendingApprovals: -1 },
    }
  );

  res.status(201).json({
    message: "Removed Request Successfully",
  });
});

exports.fillUserDetails = catchAsync(async (req, res, next) => {
  //body validation
  const { error } = fillUserDetailsBodyValidation(req.body);
  if (error) {
    return next(
      new AppError(
        error.details[0].message,
        400,
        errorCodes.INPUT_PARAMS_INVALID
      )
    );
  }

  await User.updateOne(
    { _id: req.user._id },
    {
      $set: {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        mobileNumber: req.body.mobileNumber,
        regNo: req.body.regNo,
        hasFilledDetails: true,
      },
    }
  );

  res.status(201).json({
    message: "User Details Filled successfully",
    userId: req.user._id,
  });
});

exports.hasFilledDetails = catchAsync(async (req, res, next) => {
  const { error } = hasFilledDetailsBodyValidation(req.body);
  if (error) {
    return next(
      new AppError(
        error.details[0].message,
        400,
        errorCodes.INPUT_PARAMS_INVALID
      )
    );
  }

  const token = req.body.token;
  const emailFromClient = req.body.email;

  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  if (!ticket) {
    return next(
      new AppError(
        "Please SignOut and SignIn Again",
        401,
        errorCodes.INVALID_TOKEN
      )
    );
  }

  const { email } = ticket.getPayload();
  if (email !== emailFromClient) {
    return next(
      new AppError(
        "Please SignOut and SignIn Again",
        401,
        errorCodes.INVALID_TOKEN
      )
    );
  }

  const user = await User.findOne({ email: emailFromClient });

  return res.status(201).json({
    message: "Checking User Successfull",
    impetusTeamId: user.impetusTeamId,
    eHackTeamId: user.eHackTeamId,
    innoventureTeamId: user.innoventureTeamId,
    hasFilledDetails: user.hasFilledDetails,
  });
});

exports.impetusLeaveTeam = catchAsync(async (req, res, next) => {
  //validating teamid
  if (req.params.teamId.length !== objectIdLength) {
    return next(
      new AppError("Invalid TeamId", 412, errorCodes.INVALID_TEAM_ID)
    );
  }

  const impetusTeam = await impetusTeams
    .findById({ _id: req.params.teamId })
    .populate(["teamLeaderId", "members"]);

  //validate team id
  if (!impetusTeam) {
    return next(
      new AppError("Invalid TeamId", 412, errorCodes.INVALID_TEAM_ID)
    );
  }

  const user = await User.findById({ _id: req.user._id });

  //check if user is part of given team
  if (
    user.impetusTeamId == null ||
    user.impetusTeamId.toString() !== req.params.teamId
  ) {
    return next(
      new AppError(
        "User is not part of given TeamID or user isn't part of any Team",
        412,
        errorCodes.INVALID_USERID_FOR_TEAMID
      )
    );
  }

  //check the role. Leader can leave team remove members and delete team.
  if (user.impetusTeamRole === teamRole.LEADER) {
    return next(
      new AppError(
        "Leader can't Leave the Team",
        412,
        errorCodes.USER_IS_LEADER
      )
    );
  }

  await User.findOneAndUpdate(
    { _id: req.user._id },
    { impetusTeamId: null, impetusTeamRole: null }
  );

  await impetusTeams.findOneAndUpdate(
    { _id: req.params.teamId },
    { $pull: { members: req.user._id } }
  );

  // await impetusPendingApprovals.findOneAndUpdate(
  //   {
  //     userId: req.user._id,
  //     teamId: req.params.teamId,
  //     $or: [
  //       { status: requestStatusTypes.APPROVED },
  //       { status: requestStatusTypes.JOINED_VIA_TOKEN },
  //     ],
  //   },
  //   {
  //     $set: { status: requestStatusTypes.LEFT_TEAM },
  //   }
  // );

  res.status(201).json({
    message: "Leaving Team Successfull",
  });
});

exports.eHackLeaveTeam = catchAsync(async (req, res, next) => {
  //validating teamid
  if (req.params.teamId.length !== objectIdLength) {
    return next(
      new AppError("Invalid TeamId", 412, errorCodes.INVALID_TEAM_ID)
    );
  }

  const eHackTeam = await eHackTeams
    .findById({ _id: req.params.teamId })
    .populate(["teamLeaderId", "members"]);

  //validate team id
  if (!eHackTeam) {
    return next(
      new AppError("Invalid TeamId", 412, errorCodes.INVALID_TEAM_ID)
    );
  }

  const user = await User.findById({ _id: req.user._id });

  //check if user is part of given team
  if (
    user.eHackTeamId == null ||
    user.eHackTeamId.toString() !== req.params.teamId
  ) {
    return next(
      new AppError(
        "User is not part of given TeamID or user isn't part of any Team",
        412,
        errorCodes.INVALID_USERID_FOR_TEAMID
      )
    );
  }

  //check the role. Leader can leave team remove members and delete team.
  if (user.eHackTeamRole === teamRole.LEADER) {
    return next(
      new AppError(
        "Leader can't Leave the Team",
        412,
        errorCodes.USER_IS_LEADER
      )
    );
  }

  await User.findOneAndUpdate(
    { _id: req.user._id },
    { eHackTeamId: null, eHackTeamRole: null }
  );

  await eHackTeams.findOneAndUpdate(
    { _id: req.params.teamId },
    { $pull: { members: req.user._id } }
  );

  // await eHackPendingApprovals.findOneAndUpdate(
  //   {
  //     userId: req.user._id,
  //     teamId: req.params.teamId,
  //     $or: [
  //       { status: requestStatusTypes.APPROVED },
  //       { status: requestStatusTypes.JOINED_VIA_TOKEN },
  //     ],
  //   },
  //   {
  //     $set: { status: requestStatusTypes.LEFT_TEAM },
  //   }
  // );

  res.status(201).json({
    message: "Leaving Team Successfull",
  });
});

exports.innoventureLeaveTeam = catchAsync(async (req, res, next) => {
  //validating teamid
  if (req.params.teamId.length !== objectIdLength) {
    return next(
      new AppError("Invalid TeamId", 412, errorCodes.INVALID_TEAM_ID)
    );
  }

  const innoventureTeam = await innoventureTeams
    .findById({ _id: req.params.teamId })
    .populate(["teamLeaderId", "members"]);

  //validate team id
  if (!innoventureTeam) {
    return next(
      new AppError("Invalid TeamId", 412, errorCodes.INVALID_TEAM_ID)
    );
  }

  const user = await User.findById({ _id: req.user._id });

  //check if user is part of given team
  if (
    user.innoventureTeamId == null ||
    user.innoventureTeamId.toString() !== req.params.teamId
  ) {
    return next(
      new AppError(
        "User is not part of given TeamID or user isn't part of any Team",
        412,
        errorCodes.INVALID_USERID_FOR_TEAMID
      )
    );
  }

  //check the role. Leader can leave team remove members and delete team.
  if (user.innoventureTeamRole === teamRole.LEADER) {
    return next(
      new AppError(
        "Leader can't Leave the Team",
        412,
        errorCodes.USER_IS_LEADER
      )
    );
  }

  await User.findOneAndUpdate(
    { _id: req.user._id },
    { innoventureTeamId: null, innoventureTeamRole: null }
  );

  await innoventureTeams.findOneAndUpdate(
    { _id: req.params.teamId },
    { $pull: { members: req.user._id } }
  );

  // await innoventurePendingApprovals.findOneAndUpdate(
  //   {
  //     userId: req.user._id,
  //     teamId: req.params.teamId,
  //     $or: [
  //       { status: requestStatusTypes.APPROVED },
  //       { status: requestStatusTypes.JOINED_VIA_TOKEN },
  //     ],
  //   },
  //   {
  //     $set: { status: requestStatusTypes.LEFT_TEAM },
  //   }
  // );

  res.status(201).json({
    message: "Leaving Team Successfull",
  });
});

exports.impetusJoinTeamViaToken = catchAsync(async (req, res, next) => {
  //body validation
  const { error } = joinTeamViaTokenBodyValidation(req.body);
  if (error) {
    return next(
      new AppError(
        error.details[0].message,
        400,
        errorCodes.INPUT_PARAMS_INVALID
      )
    );
  }

  const user = await User.findById({ _id: req.user._id });

  // if user  is already in a team
  if (user.impetusTeamId) {
    return next(
      new AppError(
        "User already part of a Team",
        412,
        errorCodes.USER_ALREADY_IN_TEAM
      )
    );
  }

  verifyTeamToken(req.body.token)
    .then(async ({ teamTokenDetails }) => {
      const impetusTeam = await impetusTeams.findById({
        _id: teamTokenDetails._id,
      });

      if (impetusTeam.members.length === 4) {
        return next(new AppError("Team is Full", 412, errorCodes.TEAM_IS_FULL));
      }

      //updating users teamid and role
      await User.findOneAndUpdate(
        {
          _id: req.user._id,
        },
        {
          $set: {
            impetusTeamId: impetusTeam._id,
            impetusTeamRole: teamRole.MEMBER,
            impetusPendingRequests: 0,
          },
        }
      );

      //updating pending approvals model of particular team id to a status
      await impetusPendingApprovals.deleteMany(
        {
          // teamId: impetusTeam._id,
          userId: req.user._id,
          status: requestStatusTypes.PENDING_APPROVAL,
        }
        // { $set: { status: requestStatusTypes.JOINED_VIA_TOKEN } }
      );

      await impetusTeamLeaderApprovalsModel.deleteMany({
        userId: req.user._id,
        status: requestStatusTypes.PENDING_APPROVAL,
      });
      //updating pending approvals model of all other team ids to added to other team
      // await impetusPendingApprovals.updateMany(
      //   {
      //     userId: req.user._id,
      //     status: requestStatusTypes.PENDING_APPROVAL,
      //   },
      //   { $set: { status: requestStatusTypes.ADDED_TO_OTHER_TEAM } }
      // );

      //updating team
      await impetusTeams.findOneAndUpdate(
        {
          _id: impetusTeam._id,
        },
        {
          $push: { members: req.user._id },
        }
      );

      res.status(201).json({
        message: "Joined Team Successfully",
        teamId: impetusTeam._id,
      });
    })
    .catch((err) => {
      return next(
        new AppError("Invalid Team Token", 412, errorCodes.INVALID_TEAM_TOKEN)
      );
    });
});

exports.eHackJoinTeamViaToken = catchAsync(async (req, res, next) => {
  //body validation
  const { error } = joinTeamViaTokenBodyValidation(req.body);
  if (error) {
    return next(
      new AppError(
        error.details[0].message,
        400,
        errorCodes.INPUT_PARAMS_INVALID
      )
    );
  }

  const user = await User.findById({ _id: req.user._id });

  // if user  is already in a team
  if (user.eHackTeamId) {
    return next(
      new AppError(
        "User already part of a Team",
        412,
        errorCodes.USER_ALREADY_IN_TEAM
      )
    );
  }

  verifyTeamToken(req.body.token)
    .then(async ({ teamTokenDetails }) => {
      const eHackTeam = await eHackTeams.findById({
        _id: teamTokenDetails._id,
      });

      if (eHackTeam.members.length === 4) {
        return next(new AppError("Team is Full", 412, errorCodes.TEAM_IS_FULL));
      }

      //updating users teamid and role
      await User.findOneAndUpdate(
        {
          _id: req.user._id,
        },
        {
          $set: {
            eHackTeamId: eHackTeam._id,
            eHackTeamRole: teamRole.MEMBER,
            eHackPendingRequests: 0,
          },
        }
      );

      //updating pending approvals model of particular team id to a status
      await eHackPendingApprovals.deleteMany(
        {
          // teamId: eHackTeam._id,
          userId: req.user._id,
          status: requestStatusTypes.PENDING_APPROVAL,
        }
        // { $set: { status: requestStatusTypes.JOINED_VIA_TOKEN } }
      );

      await eHackTeamLeaderApprovalsModel.deleteMany({
        userId: req.user._id,
        status: requestStatusTypes.PENDING_APPROVAL,
      });

      //updating pending approvals model of all other team ids to added to other team
      // await eHackPendingApprovals.updateMany(
      //   {
      //     userId: req.user._id,
      //     status: requestStatusTypes.PENDING_APPROVAL,
      //   },
      //   { $set: { status: requestStatusTypes.ADDED_TO_OTHER_TEAM } }
      // );

      //updating team
      await eHackTeams.findOneAndUpdate(
        {
          _id: eHackTeam._id,
        },
        {
          $push: { members: req.user._id },
        }
      );

      res.status(201).json({
        message: "Joined Team Successfully",
        teamId: eHackTeam._id,
      });
    })
    .catch((err) => {
      return next(
        new AppError("Invalid Team Token", 412, errorCodes.INVALID_TEAM_TOKEN)
      );
    });
});

exports.innoventureJoinTeamViaToken = catchAsync(async (req, res, next) => {
  //body validation
  const { error } = joinTeamViaTokenBodyValidation(req.body);
  if (error) {
    return next(
      new AppError(
        error.details[0].message,
        400,
        errorCodes.INPUT_PARAMS_INVALID
      )
    );
  }

  const user = await User.findById({ _id: req.user._id });

  // if user  is already in a team
  if (user.innoventureTeamId) {
    return next(
      new AppError(
        "User already part of a Team",
        412,
        errorCodes.USER_ALREADY_IN_TEAM
      )
    );
  }

  verifyTeamToken(req.body.token)
    .then(async ({ teamTokenDetails }) => {
      const innoventureTeam = await innoventureTeams.findById({
        _id: teamTokenDetails._id,
      });

      if (innoventureTeam.members.length === 4) {
        return next(new AppError("Team is Full", 412, errorCodes.TEAM_IS_FULL));
      }

      //updating users teamid and role
      await User.findOneAndUpdate(
        {
          _id: req.user._id,
        },
        {
          $set: {
            innoventureTeamId: innoventureTeam._id,
            innoventureTeamRole: teamRole.MEMBER,
            innoventurePendingRequests: 0,
          },
        }
      );

      //updating pending approvals model of particular team id to a status
      await innoventurePendingApprovals.deleteMany(
        {
          // teamId: innoventureTeam._id,
          userId: req.user._id,
          status: requestStatusTypes.PENDING_APPROVAL,
        }
        // { $set: { status: requestStatusTypes.JOINED_VIA_TOKEN } }
      );

      await innoventureTeamLeaderApprovalsModel.deleteMany({
        userId: req.user._id,
        status: requestStatusTypes.PENDING_APPROVAL,
      });
      //updating pending approvals model of all other team ids to added to other team
      // await innoventurePendingApprovals.updateMany(
      //   {
      //     userId: req.user._id,
      //     status: requestStatusTypes.PENDING_APPROVAL,
      //   },
      //   { $set: { status: requestStatusTypes.ADDED_TO_OTHER_TEAM } }
      // );

      //updating team
      await innoventureTeams.findOneAndUpdate(
        {
          _id: innoventureTeam._id,
        },
        {
          $push: { members: req.user._id },
        }
      );

      res.status(201).json({
        message: "Joined Team Successfully",
        teamId: innoventureTeam._id,
      });
    })
    .catch((err) => {
      return next(
        new AppError("Invalid Team Token", 412, errorCodes.INVALID_TEAM_TOKEN)
      );
    });
});

//--------------------------------------------------------->

exports.getDetails = catchAsync(async (req, res, next) => {
  const user = await User.findById(
    { _id: req.user._id },
    {
      email: 1,
      firstName: 1,
      lastName: 1,
      mobileNumber: 1,
      registeredEvents: 1,
      impetusTeamRole: 1,
      eHackTeamRole: 1,
      innoventureTeamRole: 1,
      eHackPendingRequests: 1,
      impetusPendingRequests: 1,
      innoventurePendingRequests: 1,
    }
  ).populate([
    {
      path: "impetusTeamId",
      select: { teamName: 1 },
      populate: {
        path: "members",
        model: "Users",
        select: {
          email: 1,
          firstName: 1,
          lastName: 1,
          mobileNumber: 1,
          impetusTeamRole: 1,
          eHackTeamRole: 1,
          innoventureTeamRole: 1,
        },
      },
    },
    {
      path: "eHackTeamId",
      select: { teamName: 1 },
      populate: {
        path: "members",
        model: "Users",
        select: {
          email: 1,
          firstName: 1,
          lastName: 1,
          mobileNumber: 1,
          impetusTeamRole: 1,
          eHackTeamRole: 1,
          innoventureTeamRole: 1,
        },
      },
    },
    {
      path: "innoventureTeamId",
      select: { teamName: 1 },
      populate: {
        path: "members",
        model: "Users",
        select: {
          email: 1,
          firstName: 1,
          lastName: 1,
          mobileNumber: 1,
          impetusTeamRole: 1,
          eHackTeamRole: 1,
          innoventureTeamRole: 1,
        },
      },
    },
  ]);
  res.status(200).json({
    message: "Getting User Details Successfull",
    user,
  });
});

exports.impetusGetMemberRequest = catchAsync(async (req, res, next) => {
  const user = await User.findById({ _id: req.user._id });

  if (user.impetusTeamId) {
    return next(
      new AppError(
        "User already part of a Team",
        412,
        errorCodes.USER_ALREADY_IN_TEAM
      )
    );
  }

  const requests = await impetusTeamLeaderApprovalsModel
    .find({
      userId: req.user._id,
      status: requestStatusTypes.PENDING_APPROVAL,
    })
    .populate({
      path: "teamId",
      select: "teamName teamLeaderId members",
      populate: {
        path: "teamName teamLeaderId",
        select: "email firstName lastName mobileNumber",
      },
    });

  res.status(200).json({
    message: "Get impetus add members Requests Successfull",
    requests,
  });
});

exports.eHackGetMemberRequest = catchAsync(async (req, res, next) => {
  const user = await User.findById({ _id: req.user._id });

  if (user.eHackTeamId) {
    return next(
      new AppError(
        "User already part of a Team",
        412,
        errorCodes.USER_ALREADY_IN_TEAM
      )
    );
  }

  const requests = await eHackTeamLeaderApprovalsModel
    .find({
      userId: req.user._id,
      status: requestStatusTypes.PENDING_APPROVAL,
    })
    .populate({
      path: "teamId",
      select: "teamName teamLeaderId members",
      populate: {
        path: "teamName teamLeaderId",
        select: "email firstName lastName mobileNumber",
      },
    });

  res.status(200).json({
    message: "Get EHack add members Requests Successfull",
    requests,
  });
});

exports.innoventureGetMemberRequest = catchAsync(async (req, res, next) => {
  const user = await User.findById({ _id: req.user._id });

  if (user.innoventureTeamId) {
    return next(
      new AppError(
        "User already part of a Team",
        412,
        errorCodes.USER_ALREADY_IN_TEAM
      )
    );
  }

  const requests = await innoventureTeamLeaderApprovalsModel
    .find({
      userId: req.user._id,
      status: requestStatusTypes.PENDING_APPROVAL,
    })
    .populate({
      path: "teamId",
      select: "teamName teamLeaderId members",
      populate: {
        path: "teamName teamLeaderId",
        select: "email firstName lastName mobileNumber",
      },
    });

  res.status(200).json({
    message: "Get Innoventure add members Requests Successfull",
    requests,
  });
});

exports.impetusUpdateMemberRequest = catchAsync(async (req, res, next) => {
  //body validation
  const { error } = updateRequestBodyValidation(req.body);
  if (error) {
    return next(
      new AppError(
        error.details[0].message,
        400,
        errorCodes.INPUT_PARAMS_INVALID
      )
    );
  }

  const user = await User.findById({ _id: req.user._id });

  if (user.impetusTeamId) {
    return next(
      new AppError(
        "User already part of a Team",
        412,
        errorCodes.USER_ALREADY_IN_TEAM
      )
    );
  }

  if (req.params.teamId.length !== objectIdLength) {
    return next(
      new AppError("Invalid TeamId", 412, errorCodes.INVALID_TEAM_ID)
    );
  }

  //validating teamid
  const impetusTeam = await impetusTeams.findById({
    _id: req.params.teamId,
  });

  const teamLeaderId = impetusTeam.teamLeaderId;
  if (!impetusTeam) {
    return next(
      new AppError("Invalid TeamId", 412, errorCodes.INVALID_TEAM_ID)
    );
  }

  //searching for pending request
  const request = await impetusTeamLeaderApprovalsModel.findOne({
    userId: req.user._id,
    teamId: req.params.teamId,
    status: requestStatusTypes.PENDING_APPROVAL,
  });

  if (!request) {
    return next(
      new AppError(
        "No Pending Request Found",
        412,
        errorCodes.NO_PENDING_REQUESTS
      )
    );
  }

  //checking status and updtaing
  if (req.body.status === approvalStatusTypes.REJECTED) {
    await impetusTeamLeaderApprovalsModel.findOneAndDelete(
      {
        userId: req.user._id,
        teamId: req.params.teamId,
        status: requestStatusTypes.PENDING_APPROVAL,
      }
      // { $set: { status: requestStatusTypes.REJECTED } }
    );

    await impetusTeams.findOneAndUpdate(
      {
        _id: req.params.teamId,
      },
      {
        $inc: { noOfPendingRequests: -1 },
      }
    );
  }

  if (req.body.status === approvalStatusTypes.APPROVED) {
    if (impetusTeam.members.length === 4) {
      return next(
        new AppError("E Hack Team is Full", 412, errorCodes.TEAM_IS_FULL)
      );
    }
    //updating users teamid and role
    await User.findOneAndUpdate(
      {
        _id: req.user._id,
      },
      {
        $set: {
          impetusTeamId: req.params.teamId,
          impetusTeamRole: teamRole.MEMBER,
          impetusPendingRequests: 0,
        },
      }
    );

    //updating pending approvals model of particular innoventureTeam id to approved
    await impetusTeamLeaderApprovalsModel.deleteMany(
      {
        userId: req.user._id,
        // teamId: req.params.teamId,
        status: requestStatusTypes.PENDING_APPROVAL,
      }
      // { $set: { status: requestStatusTypes.APPROVED } }
    );

    await impetusPendingApprovals.deleteMany(
      {
        userId: req.user._id,
        // teamId: req.params.teamId,
        status: requestStatusTypes.PENDING_APPROVAL,
      }
      // { $set: { status: requestStatusTypes.APPROVED } }
    );

    //updating pending approvals model of all other innoventureTeam ids to added to other innoventureTeam
    // await innoventurePendingApprovals.updateMany(
    //   {
    //     userId: req.body.userId,
    //     status: requestStatusTypes.PENDING_APPROVAL,
    //   },
    //   { $set: { status: requestStatusTypes.ADDED_TO_OTHER_TEAM } }
    // );

    await impetusTeams.findOneAndUpdate(
      {
        _id: req.params.teamId,
      },
      {
        $push: { members: req.user._id },
      }
    );

    if (impetusTeam.members.length === 3) {
      await impetusTeamLeaderApprovalsModel.deleteMany({
        teamId: req.params.teamId,
        status: requestStatusTypes.PENDING_APPROVAL,
      });

      await impetusTeams.findOneAndUpdate(
        {
          _id: req.params.teamId,
        },
        {
          $set: { noOfPendingRequests: 0 },
        }
      );
    } else {
      await impetusTeams.findOneAndUpdate(
        {
          _id: req.params.teamId,
        },
        {
          $inc: { noOfPendingRequests: -1 },
        }
      );
    }

    const teamLeader = await User.findById({ _id: teamLeaderId });
    transporter.sendMail({
      from: process.env.NODEMAILER_EMAIL,
      to: teamLeader.email,
      subject:
        "ESUMMIT'23 ECELL-VIT. Request Approved By the Impetus Participant",
      html:
        teamLeader.firstName +
        " " +
        teamLeader.lastName +
        " " +
        "your request is approved by the Impetus Participant " +
        user.firstName +
        " " +
        user.lastName +
        ".<br>" +
        "Click on the link to view the team details https://esummit.ecellvit.com  <br>",
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        refreshToken: process.env.NODEMAILER_REFRESH_TOKEN,
        accessToken: process.env.NODEMAILER_ACCESS_TOKEN,
        expires: 3599,
      },
    });
  }

  res.status(201).json({
    message: "Updated Request Successfully",
  });
});

exports.eHackUpdateMemberRequest = catchAsync(async (req, res, next) => {
  //body validation
  const { error } = updateRequestBodyValidation(req.body);
  if (error) {
    return next(
      new AppError(
        error.details[0].message,
        400,
        errorCodes.INPUT_PARAMS_INVALID
      )
    );
  }

  const user = await User.findById({ _id: req.user._id });

  if (user.eHackTeamId) {
    return next(
      new AppError(
        "User already part of a Team",
        412,
        errorCodes.USER_ALREADY_IN_TEAM
      )
    );
  }

  if (req.params.teamId.length !== objectIdLength) {
    return next(
      new AppError("Invalid TeamId", 412, errorCodes.INVALID_TEAM_ID)
    );
  }

  //validating teamid
  const eHackTeam = await eHackTeams.findById({
    _id: req.params.teamId,
  });

  const teamLeaderId = eHackTeam.teamLeaderId;

  if (!eHackTeam) {
    return next(
      new AppError("Invalid TeamId", 412, errorCodes.INVALID_TEAM_ID)
    );
  }

  //searching for pending request
  const request = await eHackTeamLeaderApprovalsModel.findOne({
    userId: req.user._id,
    teamId: req.params.teamId,
    status: requestStatusTypes.PENDING_APPROVAL,
  });

  if (!request) {
    return next(
      new AppError(
        "No Pending Request Found",
        412,
        errorCodes.NO_PENDING_REQUESTS
      )
    );
  }

  //checking status and updtaing
  if (req.body.status === approvalStatusTypes.REJECTED) {
    await eHackTeamLeaderApprovalsModel.findOneAndDelete(
      {
        userId: req.user._id,
        teamId: req.params.teamId,
        status: requestStatusTypes.PENDING_APPROVAL,
      }
      // { $set: { status: requestStatusTypes.REJECTED } }
    );

    await eHackTeams.findOneAndUpdate(
      {
        _id: req.params.teamId,
      },
      {
        $inc: { noOfPendingRequests: -1 },
      }
    );
  }

  if (req.body.status === approvalStatusTypes.APPROVED) {
    if (eHackTeam.members.length === 4) {
      return next(
        new AppError("E Hack Team is Full", 412, errorCodes.TEAM_IS_FULL)
      );
    }
    //updating users teamid and role
    await User.findOneAndUpdate(
      {
        _id: req.user._id,
      },
      {
        $set: {
          eHackTeamId: req.params.teamId,
          eHackTeamRole: teamRole.MEMBER,
          eHackPendingRequests: 0,
        },
      }
    );

    //updating pending approvals model of particular innoventureTeam id to approved
    await eHackTeamLeaderApprovalsModel.deleteMany(
      {
        userId: req.user._id,
        // teamId: req.params.teamId,
        status: requestStatusTypes.PENDING_APPROVAL,
      }
      // { $set: { status: requestStatusTypes.APPROVED } }
    );

    //updating pending approvals model of all other innoventureTeam ids to added to other innoventureTeam
    // await innoventurePendingApprovals.updateMany(
    //   {
    //     userId: req.body.userId,
    //     status: requestStatusTypes.PENDING_APPROVAL,
    //   },
    //   { $set: { status: requestStatusTypes.ADDED_TO_OTHER_TEAM } }
    // );

    await eHackTeams.findOneAndUpdate(
      {
        _id: req.params.teamId,
      },
      {
        $push: { members: req.user._id },
      }
    );

    if (eHackTeam.members.length === 3) {
      await eHackTeamLeaderApprovalsModel.deleteMany({
        teamId: req.params.teamId,
        status: requestStatusTypes.PENDING_APPROVAL,
      });

      await eHackTeams.findOneAndUpdate(
        {
          _id: req.params.teamId,
        },
        {
          $set: { noOfPendingRequests: 0 },
        }
      );
    } else {
      await eHackTeams.findOneAndUpdate(
        {
          _id: req.params.teamId,
        },
        {
          $inc: { noOfPendingRequests: -1 },
        }
      );
    }

    const teamLeader = await User.findById({ _id: teamLeaderId });
    transporter.sendMail({
      from: process.env.NODEMAILER_EMAIL,
      to: teamLeader.email,
      subject:
        "ESUMMIT'23 ECELL-VIT. Request Approved By the E-Hack Participant",
      html:
        teamLeader.firstName +
        " " +
        teamLeader.lastName +
        " " +
        "your request is approved by the E-Hack Participant " +
        user.firstName +
        " " +
        user.lastName +
        ".<br>" +
        "Click on the link to view the team details https://esummit.ecellvit.com  <br>",
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        refreshToken: process.env.NODEMAILER_REFRESH_TOKEN,
        accessToken: process.env.NODEMAILER_ACCESS_TOKEN,
        expires: 3599,
      },
    });
  }

  res.status(201).json({
    message: "Updated Request Successfully",
  });
});

exports.innoventureUpdateMemberRequest = catchAsync(async (req, res, next) => {
  //body validation
  const { error } = updateRequestBodyValidation(req.body);
  if (error) {
    return next(
      new AppError(
        error.details[0].message,
        400,
        errorCodes.INPUT_PARAMS_INVALID
      )
    );
  }

  const user = await User.findById({ _id: req.user._id });

  if (user.innoventureTeamId) {
    return next(
      new AppError(
        "User already part of a Team",
        412,
        errorCodes.USER_ALREADY_IN_TEAM
      )
    );
  }

  if (req.params.teamId.length !== objectIdLength) {
    return next(
      new AppError("Invalid TeamId", 412, errorCodes.INVALID_TEAM_ID)
    );
  }

  //validating teamid
  const innoventureTeam = await innoventureTeams.findById({
    _id: req.params.teamId,
  });

  const teamLeaderId = innoventureTeam.teamLeaderId;

  if (!innoventureTeam) {
    return next(
      new AppError("Invalid TeamId", 412, errorCodes.INVALID_TEAM_ID)
    );
  }

  //searching for pending request
  const request = await innoventureTeamLeaderApprovalsModel.findOne({
    userId: req.user._id,
    teamId: req.params.teamId,
    status: requestStatusTypes.PENDING_APPROVAL,
  });

  if (!request) {
    return next(
      new AppError(
        "No Pending Request Found",
        412,
        errorCodes.NO_PENDING_REQUESTS
      )
    );
  }

  //checking status and updtaing
  if (req.body.status === approvalStatusTypes.REJECTED) {
    await innoventureTeamLeaderApprovalsModel.findOneAndDelete(
      {
        userId: req.user._id,
        teamId: req.params.teamId,
        status: requestStatusTypes.PENDING_APPROVAL,
      }
      // { $set: { status: requestStatusTypes.REJECTED } }
    );

    await innoventureTeams.findOneAndUpdate(
      {
        _id: req.params.teamId,
      },
      {
        $inc: { noOfPendingRequests: -1 },
      }
    );
  }

  if (req.body.status === approvalStatusTypes.APPROVED) {
    if (innoventureTeam.members.length === 4) {
      return next(
        new AppError("E Hack Team is Full", 412, errorCodes.TEAM_IS_FULL)
      );
    }
    //updating users teamid and role
    await User.findOneAndUpdate(
      {
        _id: req.user._id,
      },
      {
        $set: {
          innoventureTeamId: req.params.teamId,
          innoventureTeamRole: teamRole.MEMBER,
          innoventurePendingRequests: 0,
        },
      }
    );

    //updating pending approvals model of particular innoventureTeam id to approved
    await innoventureTeamLeaderApprovalsModel.deleteMany(
      {
        userId: req.user._id,
        // teamId: req.params.teamId,
        status: requestStatusTypes.PENDING_APPROVAL,
      }
      // { $set: { status: requestStatusTypes.APPROVED } }
    );

    //updating pending approvals model of all other innoventureTeam ids to added to other innoventureTeam
    // await innoventurePendingApprovals.updateMany(
    //   {
    //     userId: req.body.userId,
    //     status: requestStatusTypes.PENDING_APPROVAL,
    //   },
    //   { $set: { status: requestStatusTypes.ADDED_TO_OTHER_TEAM } }
    // );

    await innoventureTeams.findOneAndUpdate(
      {
        _id: req.params.teamId,
      },
      {
        $push: { members: req.user._id },
      }
    );

    if (innoventureTeam.members.length === 3) {
      await innoventureTeamLeaderApprovalsModel.deleteMany({
        teamId: req.params.teamId,
        status: requestStatusTypes.PENDING_APPROVAL,
      });

      await innoventureTeams.findOneAndUpdate(
        {
          _id: req.params.teamId,
        },
        {
          $set: { noOfPendingRequests: 0 },
        }
      );
    } else {
      await innoventureTeams.findOneAndUpdate(
        {
          _id: req.params.teamId,
        },
        {
          $inc: { noOfPendingRequests: -1 },
        }
      );
    }

    const teamLeader = await User.findById({ _id: teamLeaderId });
    transporter.sendMail({
      from: process.env.NODEMAILER_EMAIL,
      to: teamLeader.email,
      subject:
        "ESUMMIT'23 ECELL-VIT. Request Approved By the Innoventure Participant",
      html:
        teamLeader.firstName +
        " " +
        teamLeader.lastName +
        " " +
        "your request is approved by the Innoventure Participant " +
        user.firstName +
        " " +
        user.lastName +
        ".<br>" +
        "Click on the link to view the team details https://esummit.ecellvit.com  <br>",
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        refreshToken: process.env.NODEMAILER_REFRESH_TOKEN,
        accessToken: process.env.NODEMAILER_ACCESS_TOKEN,
        expires: 3599,
      },
    });
  }

  res.status(201).json({
    message: "Updated Request Successfully",
  });
});
