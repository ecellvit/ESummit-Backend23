const User = require("../../models/userModel");
const impetusTeams = require("../../models/impetusTeamModel");
const impetusPendingApprovals = require("../../models/impetusPendingAprrovalsModel");
const impetusTeamLeaderApprovalsModel = require("../../models/impetusTeamLeaderPendingApprovalsModel");
const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const {
  errorCodes,
  requestStatusTypes,
  teamRole,
  approvalStatusTypes,
  objectIdLength,
  eventCodes,
} = require("../../utils/constants");
const {
  createTeamBodyValidation,
  updateTeamBodyValidation,
  updateRequestBodyValidation,
  removeMemberBodyValidation,
} = require("./validationSchema");
const { generateTeamToken } = require("./utils");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const { transporter } = require("../../utils/nodemailer");
// const AWS = require("aws-sdk");

exports.createTeam = catchAsync(async (req, res, next) => {
  //body validation
  const { error } = createTeamBodyValidation(req.body);
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

  if (user.registeredEvents[eventCodes.IMPETUS] === 0) {
    return next(
      new AppError(
        "User not registered for impetus",
        412,
        errorCodes.USER_NOT_REGISTERED_FOR_EVENT
      )
    );
  }

  //check whether teamname already taken
  const impetusTeam = await impetusTeams.findOne({
    teamName: req.body.teamName,
  });
  if (impetusTeam) {
    return next(
      new AppError("TeamName Already Exists", 412, errorCodes.TEAM_NAME_EXISTS)
    );
  }

  //if user is already in a impetusTeam
  if (user.impetusTeamId || user.impetusTeamRole) {
    return next(
      new AppError(
        "User Already Part of a impetusTeams",
        412,
        errorCodes.USER_ALREADY_IN_TEAM
      )
    );
  }

  const request = await impetusPendingApprovals.findOne({
    userId: req.user._id,
    status: requestStatusTypes.PENDING_APPROVAL,
  });

  const requestByLeader = await impetusTeamLeaderApprovalsModel.findOne({
    userId: req.user._id,
    status: requestStatusTypes.PENDING_APPROVAL,
  });

  //user shouldnt have pending requests
  if (request) {
    return next(
      new AppError(
        "Remove Requests Sent to other Teams to Create a NewTeam",
        412,
        errorCodes.USER_HAS_PENDING_REQUESTS
      )
    );
  }

  //user shouldnt have pending requests sent by other team leader
  if (requestByLeader) {
    return next(
      new AppError(
        "Remove Requests by other Leaders to Create a NewTeam",
        412,
        errorCodes.USER_HAS_PENDING_REQUESTS
      )
    );
  }

  const newTeam = await new impetusTeams({
    teamName: req.body.teamName,
    teamLeaderId: req.user._id,
    members: [req.user._id],
  }).save();

  await User.updateMany(
    { _id: req.user._id },
    { $set: { impetusTeamId: newTeam._id, impetusTeamRole: teamRole.LEADER } }
  );

  res.status(201).json({
    message: "New Impetus Team Created Successfully",
    teamId: newTeam._id,
  });
});

exports.getTeamDetails = catchAsync(async (req, res, next) => {
  const user = await User.findById({ _id: req.user._id });

  if (req.params.teamId.length !== objectIdLength) {
    return next(
      new AppError("Invalid TeamId", 412, errorCodes.INVALID_TEAM_ID)
    );
  }

  const impetusTeam = await impetusTeams
    .findById({ _id: req.params.teamId })
    .populate("members", {
      email: 1,
      firstName: 1,
      lastName: 1,
      mobileNumber: 1,
      impetusTeamRole: 1,
      eHackTeamRole: 1,
      innoventureTeamRole: 1,
    });

  //validate impetusTeam id
  if (!impetusTeam) {
    return next(
      new AppError("Invalid TeamId", 412, errorCodes.INVALID_TEAM_ID)
    );
  }

  //check if user is part of given impetusTeam
  // if (user.teamId == null || user.teamId.toString() !== req.params.teamId) {
  //   return next(
  //     new AppError(
  //       "User is not part of given teamID or user isn't part of any impetusTeam",
  //       412,
  //       errorCodes.INVALID_USERID_FOR_TEAMID
  //     )
  //   );
  // }

  res.status(200).json({
    message: "Getting impetus Team Details Successfull",
    impetusTeam,
  });
});

