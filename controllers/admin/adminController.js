const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const User = require("../../models/userModel");
const eHackTeamModel = require("../../models/eHackTeamModel");
const impetusTeamModel = require("../../models/impetusTeamModel");
const innoventureTeamModel = require("../../models/innoventureTeamModel");
const { registerTypes } = require("../../utils/constants");
const innoventurePendingApprovals = require("../../models/innoventurePendingApprovalsModel");
const innoventureTeamLeaderApprovalsModel = require("../../models/innoventureTeamLeaderPendingApprovalsModel");
const impetusPendingApprovals = require("../../models/impetusPendingAprrovalsModel");
const impetusTeamLeaderApprovalsModel = require("../../models/impetusTeamLeaderPendingApprovalsModel");
const eHackPendingApprovals = require("../../models/eHackPendingApprovalsModel");
const eHackTeamLeaderApprovalsModel = require("../../models/eHackTeamLeaderPendingApprovalsModel");

exports.getAllCounts = catchAsync(async (req, res, next) => {
  const users = await User.find();

  const eHackRegisteredUsers = [];
  for (let i = 0; i < users.length; i++) {
    if (users[i].registeredEvents && users[i].registeredEvents[1] === 1) {
      eHackRegisteredUsers.push(users[i]);
    }
  }

  const impetusRegisteredUsers = [];
  for (let i = 0; i < users.length; i++) {
    if (users[i].registeredEvents && users[i].registeredEvents[0] === 1) {
      impetusRegisteredUsers.push(users[i]);
    }
  }

  const innoventureRegisteredUsers = [];
  for (let i = 0; i < users.length; i++) {
    if (users[i].registeredEvents && users[i].registeredEvents[2] === 1) {
      innoventureRegisteredUsers.push(users[i]);
    }
  }

  const eTalkRegisteredUsers = [];
  for (let i = 0; i < users.length; i++) {
    if (users[i].registeredEvents && users[i].registeredEvents[3] === 1) {
      eTalkRegisteredUsers.push(users[i]);
    }
  }

  const tradingWorkshopRegisteredUsers = [];
  for (let i = 0; i < users.length; i++) {
    if (users[i].registeredEvents && users[i].registeredEvents[4] === 1) {
      tradingWorkshopRegisteredUsers.push(users[i]);
    }
  }

  const eHackTeams = await eHackTeamModel
    .find(
      {},
      {
        _id: 0,
        noOfTimesTeamNameChanged: 0,
        noOfPendingRequests: 0,
        __v: 0,
        teamLeaderId: 0,
      }
    )
    .populate("members", {
      email: 1,
      firstName: 1,
      lastName: 1,
      mobileNumber: 1,
      regNo: 1,
      _id: 0,
    });

  const impetusTeams = await impetusTeamModel
    .find(
      {},
      {
        _id: 0,
        noOfTimesTeamNameChanged: 0,
        noOfPendingRequests: 0,
        __v: 0,
        teamLeaderId: 0,
      }
    )
    .populate("members", {
      email: 1,
      firstName: 1,
      lastName: 1,
      mobileNumber: 1,
      regNo: 1,
      _id: 0,
    });

  const innoventureTeams = await innoventureTeamModel
    .find(
      {},
      {
        _id: 0,
        noOfTimesTeamNameChanged: 0,
        noOfPendingRequests: 0,
        __v: 0,
        teamLeaderId: 0,
      }
    )
    .populate("members", {
      email: 1,
      firstName: 1,
      lastName: 1,
      mobileNumber: 1,
      regNo: 1,
      _id: 0,
    });

  const ehackTeamsWith1Member = [];
  const ehackTeamsWith2Members = [];
  const ehackTeamsWith3Members = [];
  const ehackTeamsWith4Members = [];

  for (let i = 0; i < eHackTeams.length; i++) {
    if (eHackTeams[i].members.length === 1) {
      ehackTeamsWith1Member.push(eHackTeams[i]);
    } else if (eHackTeams[i].members.length === 2) {
      ehackTeamsWith2Members.push(eHackTeams[i]);
    } else if (eHackTeams[i].members.length === 3) {
      ehackTeamsWith3Members.push(eHackTeams[i]);
    } else if (eHackTeams[i].members.length === 4) {
      ehackTeamsWith4Members.push(eHackTeams[i]);
    }
  }

  const impetusTeamsWith1Member = [];
  const impetusTeamsWith2Members = [];
  const impetusTeamsWith3Members = [];
  const impetusTeamsWith4Members = [];

  for (let i = 0; i < impetusTeams.length; i++) {
    if (impetusTeams[i].members.length === 1) {
      impetusTeamsWith1Member.push(impetusTeams[i]);
    } else if (impetusTeams[i].members.length === 2) {
      impetusTeamsWith2Members.push(impetusTeams[i]);
    } else if (impetusTeams[i].members.length === 3) {
      impetusTeamsWith3Members.push(impetusTeams[i]);
    } else if (impetusTeams[i].members.length === 4) {
      impetusTeamsWith4Members.push(impetusTeams[i]);
    }
  }

  const innoventureTeamsWith1Member = [];
  const innoventureTeamsWith2Members = [];
  const innoventureTeamsWith3Members = [];
  const innoventureTeamsWith4Members = [];

  for (let i = 0; i < innoventureTeams.length; i++) {
    if (innoventureTeams[i].members.length === 1) {
      innoventureTeamsWith1Member.push(innoventureTeams[i]);
    } else if (innoventureTeams[i].members.length === 2) {
      innoventureTeamsWith2Members.push(innoventureTeams[i]);
    } else if (innoventureTeams[i].members.length === 3) {
      innoventureTeamsWith3Members.push(innoventureTeams[i]);
    } else if (innoventureTeams[i].members.length === 4) {
      innoventureTeamsWith4Members.push(innoventureTeams[i]);
    }
  }

  const noOfEHackUsersPartOfATeam =
    ehackTeamsWith1Member.length * 1 +
    ehackTeamsWith2Members.length * 2 +
    ehackTeamsWith3Members.length * 3 +
    ehackTeamsWith4Members.length * 4;
  const noOfImpetusUsersPartOfATeam =
    impetusTeamsWith1Member.length * 1 +
    impetusTeamsWith2Members.length * 2 +
    impetusTeamsWith3Members.length * 3 +
    impetusTeamsWith4Members.length * 4;
  const noOfInnoventureUsersPartOfATeam =
    innoventureTeamsWith1Member.length * 1 +
    innoventureTeamsWith2Members.length * 2 +
    innoventureTeamsWith3Members.length * 3 +
    innoventureTeamsWith4Members.length * 4;

  const noOfEHackUsersNotPartOfATeam =
    eHackRegisteredUsers.length - noOfEHackUsersPartOfATeam;
  const noOfImpetusUsersNotPartOfATeam =
    impetusRegisteredUsers.length - noOfImpetusUsersPartOfATeam;
  const noOfInnoventureUsersNotPartOfATeam =
    innoventureRegisteredUsers.length - noOfInnoventureUsersPartOfATeam;

  res.status(200).json({
    message: "Data Fetched Successfully",
    Number_Of_Users_LoggedIn: users.length,
    Number_Of_Users_Registered_For_ETalk: eTalkRegisteredUsers.length,
    Number_Of_Users_Registered_For_Trading_Workshop:
      tradingWorkshopRegisteredUsers.length,
    Number_Of_Users_Registered_For_Ehack: eHackRegisteredUsers.length,
    No_of_EHack_Teams: eHackTeams.length,
    No_of_EHack_Registrants_who_are_part_of_a_Team: noOfEHackUsersPartOfATeam,
    No_of_EHack_Registrants_who_are_not_part_of_a_Team:
      noOfEHackUsersNotPartOfATeam,
    No_of_EHack_Teams_With_1_Member: ehackTeamsWith1Member.length,
    No_of_EHack_Teams_With_2_Members: ehackTeamsWith2Members.length,
    No_of_EHack_Teams_With_3_Members: ehackTeamsWith3Members.length,
    No_of_EHack_Teams_With_4_Members: ehackTeamsWith4Members.length,
    Number_Of_Users_Registered_For_Impetus: impetusRegisteredUsers.length,
    No_of_Impetus_Teams: impetusTeams.length,
    No_of_Impetus_Registrants_who_are_part_of_a_Team:
      noOfImpetusUsersPartOfATeam,
    No_of_Impetus_Registrants_who_are_not_part_of_a_Team:
      noOfImpetusUsersNotPartOfATeam,
    No_of_Impetus_Teams_With_1_Member: impetusTeamsWith1Member.length,
    No_of_Impetus_Teams_With_2_Members: impetusTeamsWith2Members.length,
    No_of_Impetus_Teams_With_3_Members: impetusTeamsWith3Members.length,
    No_of_Impetus_Teams_With_4_Members: impetusTeamsWith4Members.length,
    Number_Of_Users_Registered_For_Innoventure:
      innoventureRegisteredUsers.length,
    No_of_Innoventure_Teams: innoventureTeams.length,
    No_Of_Innoventure_Registrants_who_are_part_of_a_Team:
      noOfInnoventureUsersPartOfATeam,
    No_Of_Innoventure_Registrants_who_are_not_part_of_a_Team:
      noOfInnoventureUsersNotPartOfATeam,
    No_of_Innoventure_Teams_With_1_Member: innoventureTeamsWith1Member.length,
    No_of_Innoventure_Teams_With_2_Members: innoventureTeamsWith2Members.length,
    No_of_Innoventure_Teams_With_3_Members: innoventureTeamsWith3Members.length,
    No_of_Innoventure_Teams_With_4_Members: innoventureTeamsWith4Members.length,
  });
});

