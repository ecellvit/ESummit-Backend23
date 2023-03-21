const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const User = require("../../models/userModel");
const eHackTeams = require("../../models/eHackTeamModel");

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

  res.status(200).json({
    Number_Of_Users_LoggedIn: users.length,
    Number_Of_Users_Registered_For_Ehack: eHackRegisteredUsers.length,
    Number_Of_Users_Registered_For_Impetus: impetusRegisteredUsers.length,
    Number_Of_Users_Registered_For_Innoventure:
      innoventureRegisteredUsers.length,
    Number_Of_Users_Registered_For_ETalk: eTalkRegisteredUsers.length,
    Number_Of_Users_Registered_For_Trading_Workshop:
      tradingWorkshopRegisteredUsers.length,
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
    No_Of_Users_Registered_For_Tading_Workshop:
      tradingWorkshopRegisteredUsers.length,
    tradingWorkshopRegisteredUsers,
  });
});