exports.updateTeam = catchAsync(async (req, res, next) => {
  //body validation
  const { error } = updateTeamBodyValidation(req.body);
  if (error) {
    return next(
      new AppError(
        error.details[0].message,
        400,
        errorCodes.INPUT_PARAMS_INVALID
      )
    );
  }

  if (req.params.teamId.length !== objectIdLength) {
    return next(
      new AppError("Invalid TeamId", 412, errorCodes.INVALID_TEAM_ID)
    );
  }

  const impetusTeam = await impetusTeams.findById({ _id: req.params.teamId });

  if (!impetusTeam) {
    return next(
      new AppError("Invalid TeamId", 412, errorCodes.INVALID_TEAM_ID)
    );
  }

  //validating teamid
  if (impetusTeam.noOfTimesTeamNameChanged === 3) {
    return next(
      new AppError(
        "Time Name Has Been Changed Already 3 Times(Limit Exceeded) ",
        412,
        errorCodes.UPDATE_TEAMNAME_LIMIT_EXCEEDED
      )
    );
  }

  //checking if impetusTeam name is already taken
  const teamWithNewTeamName = await impetusTeams.findOne({
    teamName: req.body.teamName,
  });

  if (
    teamWithNewTeamName &&
    teamWithNewTeamName.teamName === impetusTeam.teamName
  ) {
    return next(
      new AppError(
        "New TeamName Matched with Existing TeamName",
        412,
        errorCodes.SAME_EXISTING_TEAMNAME
      )
    );
  }
  if (teamWithNewTeamName) {
    return next(
      new AppError(
        "New TeamName Already Exists",
        412,
        errorCodes.TEAM_NAME_EXISTS
      )
    );
  }

  //check whether user belongs to the given impetusTeam and role
  if (impetusTeam.teamLeaderId.toString() !== req.user._id) {
    return next(
      new AppError(
        "User doesn't belong to the impetusTeams or User isn't a Leader",
        412,
        errorCodes.INVALID_USERID_FOR_TEAMID_OR_USER_NOT_LEADER
      )
    );
  }

  await impetusTeams.updateOne(
    { _id: req.params.teamId },
    {
      $set: {
        teamName: req.body.teamName,
      },
      $inc: { noOfTimesTeamNameChanged: 1 },
    }
  );

  res.status(201).json({
    message: "TeamName updated successfully",
    teamId: impetusTeam._id,
  });
});

exports.deleteTeam = catchAsync(async (req, res, next) => {
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
  //check whether user belongs to the given impetusTeam and role
  if (impetusTeam.teamLeaderId.toString() !== req.user._id) {
    return next(
      new AppError(
        "User doesn't belong to the impetusTeams or User isn't a Leader",
        412,
        errorCodes.INVALID_USERID_FOR_TEAMID_OR_USER_NOT_LEADER
      )
    );
  }

  //check impetusTeam size
  if (impetusTeam.members.length !== 1) {
    return next(
      new AppError(
        "Teamsize more than 1. Remove TeamMembers and Delete the impetusTeams",
        412,
        errorCodes.TEAMSIZE_MORE_THAN_ONE
      )
    );
  }

  if (impetusTeam.noOfPendingRequests > 0) {
    return next(
      new AppError(
        "The teams has sent pending requests to other members. Please delete those requests first",
        412,
        errorCodes.TEAM_LEADER_REQUESTS_PENDING_DELETE_TEAM
      )
    );
  }

  const userIds = await impetusPendingApprovals.find(
    {
      teamId: req.params.teamId,
      status: requestStatusTypes.PENDING_APPROVAL,
    },
    {
      userId: 1,
      _id: 0,
    }
  );

  // await impetusPendingApprovals.updateMany(
  //   {
  //     teamId: req.params.teamId,
  //     status: requestStatusTypes.PENDING_APPROVAL,
  //   },
  //   {
  //     $set: { status: requestStatusTypes.TEAM_DELETED },
  //   }
  // );

  await impetusPendingApprovals.deleteMany({
    teamId: req.params.teamId,
  });

  let userIdsArr = [];
  for (let i = 0; i < userIds.length; i++) {
    userIdsArr.push(JSON.stringify(userIds[i].userId).slice(1, -1));
  }

  await User.updateMany(
    {
      _id: {
        $in: userIdsArr,
      },
    },
    {
      $inc: { impetusPendingRequests: -1 },
    }
  );

  await impetusTeams.findOneAndDelete({
    _id: req.params.teamId,
  });

  await User.findByIdAndUpdate(
    { _id: req.user._id },
    { impetusTeamId: null, impetusTeamRole: null }
  );

  res.status(200).json({
    message: "impetus Team Deleted Successfully",
  });
});