exports.getLoggedInUsers = catchAsync(async (req, res, next) => {
  const users = await User.find(
    {},
    {
      _id: 0,
      loginType: 0,
      hasFilledDetails: 0,
      registeredEvents: 0,
      eHackPendingRequests: 0,
      impetusPendingRequests: 0,
      innoventurePendingRequests: 0,
      eHackTeamId: 0,
      impetusTeamId: 0,
      innoventureTeamId: 0,
      eHackTeamRole: 0,
      impetusTeamRole: 0,
      innoventureTeamRole: 0,
      date: 0,
      __v: 0,
    }
  );

  res.status(200).json({
    message: "Data Fetched Successfully",
    Number_Of_Users_LoggedIn: users.length,
    users,
  });
});

exports.getEhackUsers = catchAsync(async (req, res, next) => {
  const eHackRegisteredUsers = await User.find(
    {
      "registeredEvents.1": registerTypes.REGISTERED,
    },
    {
      _id: 0,
      loginType: 0,
      hasFilledDetails: 0,
      eHackPendingRequests: 0,
      impetusPendingRequests: 0,
      innoventurePendingRequests: 0,
      eHackTeamId: 0,
      impetusTeamId: 0,
      innoventureTeamId: 0,
      eHackTeamRole: 0,
      impetusTeamRole: 0,
      innoventureTeamRole: 0,
      registeredEvents: 0,
      date: 0,
      __v: 0,
    }
  );

  res.status(200).json({
    message: "Data Fetched Successfully",
    No_Of_Users_Registered_For_EHack: eHackRegisteredUsers.length,
    eHackRegisteredUsers,
  });
});

