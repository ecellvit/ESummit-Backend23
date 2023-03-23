const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const User = require("../../models/userModel");
const eHackTeamModel = require("../../models/eHackTeamModel");
const impetusTeamModel = require("../../models/impetusTeamModel");
const innoventureTeamModel = require("../../models/innoventureTeamModel");

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
      _id: 0,
    });

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
      _id: 0,
    });

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

  res.status(200).json({
    message: "Data Fetched Successfully",
    Number_Of_Users_LoggedIn: users.length,
    Number_Of_Users_Registered_For_Ehack: eHackRegisteredUsers.length,
    Number_Of_Users_Registered_For_Impetus: impetusRegisteredUsers.length,
    Number_Of_Users_Registered_For_Innoventure:
      innoventureRegisteredUsers.length,
    Number_Of_Users_Registered_For_ETalk: eTalkRegisteredUsers.length,
    Number_Of_Users_Registered_For_Trading_Workshop:
      tradingWorkshopRegisteredUsers.length,
    No_of_EHack_Teams: eHackTeams.length,
    No_of_EHack_Registrants_who_are_part_of_a_Team:
      ehackTeamsWith1Member.length * 1 +
      ehackTeamsWith2Members.length * 2 +
      ehackTeamsWith3Members.length * 3 +
      ehackTeamsWith4Members.length * 4,
    No_of_EHack_Teams_With_1_Member: ehackTeamsWith1Member.length,
    No_of_EHack_Teams_With_2_Members: ehackTeamsWith2Members.length,
    No_of_EHack_Teams_With_3_Members: ehackTeamsWith3Members.length,
    No_of_EHack_Teams_With_4_Members: ehackTeamsWith4Members.length,
    No_of_Impetus_Teams: impetusTeams.length,
    No_of_Impetus_Registrants_who_are_part_of_a_Team:
      impetusTeamsWith1Member.length * 1 +
      impetusTeamsWith2Members.length * 2 +
      impetusTeamsWith3Members.length * 3 +
      impetusTeamsWith4Members.length * 4,
    No_of_Impetus_Teams_With_1_Member: impetusTeamsWith1Member.length,
    No_of_Impetus_Teams_With_2_Members: impetusTeamsWith2Members.length,
    No_of_Impetus_Teams_With_3_Members: impetusTeamsWith3Members.length,
    No_of_Impetus_Teams_With_4_Members: impetusTeamsWith4Members.length,
    No_of_Innoventure_Teams: innoventureTeams.length,
    No_Of_Innoventure_Registrants_who_are_part_of_a_Team:
      innoventureTeamsWith1Member.length * 1 +
      innoventureTeamsWith2Members.length * 2 +
      innoventureTeamsWith3Members.length * 3 +
      innoventureTeamsWith4Members.length * 4,
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
  const users = await User.find(
    {},
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
      date: 0,
      __v: 0,
    }
  );
  const eHackRegisteredUsers = [];
  for (let i = 0; i < users.length; i++) {
    if (users[i].registeredEvents && users[i].registeredEvents[1] === 1) {
      eHackRegisteredUsers.push(users[i]);
    }
  }

  res.status(200).json({
    message: "Data Fetched Successfully",
    No_Of_Users_Registered_For_EHack: eHackRegisteredUsers.length,
    eHackRegisteredUsers,
  });
});

exports.getImpetusUsers = catchAsync(async (req, res, next) => {
  const users = await User.find(
    {},
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
      date: 0,
      __v: 0,
    }
  );
  const impetusRegisteredUsers = [];
  for (let i = 0; i < users.length; i++) {
    if (users[i].registeredEvents && users[i].registeredEvents[0] === 1) {
      impetusRegisteredUsers.push(users[i]);
    }
  }

  res.status(200).json({
    message: "Data Fetched Successfully",
    No_Of_Users_Registered_For_Impetus: impetusRegisteredUsers.length,
    impetusRegisteredUsers,
  });
});

exports.getInnoventureUsers = catchAsync(async (req, res, next) => {
  const users = await User.find(
    {},
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
      date: 0,
      __v: 0,
    }
  );

  const innoventureRegisteredUsers = [];
  for (let i = 0; i < users.length; i++) {
    if (users[i].registeredEvents && users[i].registeredEvents[2] === 1) {
      innoventureRegisteredUsers.push(users[i]);
    }
  }

  res.status(200).json({
    message: "Data Fetched Successfully",
    No_Of_Users_Registered_For_Innoventure: innoventureRegisteredUsers.length,
    innoventureRegisteredUsers,
  });
});

exports.getEtalkUsers = catchAsync(async (req, res, next) => {
  const users = await User.find(
    {},
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
      date: 0,
      __v: 0,
    }
  );

  const eTalkRegisteredUsers = [];
  for (let i = 0; i < users.length; i++) {
    if (users[i].registeredEvents && users[i].registeredEvents[3] === 1) {
      eTalkRegisteredUsers.push(users[i]);
    }
  }

  res.status(200).json({
    message: "Data Fetched Successfully",
    No_Of_Users_Registered_For_ETalk: eTalkRegisteredUsers.length,
    eTalkRegisteredUsers,
  });
});

exports.getTradingWorkshopUsers = catchAsync(async (req, res, next) => {
  const users = await User.find(
    {},
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
      date: 0,
      __v: 0,
    }
  );

  const tradingWorkshopRegisteredUsers = [];
  for (let i = 0; i < users.length; i++) {
    if (users[i].registeredEvents && users[i].registeredEvents[4] === 1) {
      tradingWorkshopRegisteredUsers.push(users[i]);
    }
  }

  res.status(200).json({
    message: "Data Fetched Successfully",
    No_Of_Users_Registered_For_Tading_Workshop:
      tradingWorkshopRegisteredUsers.length,
    tradingWorkshopRegisteredUsers,
  });
});

