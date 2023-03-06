const User = require("../../models/userModel");
const eHackTeams = require("../../models/eHackTeamModel");
const eHackPendingApprovals = require("../../models/eHackPendingApprovalsModel");
const eHackTeamLeaderApprovalsModel = require("../../models/eHackTeamLeaderPendingApprovalsModel");
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
  fileUploadBodyValidation,
} = require("./validationSchema");
const { generateTeamToken } = require("./utils");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
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

  if (user.registeredEvents[eventCodes.EHACK] === 0) {
    return next(
      new AppError(
        "User not registered for eHack",
        412,
        errorCodes.USER_NOT_REGISTERED_FOR_EVENT
      )
    );
  }

  //check whether teamname already taken
  const eHackTeam = await eHackTeams.findOne({
    teamName: req.body.teamName,
  });
  if (eHackTeam) {
    return next(
      new AppError("TeamName Already Exists", 412, errorCodes.TEAM_NAME_EXISTS)
    );
  }

  //if user is already in a eHackTeam
  if (user.eHackTeamId || user.eHackTeamRole) {
    return next(
      new AppError(
        "User Already Part of a eHackTeams",
        412,
        errorCodes.USER_ALREADY_IN_TEAM
      )
    );
  }

  const request = await eHackPendingApprovals.findOne({
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

  const newTeam = await new eHackTeams({
    teamName: req.body.teamName,
    teamLeaderId: req.user._id,
    members: [req.user._id],
  }).save();

  await User.updateMany(
    { _id: req.user._id },
    { $set: { eHackTeamId: newTeam._id, eHackTeamRole: teamRole.LEADER } }
  );

  res.status(201).json({
    message: "New EHack Team Created Successfully",
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

  const eHackTeam = await eHackTeams
    .findById({ _id: req.params.teamId })
    .populate("members", {
      email: 1,
      firstName: 1,
      lastName: 1,
      mobileNumber: 1,
      eHackTeamRole: 1,
      eHackTeamRole: 1,
      innoventureTeamRole: 1,
    });

  //validate eHackTeam id
  if (!eHackTeam) {
    return next(
      new AppError("Invalid TeamId", 412, errorCodes.INVALID_TEAM_ID)
    );
  }

  //check if user is part of given eHackTeam
  // if (user.teamId == null || user.teamId.toString() !== req.params.teamId) {
  //   return next(
  //     new AppError(
  //       "User is not part of given teamID or user isn't part of any eHackTeam",
  //       412,
  //       errorCodes.INVALID_USERID_FOR_TEAMID
  //     )
  //   );
  // }

  res.status(200).json({
    message: "Getting EHack Team Details Successfull",
    eHackTeam,
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

  const eHackTeam = await eHackTeams.findById({ _id: req.params.teamId });

  if (!eHackTeam) {
    return next(
      new AppError("Invalid TeamId", 412, errorCodes.INVALID_TEAM_ID)
    );
  }

  //validating teamid
  if (eHackTeam.noOfTimesTeamNameChanged === 3) {
    return next(
      new AppError(
        "Time Name Has Been Changed Already 3 Times(Limit Exceeded) ",
        412,
        errorCodes.UPDATE_TEAMNAME_LIMIT_EXCEEDED
      )
    );
  }

  //checking if eHackTeam name is already taken
  const teamWithNewTeamName = await eHackTeams.findOne({
    teamName: req.body.teamName,
  });

  if (
    teamWithNewTeamName &&
    teamWithNewTeamName.teamName === eHackTeam.teamName
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

  //check whether user belongs to the given eHackTeam and role
  if (eHackTeam.teamLeaderId.toString() !== req.user._id) {
    return next(
      new AppError(
        "User doesn't belong to the eHackTeams or User isn't a Leader",
        412,
        errorCodes.INVALID_USERID_FOR_TEAMID_OR_USER_NOT_LEADER
      )
    );
  }

  await eHackTeams.updateOne(
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
    teamId: eHackTeam._id,
  });
});

exports.deleteTeam = catchAsync(async (req, res, next) => {
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
  //check whether user belongs to the given eHackTeam and role
  if (eHackTeam.teamLeaderId.toString() !== req.user._id) {
    return next(
      new AppError(
        "User doesn't belong to the eHackTeams or User isn't a Leader",
        412,
        errorCodes.INVALID_USERID_FOR_TEAMID_OR_USER_NOT_LEADER
      )
    );
  }

  //check eHackTeam size
  if (eHackTeam.members.length !== 1) {
    return next(
      new AppError(
        "Teamsize more than 1. Remove TeamMembers and Delete the eHackTeams",
        412,
        errorCodes.TEAMSIZE_MORE_THAN_ONE
      )
    );
  }

  if (eHackTeam.noOfPendingRequests > 0) {
    return next(
      new AppError(
        "The teams has sent pending requests to other members. Please delete those requests first",
        412,
        errorCodes.TEAM_LEADER_REQUESTS_PENDING_DELETE_TEAM
      )
    );
  }

  const userIds = await eHackPendingApprovals.find(
    {
      teamId: req.params.teamId,
      status: requestStatusTypes.PENDING_APPROVAL,
    },
    {
      userId: 1,
      _id: 0,
    }
  );

  // await eHackPendingApprovals.updateMany(
  //   {
  //     teamId: req.params.teamId,
  //     status: requestStatusTypes.PENDING_APPROVAL,
  //   },
  //   {
  //     $set: { status: requestStatusTypes.TEAM_DELETED },
  //   }
  // );

  await eHackPendingApprovals.deleteMany({
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
      $inc: { eHackPendingRequests: -1 },
    }
  );

  await eHackTeams.findOneAndDelete({
    _id: req.params.teamId,
  });

  await User.findByIdAndUpdate(
    { _id: req.user._id },
    { eHackTeamId: null, eHackTeamRole: null }
  );

  res.status(200).json({
    message: "E Hack Team Deleted Successfully",
  });
});

exports.getTeamRequests = catchAsync(async (req, res, next) => {
  //validate eHackTeam id
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

  //check whether user belongs to the given eHackTeam and role
  if (eHackTeam.teamLeaderId.toString() !== req.user._id) {
    return next(
      new AppError(
        "User doesn't belong to the eHackTeams or User isn't a Leader",
        412,
        errorCodes.INVALID_USERID_FOR_TEAMID_OR_USER_NOT_LEADER
      )
    );
  }

  const requests = await eHackPendingApprovals
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
    message: "Get eHackTeams Requests Successfull",
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

  //validate eHackTeam id
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

  //check whether user belongs to the given eHackTeam and role
  if (eHackTeam.teamLeaderId.toString() !== req.user._id) {
    return next(
      new AppError(
        "User doesn't belong to the eHackTeams or User isn't a Leader",
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

  // if user (user whose status is to be updated) is already in a eHackTeam
  if (requestedUser.eHackTeamId) {
    return next(
      new AppError(
        "Requested User already part of a eHackTeams",
        412,
        errorCodes.USER_ALREADY_IN_TEAM
      )
    );
  }

  //searching for pending request
  const request = await eHackPendingApprovals.findOne({
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
    await eHackPendingApprovals.findOneAndDelete(
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
        $inc: { eHackPendingRequests: -1 },
      }
    );
  }

  if (req.body.status === approvalStatusTypes.APPROVED) {
    //checking eHackTeam size
    if (eHackTeam.members.length === 4) {
      return next(
        new AppError("E Hack Team is Full", 412, errorCodes.TEAM_IS_FULL)
      );
    }
    //updating users teamid and role
    await User.findOneAndUpdate(
      {
        _id: req.body.userId,
      },
      {
        $set: {
          eHackTeamId: req.params.teamId,
          eHackTeamRole: teamRole.MEMBER,
          eHackPendingRequests: 0,
        },
      }
    );

    //updating pending approvals model of particular eHackTeam id to approved
    await eHackPendingApprovals.deleteMany(
      {
        userId: req.body.userId,
        // teamId: req.params.teamId,
        status: requestStatusTypes.PENDING_APPROVAL,
      }
      // { $set: { status: requestStatusTypes.APPROVED } }
    );

    await eHackTeamLeaderApprovalsModel.deleteMany(
      {
        userId: req.body.userId,
        // teamId: req.params.teamId,
        status: requestStatusTypes.PENDING_APPROVAL,
      }
      // { $set: { status: requestStatusTypes.APPROVED } }
    );

    //updating pending approvals model of all other eHackTeam ids to added to other eHackTeam
    // await eHackPendingApprovals.updateMany(
    //   {
    //     userId: req.body.userId,
    //     status: requestStatusTypes.PENDING_APPROVAL,
    //   },
    //   { $set: { status: requestStatusTypes.ADDED_TO_OTHER_TEAM } }
    // );

    //updating eHackTeam
    await eHackTeams.findOneAndUpdate(
      {
        _id: req.params.teamId,
      },
      {
        $push: { members: req.body.userId },
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
          $set: {},
        }
      );
    }
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
  //checking for invalid eHackTeam id
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

  //checking whether user to remove id is valid
  const userToRemove = await User.findById({ _id: req.body.userId });
  if (!userToRemove) {
    return next(
      new AppError("Invalid UserId to Remove", 412, errorCodes.INVALID_USERID)
    );
  }

  //check whether user belongs to the given eHackTeam and role
  if (eHackTeam.teamLeaderId.toString() !== req.user._id) {
    return next(
      new AppError(
        "User doesn't belong to the eHackTeam or user isn't a leader",
        412,
        errorCodes.INVALID_USERID_FOR_TEAMID_OR_USER_NOT_LEADER
      )
    );
  }

  //checking whether user to remove belomgs to the eHackTeam id
  if (
    userToRemove.eHackTeamId == null ||
    userToRemove.eHackTeamId.toString() !== req.params.teamId
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
    { eHackTeamId: null, eHackTeamRole: null }
  );

  //updating eHackTeam
  await eHackTeams.findOneAndUpdate(
    { _id: req.params.teamId },
    { $pull: { members: req.body.userId } }
  );

  //updating eHackPendingApprovals
  // await eHackPendingApprovals.findOneAndUpdate(
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

  res.status(201).json({
    message: "User Removed Successfully",
  });
});

exports.getAllTeams = catchAsync(async (req, res, next) => {
  // const startTime = Date.now();
  // const teams = await eHackTeams.find().populate("members", {
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
  //validate eHackTeam id
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

  //check whether user belongs to the given eHackTeam and role
  if (eHackTeam.teamLeaderId.toString() !== req.user._id) {
    return next(
      new AppError(
        "User doesn't belong to the eHackTeams or User isn't a Leader",
        412,
        errorCodes.INVALID_USERID_FOR_TEAMID_OR_USER_NOT_LEADER
      )
    );
  }

  const { teamToken } = await generateTeamToken(eHackTeam);

  res.status(201).json({
    message: "eHackTeams Token Generated Succesfully",
    teamToken,
  });
});

exports.getAllMembers = catchAsync(async (req, res, next) => {
  const user = await User.findById({ _id: req.user._id });

  if (user.eHackTeamId === null || user.eHackTeamRole !== teamRole.LEADER) {
    return next(
      new AppError(
        "User not part of any team or user not a leader",
        412,
        errorCodes.INVALID_USERID_FOR_TEAMID_OR_USER_NOT_LEADER
      )
    );
  }

  const eHackMembers = await User.find({
    eHackTeamId: null,
  });

  res.status(201).json({
    message: "Get All Members Successfull",
    eHackMembers,
  });
});

exports.getMemberRequests = catchAsync(async (req, res, next) => {
  const user = await User.findById({ _id: req.user._id });

  if (user.eHackTeamId === null || user.eHackTeamRole !== teamRole.LEADER) {
    return next(
      new AppError(
        "User not part of any team or user not a leader",
        412,
        errorCodes.INVALID_USERID_FOR_TEAMID_OR_USER_NOT_LEADER
      )
    );
  }

  const requests = await eHackTeamLeaderApprovalsModel
    .find({
      teamId: user.eHackTeamId,
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

  if (user.eHackTeamId === null || user.eHackTeamRole !== teamRole.LEADER) {
    return next(
      new AppError(
        "User not part of any team or user not a leader",
        412,
        errorCodes.INVALID_USERID_FOR_TEAMID_OR_USER_NOT_LEADER
      )
    );
  }

  const leaderTeam = await eHackTeams.findById({
    _id: user.eHackTeamId,
  });

  const toAddMember = await User.findById({
    _id: req.params.userId,
  });

  if (!toAddMember) {
    return next(
      new AppError("Invalid UserId", 412, errorCodes.INVALID_USER_ID)
    );
  }

  if (toAddMember.eHackTeamId) {
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

  const isReqSentAlready = await eHackPendingApprovals.findOne({
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
  const request = await eHackTeamLeaderApprovalsModel.findOne({
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

  const newRequest = await new eHackTeamLeaderApprovalsModel({
    teamId: leaderTeam._id,
    userId: req.params.userId,
    teamLeaderId: req.user._id,
    status: requestStatusTypes.PENDING_APPROVAL,
  }).save();

  await eHackTeams.findByIdAndUpdate(
    {
      _id: leaderTeam._id,
    },
    {
      $inc: { noOfPendingRequests: 1 },
    }
  );

  res.status(201).json({
    message: "Sent request successfully",
    requestId: newRequest._id,
  });
});

exports.removeMemberRequest = catchAsync(async (req, res, next) => {
  const user = await User.findById({ _id: req.user._id });

  if (user.eHackTeamId === null || user.eHackTeamRole !== teamRole.LEADER) {
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
  if (toAddMember.eHackTeamId) {
    return next(
      new AppError(
        "User already part of a Team",
        412,
        errorCodes.USER_ALREADY_IN_TEAM
      )
    );
  }

  //checking whether pending request is found
  const request = await eHackTeamLeaderApprovalsModel.findOne({
    userId: req.params.userId,
    teamId: user.eHackTeamId,
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

  await eHackTeamLeaderApprovalsModel.findOneAndDelete(
    {
      userId: req.params.userId,
      teamId: user.eHackTeamId,
      status: requestStatusTypes.PENDING_APPROVAL,
    }
    // { $set: { status: requestStatusTypes.REQUEST_TAKEN_BACK } }
  );

  await eHackTeams.findByIdAndUpdate(
    {
      _id: user.eHackTeamId,
    },
    {
      $inc: { noOfPendingRequests: -1 },
    }
  );

  res.status(201).json({
    message: "Removed Request Successfully",
  });
});

exports.eHackUploadFile = catchAsync(async (req, res, next) => {
  const { error } = fileUploadBodyValidation(req.body);
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

  if (user.eHackTeamId === null || user.eHackTeamRole !== teamRole.LEADER) {
    return next(
      new AppError(
        "User not part of any team or user not a leader",
        412,
        errorCodes.INVALID_USERID_FOR_TEAMID_OR_USER_NOT_LEADER
      )
    );
  }

  await eHackTeams.findByIdAndUpdate(
    {
      _id: user.eHackTeamId,
    },
    {
      file: req.body.file,
    }
  );

  res.status(201).json({
    message: "Uploaded file successfully",
  });
});

exports.eHackGetFile = catchAsync(async (req, res, next) => {
  const user = await User.findById({ _id: req.user._id });

  if (user.eHackTeamId === null || user.eHackTeamRole !== teamRole.LEADER) {
    return next(
      new AppError(
        "User not part of any team or user not a leader",
        412,
        errorCodes.INVALID_USERID_FOR_TEAMID_OR_USER_NOT_LEADER
      )
    );
  }

  const team = await eHackTeams.findById({
    _id: user.eHackTeamId,
  });

  res.status(201).json({
    message: "File fetched successfully",
    file: team.file,
  });
});
