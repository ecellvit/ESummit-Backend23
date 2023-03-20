const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const loginType = {
  GOOGLE_LOGIN: 0,
  BASIC_LOGIN: 1,
};

const teamRole = {
  LEADER: 0,
  MEMBER: 1,
  ADMIN: 2,
};

const requestStatusTypes = {
  PENDING_APPROVAL: 0,
  APPROVED: 1,
  REJECTED: 2,
  ADDED_TO_OTHER_TEAM: 3,
  REQUEST_TAKEN_BACK: 4,
  LEFT_TEAM: 5,
  REMOVED_FROM_TEAM: 6,
  JOINED_VIA_TOKEN: 7,
  TEAM_DELETED: 8,
};

const approvalStatusTypes = {
  REJECTED: 0,
  APPROVED: 1,
};

const errorCodes = {
  UNKNOWN_ERROR: 0,
  EXCEPTION: 1,
  INPUT_PARAMS_INVALID: 2,
  INVALID_TOKEN: 3,
  USER_NAME_EXIXTS: 4,
  INVALID_USERNAME_OR_PASSWORD: 5,
  INVALID_URL: 6,
  TEAM_NAME_EXISTS: 7,
  USER_ALREADY_IN_TEAM: 8, //user in other team
  USER_HAS_PENDING_REQUESTS: 9, //user shouldnot have pending requests to create team
  INVALID_TEAM_ID: 10,
  INVALID_USERID_FOR_TEAMID: 11, //userId not related to given team id
  USER_IS_LEADER: 12,
  INVALID_USERID_FOR_TEAMID_OR_USER_NOT_LEADER: 13, // //userId not related to given team id or user ia leader
  TEAMSIZE_MORE_THAN_ONE: 14,
  REQUEST_ALREADY_SENT: 15,
  NO_PENDING_REQUESTS: 16,
  INVALID_USERID: 17,
  TEAM_IS_FULL: 18,
  INVALID_TEAM_TOKEN: 19,
  MAX_QUESTIONS_REACHED: 20,
  TIME_LIMIT_REACHED: 21,
  NOT_ADMIN: 22,
  INVALID_QUESTION_ID: 23,
  NOT_STARTED_QUIZ: 24,
  PENDING_REQUESTS_LIMIT_REACHED: 25,
  SAME_EXISTING_TEAMNAME: 26,
  UPDATE_TEAMNAME_LIMIT_EXCEEDED: 27,
  INVALID_OPERATION: 28,
  TEAM_NOT_QUALIFIED: 29,
  ROUND_ONE_NOT_STARTED: 30, //round one not started
  ROUND_ONE_COMPLETED: 31, //round one completed
  ROUND_TWO_COMPLETED: 32,
  ROUND_THREE_COMPLETED: 33, //round three completed
  BALANCE_EXCEEDED: 34,
  ITEMS_LIMIT_REACHED: 35,
  PREVIOUS_ROUNDS_NOT_DONE: 36,
  ROUND_ONE_NOT_COMPLETED: 37, // round one not completed
  ROUND_THREE_NOT_STARTED: 38, //round three not started
  ROUND_TWO_NOT_STARTED: 39,
  ALREADY_REGISTERED: 40,
  NOT_REGISTERED: 41,
  PART_OF_TEAM_CANT_UNREGSITER: 42,
  PENDING_MEMBER_REQUEST: 43,
  INVALID_USER_ID: 44,
  TEAM_LEADER_REQUESTS_LIMIT_REACHED: 45,
  PENDING_REQUEST_OTHER_MODEL: 46,
  TEAM_LEADER_REQUESTS_PENDING_DELETE_TEAM: 47,
  USER_NOT_REGISTERED_FOR_EVENT: 48,
};

const eventCodes = {
  IMPETUS: 0,
  EHACK: 1,
  INNOVENTURE: 2,
  ETALK: 3,
  TRADING_WORKSHOP: 4,
};

const registerTypes = {
  NOT_REGISTERED: 0,
  REGISTERED: 1,
};

const objectIdLength = 24;

module.exports = {
  loginType,
  teamRole,
  requestStatusTypes,
  approvalStatusTypes,
  errorCodes,
  objectIdLength,
  eventCodes,
  registerTypes,
};
