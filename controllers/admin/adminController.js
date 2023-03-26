const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const User = require("../../models/userModel");
const eHackTeamModel = require("../../models/eHackTeamModel");
const impetusTeamModel = require("../../models/impetusTeamModel");
const innoventureTeamModel = require("../../models/innoventureTeamModel");
const { registerTypes } = require("../../utils/constants");

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
      No_Of_Ehack_Users_No_Team: impetusUsersWithNoTeam.length,
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