exports.getImpetusUsers = catchAsync(async (req, res, next) => {
  const impetusRegisteredUsers = await User.find(
    {
      "registeredEvents.0": registerTypes.REGISTERED,
    },
    {
      _id: 0,
      loginType: 0,
      hasFilledDetails: 0,
      eHackPendingRequests: 0,
      impetusPendingRequests: 0,
      innoventurePendingRequests: 0,
      eHackTeamId: 0,
      impetusTeamId: 0,
      innoventureTeamId: 0,
      eHackTeamRole: 0,
      impetusTeamRole: 0,
      innoventureTeamRole: 0,
      registeredEvents: 0,
      date: 0,
      __v: 0,
    }
  );

  res.status(200).json({
    message: "Data Fetched Successfully",
    No_Of_Users_Registered_For_Impetus: impetusRegisteredUsers.length,
    impetusRegisteredUsers,
  });
});

exports.getInnoventureUsers = catchAsync(async (req, res, next) => {
  const innoventureRegisteredUsers = await User.find(
    {
      "registeredEvents.2": registerTypes.REGISTERED,
    },
    {
      _id: 0,
      loginType: 0,
      hasFilledDetails: 0,
      eHackPendingRequests: 0,
      impetusPendingRequests: 0,
      innoventurePendingRequests: 0,
      eHackTeamId: 0,
      impetusTeamId: 0,
      innoventureTeamId: 0,
      eHackTeamRole: 0,
      impetusTeamRole: 0,
      innoventureTeamRole: 0,
      registeredEvents: 0,
      date: 0,
      __v: 0,
    }
  );

  res.status(200).json({
    message: "Data Fetched Successfully",
    No_Of_Users_Registered_For_Innoventure: innoventureRegisteredUsers.length,
    innoventureRegisteredUsers,
  });
});

exports.getEtalkUsers = catchAsync(async (req, res, next) => {
  const eTalkRegisteredUsers = await User.find(
    {
      "registeredEvents.3": registerTypes.REGISTERED,
    },
    {
      _id: 0,
      loginType: 0,
      hasFilledDetails: 0,
      eHackPendingRequests: 0,
      impetusPendingRequests: 0,
      innoventurePendingRequests: 0,
      eHackTeamId: 0,
      impetusTeamId: 0,
      innoventureTeamId: 0,
      eHackTeamRole: 0,
      impetusTeamRole: 0,
      innoventureTeamRole: 0,
      registeredEvents: 0,
      date: 0,
      __v: 0,
    }
  );

  res.status(200).json({
    message: "Data Fetched Successfully",
    No_Of_Users_Registered_For_ETalk: eTalkRegisteredUsers.length,
    eTalkRegisteredUsers,
  });
});

exports.getTradingWorkshopUsers = catchAsync(async (req, res, next) => {
  const tradingWorkshopRegisteredUsers = await User.find(
    {
      "registeredEvents.4": registerTypes.REGISTERED,
    },
    {
      _id: 0,
      loginType: 0,
      hasFilledDetails: 0,
      eHackPendingRequests: 0,
      impetusPendingRequests: 0,
      innoventurePendingRequests: 0,
      eHackTeamId: 0,
      impetusTeamId: 0,
      innoventureTeamId: 0,
      eHackTeamRole: 0,
      impetusTeamRole: 0,
      innoventureTeamRole: 0,
      registeredEvents: 0,
      date: 0,
      __v: 0,
    }
  );

  res.status(200).json({
    message: "Data Fetched Successfully",
    No_Of_Users_Registered_For_Tading_Workshop:
      tradingWorkshopRegisteredUsers.length,
    tradingWorkshopRegisteredUsers,
  });
});