exports.getTeamRequests = catchAsync(async (req, res, next) => {
  //validate impetusTeam id
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

  //check whether user belongs to the given impetusTeam and role
  if (impetusTeam.teamLeaderId.toString() !== req.user._id) {
    return next(
      new AppError(
        "User doesn't belong to the impetusTeams or User isn't a Leader",
        412,
        errorCodes.INVALID_USERID_FOR_TEAMID_OR_USER_NOT_LEADER
      )
    );
  }

  const requests = await impetusPendingApprovals
    .find({
      teamId: req.params.teamId,
      status: requestStatusTypes.PENDING_APPROVAL,
    })
    .populate("userId", {
      email: 1,
      firstName: 1,
      lastName: 1,
      mobileNumber: 1,
    });

  res.status(200).json({
    message: "Get impetusTeams Requests Successfull",
    requests,
  });
});

exports.updateRequest = catchAsync(async (req, res, next) => {
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

  //validate impetusTeam id
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

  //check whether user belongs to the given impetusTeam and role
  if (impetusTeam.teamLeaderId.toString() !== req.user._id) {
    return next(
      new AppError(
        "User doesn't belong to the impetusTeams or User isn't a Leader",
        412,
        errorCodes.INVALID_USERID_FOR_TEAMID_OR_USER_NOT_LEADER
      )
    );
  }

  //check whether userid (user whose status is to be updated) is valid
  const requestedUser = await User.findById({ _id: req.body.userId });
  if (!requestedUser) {
    return next(
      new AppError(
        "Invalid UserId of Requested User",
        412,
        errorCodes.INVALID_USERID
      )
    );
  }

  // if user (user whose status is to be updated) is already in a impetusTeam
  if (requestedUser.impetusTeamId) {
    return next(
      new AppError(
        "Requested User already part of a impetusTeams",
        412,
        errorCodes.USER_ALREADY_IN_TEAM
      )
    );
  }

  //searching for pending request
  const request = await impetusPendingApprovals.findOne({
    userId: req.body.userId,
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
    await impetusPendingApprovals.findOneAndDelete(
      {
        userId: req.body.userId,
        teamId: req.params.teamId,
        status: requestStatusTypes.PENDING_APPROVAL,
      }
      // { $set: { status: requestStatusTypes.REJECTED } }
    );

    await User.findOneAndUpdate(
      {
        _id: req.body.userId,
      },
      {
        $inc: { impetusPendingRequests: -1 },
      }
    );
  }

  if (req.body.status === approvalStatusTypes.APPROVED) {
    //checking impetusTeam size
    if (impetusTeam.members.length === 4) {
      return next(
        new AppError("impetus Team is Full", 412, errorCodes.TEAM_IS_FULL)
      );
    }
    //updating users teamid and role
    await User.findOneAndUpdate(
      {
        _id: req.body.userId,
      },
      {
        $set: {
          impetusTeamId: req.params.teamId,
          impetusTeamRole: teamRole.MEMBER,
          impetusPendingRequests: 0,
        },
      }
    );

    //updating pending approvals model of particular impetusTeam id to approved
    await impetusPendingApprovals.deleteMany(
      {
        userId: req.body.userId,
        // teamId: req.params.teamId,
        status: requestStatusTypes.PENDING_APPROVAL,
      }
      // { $set: { status: requestStatusTypes.APPROVED } }
    );

    await impetusTeamLeaderApprovalsModel.deleteMany(
      {
        userId: req.body.userId,
        // teamId: req.params.teamId,
        status: requestStatusTypes.PENDING_APPROVAL,
      }
      // { $set: { status: requestStatusTypes.APPROVED } }
    );
    //updating pending approvals model of all other impetusTeam ids to added to other impetusTeam
    // await impetusPendingApprovals.updateMany(
    //   {
    //     userId: req.body.userId,
    //     status: requestStatusTypes.PENDING_APPROVAL,
    //   },
    //   { $set: { status: requestStatusTypes.ADDED_TO_OTHER_TEAM } }
    // );

    //updating impetusTeam
    await impetusTeams.findOneAndUpdate(
      {
        _id: req.params.teamId,
      },
      {
        $push: { members: req.body.userId },
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
    }

    const user = await User.findById({ _id: req.body.userId });
    transporter.sendMail({
      from: process.env.NODEMAILER_EMAIL,
      to: user.email,
      subject: "ESUMMIT'23 ECELL-VIT. Request Approved By Impetus Team",
      html:
        user.firstName +
        " " +
        user.lastName +
        " " +
        "your request is approved by Impetus team " +
        impetusTeam.teamName +
        ".<br>" +
        "Click on the link to view the team details https://esummit.ecellvit.com <br>",
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

exports.removeMember = catchAsync(async (req, res, next) => {
  //body validation
  const { error } = removeMemberBodyValidation(req.body);
  if (error) {
    return next(
      new AppError(
        error.details[0].message,
        400,
        errorCodes.INPUT_PARAMS_INVALID
      )
    );
  }
  //checking for invalid impetusTeam id
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

  //checking whether user to remove id is valid
  const userToRemove = await User.findById({ _id: req.body.userId });
  if (!userToRemove) {
    return next(
      new AppError("Invalid UserId to Remove", 412, errorCodes.INVALID_USERID)
    );
  }

  //check whether user belongs to the given impetusTeam and role
  if (impetusTeam.teamLeaderId.toString() !== req.user._id) {
    return next(
      new AppError(
        "User doesn't belong to the impetusTeam or user isn't a leader",
        412,
        errorCodes.INVALID_USERID_FOR_TEAMID_OR_USER_NOT_LEADER
      )
    );
  }

  //checking whether user to remove belomgs to the impetusTeam id
  if (
    userToRemove.impetusTeamId == null ||
    userToRemove.impetusTeamId.toString() !== req.params.teamId
  ) {
    return next(
      new AppError(
        "User to remove and TeamId didnt Match",
        412,
        errorCodes.INVALID_USERID_FOR_TEAMID
      )
    );
  }

  //updating user teamid and teamrole
  await User.findOneAndUpdate(
    { _id: req.body.userId },
    { impetusTeamId: null, impetusTeamRole: null }
  );

  //updating impetusTeam
  await impetusTeams.findOneAndUpdate(
    { _id: req.params.teamId },
    { $pull: { members: req.body.userId } }
  );

  //updating impetusPendingApprovals
  // await impetusPendingApprovals.findOneAndUpdate(
  //   {
  //     userId: req.body.userId,
  //     teamId: req.params.teamId,
  //     $or: [
  //       { status: requestStatusTypes.APPROVED },
  //       { status: requestStatusTypes.JOINED_VIA_TOKEN },
  //     ],
  //   },
  //   {
  //     $set: { status: requestStatusTypes.REMOVED_FROM_TEAM },
  //   }
  // );

  transporter.sendMail({
    from: process.env.NODEMAILER_EMAIL,
    to: userToRemove.email,
    subject: "ESUMMIT'23 ECELL-VIT. Removed From Impetus Team",
    html:
      userToRemove.firstName +
      " " +
      userToRemove.lastName +
      " " +
      "You have been removed from the Impetus team " +
      impetusTeam.teamName +
      ".<br>" +
      "To Join or Create a new Team Click on the link https://esummit.ecellvit.com ",
    auth: {
      user: process.env.NODEMAILER_EMAIL,
      refreshToken: process.env.NODEMAILER_REFRESH_TOKEN,
      accessToken: process.env.NODEMAILER_ACCESS_TOKEN,
      expires: 3599,
    },
  });

  res.status(201).json({
    message: "User Removed Successfully",
  });
});

exports.getAllTeams = catchAsync(async (req, res, next) => {
  // const startTime = Date.now();
  // const teams = await impetusTeams.find().populate("members", {
  //   name: 1,
  //   teamRole: 1,
  //   email: 1,
  //   mobileNumber: 1,
  // });
  // const endTime = Date.now();
  // console.log("Time Taken = ", endTime - startTime);
  // console.log(teams);
  res.status(201).json({
    message: "Get All Teams Successfull",
    paginatedResult: res.paginatedResults,
  });
});

exports.getTeamToken = catchAsync(async (req, res, next) => {
  //validate impetusTeam id
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

  //check whether user belongs to the given impetusTeam and role
  if (impetusTeam.teamLeaderId.toString() !== req.user._id) {
    return next(
      new AppError(
        "User doesn't belong to the impetusTeams or User isn't a Leader",
        412,
        errorCodes.INVALID_USERID_FOR_TEAMID_OR_USER_NOT_LEADER
      )
    );
  }

  const { teamToken } = await generateTeamToken(impetusTeam);

  res.status(201).json({
    message: "impetusTeams Token Generated Succesfully",
    teamToken,
  });
});

exports.getAllMembers = catchAsync(async (req, res, next) => {
  const user = await User.findById({ _id: req.user._id });

  if (user.impetusTeamId === null || user.impetusTeamRole !== teamRole.LEADER) {
    return next(
      new AppError(
        "User not part of any team or user not a leader",
        412,
        errorCodes.INVALID_USERID_FOR_TEAMID_OR_USER_NOT_LEADER
      )
    );
  }

  const impetusMembers = await User.find({
    "registeredEvents.0": 1,
    impetusTeamId: null,
  });

  res.status(201).json({
    message: "Get All Members Successfull",
    impetusMembers,
  });
});

exports.getMemberRequests = catchAsync(async (req, res, next) => {
  const user = await User.findById({ _id: req.user._id });

  if (user.impetusTeamId === null || user.impetusTeamRole !== teamRole.LEADER) {
    return next(
      new AppError(
        "User not part of any team or user not a leader",
        412,
        errorCodes.INVALID_USERID_FOR_TEAMID_OR_USER_NOT_LEADER
      )
    );
  }

  const requests = await impetusTeamLeaderApprovalsModel
    .find({
      teamId: user.impetusTeamId,
      status: requestStatusTypes.PENDING_APPROVAL,
    })
    .populate({
      path: "userId",
      select: "email firstName lastName mobileNumber",
    });

  res.status(200).json({
    message: "Get Add Member Requests Successfull",
    requests,
  });
});

exports.addMemberRequest = catchAsync(async (req, res, next) => {
  const user = await User.findById({ _id: req.user._id });

  if (user.impetusTeamId === null || user.impetusTeamRole !== teamRole.LEADER) {
    return next(
      new AppError(
        "User not part of any team or user not a leader",
        412,
        errorCodes.INVALID_USERID_FOR_TEAMID_OR_USER_NOT_LEADER
      )
    );
  }

  const leaderTeam = await impetusTeams.findById({
    _id: user.impetusTeamId,
  });

  const toAddMember = await User.findById({
    _id: req.params.userId,
  });

  if (!toAddMember) {
    return next(
      new AppError("Invalid UserId", 412, errorCodes.INVALID_USER_ID)
    );
  }

  if (toAddMember.impetusTeamId) {
    return next(
      new AppError(
        "User already part of a Team",
        412,
        errorCodes.USER_ALREADY_IN_TEAM
      )
    );
  }

  if (leaderTeam.members.length === 4) {
    return next(
      new AppError(
        "Team is Full. Can't Add Member",
        412,
        errorCodes.TEAM_IS_FULL
      )
    );
  }

  const isReqSentAlready = await impetusPendingApprovals.findOne({
    userId: req.params.userId,
    teamId: leaderTeam._id,
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
  const request = await impetusTeamLeaderApprovalsModel.findOne({
    userId: req.params.userId,
    teamId: leaderTeam._id,
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

  if (leaderTeam.noOfPendingRequests >= 5) {
    return next(
      new AppError(
        "Can't send more than 5 requests",
        412,
        errorCodes.PENDING_REQUESTS_LIMIT_REACHED
      )
    );
  }

  const newRequest = await new impetusTeamLeaderApprovalsModel({
    teamId: leaderTeam._id,
    userId: req.params.userId,
    teamLeaderId: req.user._id,
    status: requestStatusTypes.PENDING_APPROVAL,
  }).save();

  await impetusTeams.findOneAndUpdate(
    {
      _id: leaderTeam._id,
    },
    {
      $inc: { noOfPendingRequests: 1 },
    }
  );

  transporter.sendMail({
    from: process.env.NODEMAILER_EMAIL,
    to: toAddMember.email,
    subject:
      "ESUMMIT'23-ECELL-VIT. Pending Approval From a Team Leader for Impetus Event",
    html:
      user.firstName +
      " " +
      user.lastName +
      " " +
      "has sent a request to join his/her Impetus team " +
      leaderTeam.teamName +
      ".<br>" +
      "To Approve or reject the request click on the link https://esummit.ecellvit.com <br>" +
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

exports.removeMemberRequest = catchAsync(async (req, res, next) => {
  const user = await User.findById({ _id: req.user._id });

  if (user.impetusTeamId === null || user.impetusTeamRole !== teamRole.LEADER) {
    return next(
      new AppError(
        "User not part of any team or user not a leader",
        412,
        errorCodes.INVALID_USERID_FOR_TEAMID_OR_USER_NOT_LEADER
      )
    );
  }

  const toAddMember = await User.findById({
    _id: req.params.userId,
  });

  if (!toAddMember) {
    return next(
      new AppError("Invalid UserId", 412, errorCodes.INVALID_USER_ID)
    );
  }

  //checking whether user is already a part of team
  if (toAddMember.impetusTeamId) {
    return next(
      new AppError(
        "User already part of a Team",
        412,
        errorCodes.USER_ALREADY_IN_TEAM
      )
    );
  }

  //checking whether pending request is found
  const request = await impetusTeamLeaderApprovalsModel.findOne({
    userId: req.params.userId,
    teamId: user.impetusTeamId,
    status: requestStatusTypes.PENDING_APPROVAL,
  });

  if (!request) {
    return next(
      new AppError(
        "No Add Member Request Found",
        412,
        errorCodes.NO_PENDING_REQUESTS
      )
    );
  }

  await impetusTeamLeaderApprovalsModel.findOneAndDelete(
    {
      userId: req.params.userId,
      teamId: user.impetusTeamId,
      status: requestStatusTypes.PENDING_APPROVAL,
    }
    // { $set: { status: requestStatusTypes.REQUEST_TAKEN_BACK } }
  );

  await impetusTeams.findOneAndUpdate(
    {
      _id: user.impetusTeamId,
    },
    {
      $inc: { noOfPendingRequests: -1 },
    }
  );

  res.status(201).json({
    message: "Removed Request Successfully",
  });
});