exports.getEhackDetails = catchAsync(async (req, res, next) => {
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
      _id: 0,
    });

  // const ehackTeamsWith1Member = [];
  // const ehackTeamsWith2Members = [];
  // const ehackTeamsWith3Members = [];
  // const ehackTeamsWith4Members = [];

  // for (let i = 0; i < eHackTeams.length; i++) {
  //   if (eHackTeams[i].members.length === 1) {
  //     ehackTeamsWith1Member.push(eHackTeams[i]);
  //   } else if (eHackTeams[i].members.length === 2) {
  //     ehackTeamsWith2Members.push(eHackTeams[i]);
  //   } else if (eHackTeams[i].members.length === 3) {
  //     ehackTeamsWith3Members.push(eHackTeams[i]);
  //   } else if (eHackTeams[i].members.length === 4) {
  //     ehackTeamsWith4Members.push(eHackTeams[i]);
  //   }
  // }

  return res.status(200).json({
    message: "Data Fetched Successfully",
    No_of_EHack_Teams: eHackTeams.length,
    eHackTeams,
    // No_of_EHack_Teams_With_1_Member: ehackTeamsWith1Member.length,
    // No_of_EHack_Teams_With_2_Members: ehackTeamsWith2Members.length,
    // No_of_EHack_Teams_With_3_Members: ehackTeamsWith3Members.length,
    // No_of_EHack_Teams_With_4_Members: ehackTeamsWith4Members.length,
    // E_Hack_Teams_With_1_Member: ehackTeamsWith1Member,
    // E_Hack_Teams_With_2_Members: ehackTeamsWith2Members,
    // E_Hack_Teams_With_3_Members: ehackTeamsWith3Members,
    // E_Hack_Teams_With_4_Members: ehackTeamsWith4Members,
  });
});

exports.getImpetusDetails = catchAsync(async (req, res, next) => {
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
      _id: 0,
    });

  // const impetusTeamsWith1Member = [];
  // const impetusTeamsWith2Members = [];
  // const impetusTeamsWith3Members = [];
  // const impetusTeamsWith4Members = [];

  // for (let i = 0; i < impetusTeams.length; i++) {
  //   if (impetusTeams[i].members.length === 1) {
  //     impetusTeamsWith1Member.push(impetusTeams[i]);
  //   } else if (impetusTeams[i].members.length === 2) {
  //     impetusTeamsWith2Members.push(impetusTeams[i]);
  //   } else if (impetusTeams[i].members.length === 3) {
  //     impetusTeamsWith3Members.push(impetusTeams[i]);
  //   } else if (impetusTeams[i].members.length === 4) {
  //     impetusTeamsWith4Members.push(impetusTeams[i]);
  //   }
  // }

  return res.status(200).json({
    message: "Data Fetched Successfully",
    No_of_Impetus_Teams: impetusTeams.length,
    impetusTeams,
    // No_of_Impetus_Teams_With_1_Member: impetusTeamsWith1Member.length,
    // No_of_Impetus_Teams_With_2_Members: impetusTeamsWith2Members.length,
    // No_of_Impetus_Teams_With_3_Members: impetusTeamsWith3Members.length,
    // No_of_Impetus_Teams_With_4_Members: impetusTeamsWith4Members.length,
    // Impetus_Teams_With_1_Member: impetusTeamsWith1Member,
    // Impetus_Teams_With_2_Members: impetusTeamsWith2Members,
    // Impetus_Teams_With_3_Members: impetusTeamsWith3Members,
    // Impetus_Teams_With_4_Members: impetusTeamsWith4Members,
  });
});

exports.getInnoventureDetails = catchAsync(async (req, res, next) => {
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
      _id: 0,
    });

  // const innoventureTeamsWith1Member = [];
  // const innoventureTeamsWith2Members = [];
  // const innoventureTeamsWith3Members = [];
  // const innoventureTeamsWith4Members = [];

  // for (let i = 0; i < innoventureTeams.length; i++) {
  //   if (innoventureTeams[i].members.length === 1) {
  //     innoventureTeamsWith1Member.push(innoventureTeams[i]);
  //   } else if (innoventureTeams[i].members.length === 2) {
  //     innoventureTeamsWith2Members.push(innoventureTeams[i]);
  //   } else if (innoventureTeams[i].members.length === 3) {
  //     innoventureTeamsWith3Members.push(innoventureTeams[i]);
  //   } else if (innoventureTeams[i].members.length === 4) {
  //     innoventureTeamsWith4Members.push(innoventureTeams[i]);
  //   }
  // }

  return res.status(200).json({
    message: "Data Fetched Successfully",
    No_of_Innoventure_Teams: innoventureTeams.length,
    innoventureTeams,
    // No_of_Innoventure_Teams_With_1_Member: innoventureTeamsWith1Member.length,
    // No_of_Innoventure_Teams_With_2_Members: innoventureTeamsWith2Members.length,
    // No_of_Innoventure_Teams_With_3_Members: innoventureTeamsWith3Members.length,
    // No_of_Innoventure_Teams_With_4_Members: innoventureTeamsWith4Members.length,
    // Innoventure_Teams_With_1_Member: innoventureTeamsWith1Member,
    // Innoventure_Teams_With_2_Members: innoventureTeamsWith2Members,
    // Innoventure_Teams_With_3_Members: innoventureTeamsWith3Members,
    // Innoventure_Teams_With_4_Members: innoventureTeamsWith4Members,
  });
});

// exports.myFunction = catchAsync(async (req, res, next) => {
//   await User.updateMany({}, { $set: { hasFilledDetails: false } });
//   return res.status(200).json({
//     status: "success",
//   });
// });