exports.getEhackDetails = catchAsync(async (req, res, next) => {
  const sz = req.query.size;
  if (sz === undefined) {
    const eHackTeams = await eHackTeamModel
      .find(
        {},
        {
          _id: 0,
          noOfTimesTeamNameChanged: 0,
          noOfPendingRequests: 0,
          __v: 0,
          teamLeaderId: 0,
        }
      )
      .populate("members", {
        email: 1,
        firstName: 1,
        lastName: 1,
        mobileNumber: 1,
        regNo: 1,
        _id: 0,
      });

    return res.status(200).json({
      message: "Data Fetched Successfully",
      No_of_EHack_Teams: eHackTeams.length,
      eHackTeams,
    });
  }

  if (sz === "0") {
    const eHackUsersWithNoTeam = await User.find(
      {
        eHackTeamId: null,
        "registeredEvents.1": registerTypes.REGISTERED,
      },
      {
        _id: 0,
        email: 1,
        firstName: 1,
        lastName: 1,
        mobileNumber: 1,
        regNo: 1,
      }
    );
    return res.status(200).json({
      message: "Data Fetched Successfully",
      No_Of_Ehack_Users_No_Team: eHackUsersWithNoTeam.length,
      eHackUsersWithNoTeam,
    });
  }

  const eHackTeams = await eHackTeamModel
    .find(
      {
        members: { $size: sz },
      },
      {
        _id: 0,
        noOfTimesTeamNameChanged: 0,
        noOfPendingRequests: 0,
        __v: 0,
        teamLeaderId: 0,
      }
    )
    .populate("members", {
      email: 1,
      firstName: 1,
      lastName: 1,
      mobileNumber: 1,
      regNo: 1,
      _id: 0,
    });

  return res.status(200).json({
    message: "Data Fetched Successfully",
    No_Of_Ehack_Teams: eHackTeams.length,
    eHackTeams,
  });
});

exports.getImpetusDetails = catchAsync(async (req, res, next) => {
  const sz = req.query.size;

  if (sz === undefined) {
    const impetusTeams = await impetusTeamModel
      .find(
        {},
        {
          _id: 0,
          noOfTimesTeamNameChanged: 0,
          noOfPendingRequests: 0,
          __v: 0,
          teamLeaderId: 0,
        }
      )
      .populate("members", {
        email: 1,
        firstName: 1,
        lastName: 1,
        mobileNumber: 1,
        regNo: 1,
        _id: 0,
      });

    return res.status(200).json({
      message: "Data Fetched Successfully",
      No_of_Impetus_Teams: impetusTeams.length,
      impetusTeams,
    });
  }

  if (sz === "0") {
    const impetusUsersWithNoTeam = await User.find(
      {
        impetusTeamId: null,
        "registeredEvents.0": 1,
      },
      {
        _id: 0,
        email: 1,
        firstName: 1,
        lastName: 1,
        mobileNumber: 1,
        regNo: 1,
      }
    );
    return res.status(200).json({
      message: "Data Fetched Successfully",
      No_Of_Impetus_Users_No_Team: impetusUsersWithNoTeam.length,
      impetusUsersWithNoTeam,
    });
  }

  const impetusTeams = await impetusTeamModel
    .find(
      {
        members: { $size: sz },
      },
      {
        _id: 0,
        noOfTimesTeamNameChanged: 0,
        noOfPendingRequests: 0,
        __v: 0,
        teamLeaderId: 0,
      }
    )
    .populate("members", {
      email: 1,
      firstName: 1,
      lastName: 1,
      mobileNumber: 1,
      regNo: 1,
      _id: 0,
    });

  return res.status(200).json({
    message: "Data Fetched Successfully",
    No_of_Impetus_Teams: impetusTeams.length,
    impetusTeams,
  });
});

exports.getInnoventureDetails = catchAsync(async (req, res, next) => {
  const sz = req.query.size;

  if (sz === undefined) {
    const innoventureTeams = await innoventureTeamModel
      .find(
        {},
        {
          _id: 0,
          noOfTimesTeamNameChanged: 0,
          noOfPendingRequests: 0,
          __v: 0,
          teamLeaderId: 0,
        }
      )
      .populate("members", {
        email: 1,
        firstName: 1,
        lastName: 1,
        mobileNumber: 1,
        regNo: 1,
        _id: 0,
      });

    return res.status(200).json({
      message: "Data Fetched Successfully",
      No_of_Innoventure_Teams: innoventureTeams.length,
      innoventureTeams,
    });
  }

  if (sz === "0") {
    const innoventureUsersWithNoTeam = await User.find(
      {
        innoventureTeamId: null,
        "registeredEvents.2": 1,
      },
      {
        _id: 0,
        email: 1,
        firstName: 1,
        lastName: 1,
        mobileNumber: 1,
        regNo: 1,
      }
    );
    return res.status(200).json({
      message: "Data Fetched Successfully",
      No_Of_Innoventure_Users_No_Team: innoventureUsersWithNoTeam.length,
      innoventureUsersWithNoTeam,
    });
  }

  const innoventureTeams = await innoventureTeamModel
    .find(
      {
        members: { $size: sz },
      },
      {
        _id: 0,
        noOfTimesTeamNameChanged: 0,
        noOfPendingRequests: 0,
        __v: 0,
        teamLeaderId: 0,
      }
    )
    .populate("members", {
      email: 1,
      firstName: 1,
      lastName: 1,
      mobileNumber: 1,
      regNo: 1,
      _id: 0,
    });

  return res.status(200).json({
    message: "Data Fetched Successfully",
    No_of_Innoventure_Teams: innoventureTeams.length,
    innoventureTeams,
  });
});

exports.innoventureMerge2With1 = catchAsync(async (req, res, next) => {
  const teamWith2Members = await innoventureTeamModel.findOne({
    members: { $size: 2 },
  });
  const teamWith1Member = await innoventureTeamModel.findOne({
    members: { $size: 1 },
  });

  if (!teamWith1Member || !teamWith2Members) {
    return res.status(200).json({
      message: "Nothing To Merge",
    });
  }

  console.log("TeamWithTwoMembers", teamWith2Members);

  // deleting requests sent by team
  await innoventureTeamLeaderApprovalsModel.deleteMany({
    teamId: teamWith2Members._id,
  });

  //setting no of pending requests to 0
  await innoventureTeamModel.findOneAndUpdate(
    {
      _id: teamWith2Members._id,
    },
    {
      $set: {
        noOfPendingRequests: 0,
      },
    }
  );

  const requestsSentToTeamWith2Members = await innoventurePendingApprovals.find(
    {
      teamId: teamWith2Members._id,
    }
  );

  console.log("RequestsSentToTeamWith2Members", requestsSentToTeamWith2Members);

  for (let i = 0; i < requestsSentToTeamWith2Members.length; i++) {
    const idOfUserWhoSentRequest = requestsSentToTeamWith2Members[i].userId;
    console.log(idOfUserWhoSentRequest);

    //removing req sent by user
    await innoventurePendingApprovals.deleteOne({
      userId: idOfUserWhoSentRequest,
      teamId: teamWith2Members._id,
    });

    //decreasing his count by 1
    await User.findOneAndUpdate(
      {
        _id: idOfUserWhoSentRequest,
      },
      {
        $inc: { innoventurePendingRequests: -1 },
      }
    );
  }

  //doing similar for team With One Member

  console.log("Team With 1 Member", teamWith1Member);
  // deleting requests sent by team
  await innoventureTeamLeaderApprovalsModel.deleteMany({
    teamId: teamWith1Member._id,
  });

  //setting no of pending requests to 0
  await innoventureTeamModel.findOneAndUpdate(
    {
      _id: teamWith1Member._id,
    },
    {
      $set: {
        noOfPendingRequests: 0,
      },
    }
  );

  const requestsSentToTeamWith1Member = await innoventurePendingApprovals.find({
    teamId: teamWith1Member._id,
  });

  console.log("RequestsSentToTeamWith1Member", requestsSentToTeamWith1Member);
  for (let i = 0; i < requestsSentToTeamWith1Member.length; i++) {
    const idOfUserWhoSentRequest = requestsSentToTeamWith1Member[i].userId;
    console.log(idOfUserWhoSentRequest);

    //removing req sent by user
    await innoventurePendingApprovals.deleteOne({
      userId: idOfUserWhoSentRequest,
      teamId: teamWith1Member._id,
    });

    //decreasing his count by 1
    await User.findOneAndUpdate(
      {
        _id: idOfUserWhoSentRequest,
      },
      {
        $inc: { innoventurePendingRequests: -1 },
      }
    );
  }

  //merge logic

  //changing user teamId to new TeamId
  await User.findByIdAndUpdate(
    {
      _id: teamWith1Member.teamLeaderId,
    },
    {
      $set: {
        innoventureTeamId: teamWith2Members._id,
        innoventureTeamRole: 1,
      },
    }
  );

  //pushing user to new team
  await innoventureTeamModel.findOneAndUpdate(
    {
      _id: teamWith2Members._id,
    },
    {
      $push: {
        members: teamWith1Member.teamLeaderId,
      },
    }
  );

  //delete team with one member
  await innoventureTeamModel.deleteOne({
    _id: teamWith1Member._id,
  });

  return res.status(200).json({
    message: "Merge Succesfull",
    teamWith2Members,
    teamWith1Member,
    requestsSentToTeamWith2Members,
  });
});

exports.innoventureMerge4Ones = catchAsync(async (req, res, next) => {
  const teamsOfSize1 = await innoventureTeamModel.find({
    members: { $size: 1 },
  });

  if (teamsOfSize1.length < 4) {
    return res.status(200).json({
      message: "Nothing to merge",
    });
  }

  for (let i = 0; i < 4; i++) {
    console.log("Team", teamsOfSize1[i]);

    // deleting requests sent by team
    await innoventureTeamLeaderApprovalsModel.deleteMany({
      teamId: teamsOfSize1[i]._id,
    });

    //setting no of pending requests to 0
    await innoventureTeamModel.findOneAndUpdate(
      {
        _id: teamsOfSize1[i]._id,
      },
      {
        $set: {
          noOfPendingRequests: 0,
        },
      }
    );

    const requestsSentToTeam = await innoventurePendingApprovals.find({
      teamId: teamsOfSize1[i]._id,
    });

    console.log("RequestsSentToTeam", requestsSentToTeam);

    for (let j = 0; j < requestsSentToTeam.length; j++) {
      const idOfUserWhoSentRequest = requestsSentToTeam[j].userId;
      console.log("Id: ", idOfUserWhoSentRequest);

      //removing req sent by user
      await innoventurePendingApprovals.deleteOne({
        userId: idOfUserWhoSentRequest,
        teamId: teamsOfSize1[i]._id,
      });

      //decreasing his count by 1
      await User.findOneAndUpdate(
        {
          _id: idOfUserWhoSentRequest,
        },
        {
          $inc: { innoventurePendingRequests: -1 },
        }
      );
    }
  }

  //mergeLogic

  //changing user teamId to new TeamId

  for (let i = 1; i < 4; i++) {
    await User.findByIdAndUpdate(
      {
        _id: teamsOfSize1[i].teamLeaderId,
      },
      {
        $set: {
          innoventureTeamId: teamsOfSize1[0]._id,
          innoventureTeamRole: 1,
        },
      }
    );

    //pushing user to new team
    await innoventureTeamModel.findOneAndUpdate(
      {
        _id: teamsOfSize1[0]._id,
      },
      {
        $push: {
          members: teamsOfSize1[i].teamLeaderId,
        },
      }
    );

    //delete team with one member
    await innoventureTeamModel.deleteOne({
      _id: teamsOfSize1[i]._id,
    });
  }

  return res.status(200).json({
    message: "Merge Successfull",
    team1: teamsOfSize1[0],
    team2: teamsOfSize1[1],
    team3: teamsOfSize1[2],
    team4: teamsOfSize1[3],
  });
});

exports.impetusMerge2With1 = catchAsync(async (req, res, next) => {
  const teamWith2Members = await impetusTeamModel.findOne({
    members: { $size: 2 },
  });
  const teamWith1Member = await impetusTeamModel.findOne({
    members: { $size: 1 },
  });

  if (!teamWith1Member || !teamWith2Members) {
    return res.status(200).json({
      message: "Nothing To Merge",
    });
  }

  console.log("TeamWithTwoMembers", teamWith2Members);

  // deleting requests sent by team
  await impetusTeamLeaderApprovalsModel.deleteMany({
    teamId: teamWith2Members._id,
  });

  //setting no of pending requests to 0
  await impetusTeamModel.findOneAndUpdate(
    {
      _id: teamWith2Members._id,
    },
    {
      $set: {
        noOfPendingRequests: 0,
      },
    }
  );

  const requestsSentToTeamWith2Members = await impetusPendingApprovals.find({
    teamId: teamWith2Members._id,
  });

  console.log("RequestsSentToTeamWith2Members", requestsSentToTeamWith2Members);

  for (let i = 0; i < requestsSentToTeamWith2Members.length; i++) {
    const idOfUserWhoSentRequest = requestsSentToTeamWith2Members[i].userId;
    console.log(idOfUserWhoSentRequest);

    //removing req sent by user
    await impetusPendingApprovals.deleteOne({
      userId: idOfUserWhoSentRequest,
      teamId: teamWith2Members._id,
    });

    //decreasing his count by 1
    await User.findOneAndUpdate(
      {
        _id: idOfUserWhoSentRequest,
      },
      {
        $inc: { impetusPendingRequests: -1 },
      }
    );
  }

  //doing similar for team With One Member

  console.log("Team With 1 Member", teamWith1Member);
  // deleting requests sent by team
  await impetusTeamLeaderApprovalsModel.deleteMany({
    teamId: teamWith1Member._id,
  });

  //setting no of pending requests to 0
  await impetusTeamModel.findOneAndUpdate(
    {
      _id: teamWith1Member._id,
    },
    {
      $set: {
        noOfPendingRequests: 0,
      },
    }
  );

  const requestsSentToTeamWith1Member = await impetusPendingApprovals.find({
    teamId: teamWith1Member._id,
  });

  console.log("RequestsSentToTeamWith1Member", requestsSentToTeamWith1Member);
  for (let i = 0; i < requestsSentToTeamWith1Member.length; i++) {
    const idOfUserWhoSentRequest = requestsSentToTeamWith1Member[i].userId;
    console.log(idOfUserWhoSentRequest);

    //removing req sent by user
    await impetusPendingApprovals.deleteOne({
      userId: idOfUserWhoSentRequest,
      teamId: teamWith1Member._id,
    });

    //decreasing his count by 1
    await User.findOneAndUpdate(
      {
        _id: idOfUserWhoSentRequest,
      },
      {
        $inc: { impetusPendingRequests: -1 },
      }
    );
  }

  //merge logic

  //changing user teamId to new TeamId
  await User.findByIdAndUpdate(
    {
      _id: teamWith1Member.teamLeaderId,
    },
    {
      $set: {
        impetusTeamId: teamWith2Members._id,
        impetusTeamRole: 1,
      },
    }
  );

  //pushing user to new team
  await impetusTeamModel.findOneAndUpdate(
    {
      _id: teamWith2Members._id,
    },
    {
      $push: {
        members: teamWith1Member.teamLeaderId,
      },
    }
  );

  //delete team with one member
  await impetusTeamModel.deleteOne({
    _id: teamWith1Member._id,
  });

  return res.status(200).json({
    message: "Merge Succesfull",
    teamWith2Members,
    teamWith1Member,
    requestsSentToTeamWith2Members,
  });
});

exports.impetusMerge4Ones = catchAsync(async (req, res, next) => {
  const teamsOfSize1 = await impetusTeamModel.find({
    members: { $size: 1 },
  });

  if (teamsOfSize1.length < 4) {
    return res.status(200).json({
      message: "Nothing to merge",
    });
  }

  for (let i = 0; i < 4; i++) {
    console.log("Team", teamsOfSize1[i]);

    // deleting requests sent by team
    await impetusTeamLeaderApprovalsModel.deleteMany({
      teamId: teamsOfSize1[i]._id,
    });

    //setting no of pending requests to 0
    await impetusTeamModel.findOneAndUpdate(
      {
        _id: teamsOfSize1[i]._id,
      },
      {
        $set: {
          noOfPendingRequests: 0,
        },
      }
    );

    const requestsSentToTeam = await impetusPendingApprovals.find({
      teamId: teamsOfSize1[i]._id,
    });

    console.log("RequestsSentToTeam", requestsSentToTeam);

    for (let j = 0; j < requestsSentToTeam.length; j++) {
      const idOfUserWhoSentRequest = requestsSentToTeam[j].userId;
      console.log("Id: ", idOfUserWhoSentRequest);

      //removing req sent by user
      await impetusPendingApprovals.deleteOne({
        userId: idOfUserWhoSentRequest,
        teamId: teamsOfSize1[i]._id,
      });

      //decreasing his count by 1
      await User.findOneAndUpdate(
        {
          _id: idOfUserWhoSentRequest,
        },
        {
          $inc: { impetusPendingRequests: -1 },
        }
      );
    }
  }

  //mergeLogic

  //changing user teamId to new TeamId

  for (let i = 1; i < 4; i++) {
    await User.findByIdAndUpdate(
      {
        _id: teamsOfSize1[i].teamLeaderId,
      },
      {
        $set: {
          impetusTeamId: teamsOfSize1[0]._id,
          impetusTeamRole: 1,
        },
      }
    );

    //pushing user to new team
    await impetusTeamModel.findOneAndUpdate(
      {
        _id: teamsOfSize1[0]._id,
      },
      {
        $push: {
          members: teamsOfSize1[i].teamLeaderId,
        },
      }
    );

    //delete team with one member
    await impetusTeamModel.deleteOne({
      _id: teamsOfSize1[i]._id,
    });
  }

  return res.status(200).json({
    message: "Merge Successfull",
    team1: teamsOfSize1[0],
    team2: teamsOfSize1[1],
    team3: teamsOfSize1[2],
    team4: teamsOfSize1[3],
  });
});

exports.eHackMerge2With1 = catchAsync(async (req, res, next) => {
  const teamWith2Members = await eHackTeamModel.findOne({
    members: { $size: 2 },
  });
  const teamWith1Member = await eHackTeamModel.findOne({
    members: { $size: 1 },
  });

  if (!teamWith1Member || !teamWith2Members) {
    return res.status(200).json({
      message: "Nothing To Merge",
    });
  }

  console.log("TeamWithTwoMembers", teamWith2Members);

  // deleting requests sent by team
  await eHackTeamLeaderApprovalsModel.deleteMany({
    teamId: teamWith2Members._id,
  });

  //setting no of pending requests to 0
  await eHackTeamModel.findOneAndUpdate(
    {
      _id: teamWith2Members._id,
    },
    {
      $set: {
        noOfPendingRequests: 0,
      },
    }
  );

  const requestsSentToTeamWith2Members = await eHackPendingApprovals.find(
    {
      teamId: teamWith2Members._id,
    }
  );

  console.log("RequestsSentToTeamWith2Members", requestsSentToTeamWith2Members);

  for (let i = 0; i < requestsSentToTeamWith2Members.length; i++) {
    const idOfUserWhoSentRequest = requestsSentToTeamWith2Members[i].userId;
    console.log(idOfUserWhoSentRequest);

    //removing req sent by user
    await eHackPendingApprovals.deleteOne({
      userId: idOfUserWhoSentRequest,
      teamId: teamWith2Members._id,
    });

    //decreasing his count by 1
    await User.findOneAndUpdate(
      {
        _id: idOfUserWhoSentRequest,
      },
      {
        $inc: { eHackPendingRequests: -1 },
      }
    );
  }

  //doing similar for team With One Member

  console.log("Team With 1 Member", teamWith1Member);
  // deleting requests sent by team
  await eHackTeamLeaderApprovalsModel.deleteMany({
    teamId: teamWith1Member._id,
  });

  //setting no of pending requests to 0
  await eHackTeamModel.findOneAndUpdate(
    {
      _id: teamWith1Member._id,
    },
    {
      $set: {
        noOfPendingRequests: 0,
      },
    }
  );

  const requestsSentToTeamWith1Member = await eHackPendingApprovals.find({
    teamId: teamWith1Member._id,
  });

  console.log("RequestsSentToTeamWith1Member", requestsSentToTeamWith1Member);
  for (let i = 0; i < requestsSentToTeamWith1Member.length; i++) {
    const idOfUserWhoSentRequest = requestsSentToTeamWith1Member[i].userId;
    console.log(idOfUserWhoSentRequest);

    //removing req sent by user
    await eHackPendingApprovals.deleteOne({
      userId: idOfUserWhoSentRequest,
      teamId: teamWith1Member._id,
    });

    //decreasing his count by 1
    await User.findOneAndUpdate(
      {
        _id: idOfUserWhoSentRequest,
      },
      {
        $inc: { eHackPendingRequests: -1 },
      }
    );
  }

  //merge logic

  //changing user teamId to new TeamId
  await User.findByIdAndUpdate(
    {
      _id: teamWith1Member.teamLeaderId,
    },
    {
      $set: {
        eHackTeamId: teamWith2Members._id,
        eHackTeamRole: 1,
      },
    }
  );

  //pushing user to new team
  await eHackTeamModel.findOneAndUpdate(
    {
      _id: teamWith2Members._id,
    },
    {
      $push: {
        members: teamWith1Member.teamLeaderId,
      },
    }
  );

  //delete team with one member
  await eHackTeamModel.deleteOne({
    _id: teamWith1Member._id,
  });

  return res.status(200).json({
    message: "Merge Succesfull",
    teamWith2Members,
    teamWith1Member,
    requestsSentToTeamWith2Members,
  });
});

exports.eHackMerge4Ones = catchAsync(async (req, res, next) => {
  const teamsOfSize1 = await eHackTeamModel.find({
    members: { $size: 1 },
  });

  if (teamsOfSize1.length < 4) {
    return res.status(200).json({
      message: "Nothing to merge",
    });
  }

  for (let i = 0; i < 4; i++) {
    console.log("Team", teamsOfSize1[i]);

    // deleting requests sent by team
    await eHackTeamLeaderApprovalsModel.deleteMany({
      teamId: teamsOfSize1[i]._id,
    });

    //setting no of pending requests to 0
    await eHackTeamModel.findOneAndUpdate(
      {
        _id: teamsOfSize1[i]._id,
      },
      {
        $set: {
          noOfPendingRequests: 0,
        },
      }
    );

    const requestsSentToTeam = await eHackPendingApprovals.find({
      teamId: teamsOfSize1[i]._id,
    });

    console.log("RequestsSentToTeam", requestsSentToTeam);

    for (let j = 0; j < requestsSentToTeam.length; j++) {
      const idOfUserWhoSentRequest = requestsSentToTeam[j].userId;
      console.log("Id: ", idOfUserWhoSentRequest);

      //removing req sent by user
      await eHackPendingApprovals.deleteOne({
        userId: idOfUserWhoSentRequest,
        teamId: teamsOfSize1[i]._id,
      });

      //decreasing his count by 1
      await User.findOneAndUpdate(
        {
          _id: idOfUserWhoSentRequest,
        },
        {
          $inc: { eHackPendingRequests: -1 },
        }
      );
    }
  }

  //mergeLogic

  //changing user teamId to new TeamId

  for (let i = 1; i < 4; i++) {
    await User.findByIdAndUpdate(
      {
        _id: teamsOfSize1[i].teamLeaderId,
      },
      {
        $set: {
          eHackTeamId: teamsOfSize1[0]._id,
          eHackTeamRole: 1,
        },
      }
    );

    //pushing user to new team
    await eHackTeamModel.findOneAndUpdate(
      {
        _id: teamsOfSize1[0]._id,
      },
      {
        $push: {
          members: teamsOfSize1[i].teamLeaderId,
        },
      }
    );

    //delete team with one member
    await eHackTeamModel.deleteOne({
      _id: teamsOfSize1[i]._id,
    });
  }

  return res.status(200).json({
    message: "Merge Successfull",
    team1: teamsOfSize1[0],
    team2: teamsOfSize1[1],
    team3: teamsOfSize1[2],
    team4: teamsOfSize1[3],
  });
});
