const { OAuth2Client } = require("google-auth-library");
const User = require("../../models/userModel");
const AppError = require("../../utils/appError");
const catchAsync = require("../../utils/catchAsync");
const { errorCodes, loginType } = require("../../utils/constants");
const { generateTokens } = require("./utils");
const {
  googleAuthBodyValidation,
  signUpBodyValidation,
  logInBodyValidation,
} = require("./validationSchema");

const client = new OAuth2Client(process.env.CLIENT_ID);
const bcrypt = require("bcrypt");

exports.googleAuth = catchAsync(async (req, res, next) => {
  const { error } = googleAuthBodyValidation(req.body);
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

  if (!user) {
    await new User({
      loginType: loginType.GOOGLE_LOGIN,
      email: emailFromClient,
      hasFilledDetails: false,
      firstName: null,
      lastName: null,
      mobileNumber: null,
      registeredEvents: [0, 0, 0, 0, 0, 0],
      eHackPendingRequests: 0,
      impetusPendingRequests: 0,
      innoventurePendingRequests: 0,
      eHackTeamId: null,
      impetusTeamId: null,
      innoventureTeamId: null,
      eHackTeamRole: null,
      impetusTeamRole: null,
      innoventureTeamRole: null,
    }).save();

    const user = await User.findOne({ email: emailFromClient });
    const { accessToken } = await generateTokens(user);

    return res.status(201).json({
      message: "User SignUp Succesfull",
      accessToken,
    });
  }

  const { accessToken } = await generateTokens(user);
  res.status(200).json({
    message: "Logged in sucessfully",
    accessToken,
  });
});

exports.basicAuthSignUp = catchAsync(async (req, res, next) => {
  const { error } = signUpBodyValidation(req.body);
  if (error) {
    return next(
      new AppError(
        error.details[0].message,
        400,
        errorCodes.INPUT_PARAMS_INVALID
      )
    );
  }

  // checking username
  const user = await User.findOne({ username: req.body.username });
  if (user) {
    return next(
      new AppError("Username already exists", 412, errorCodes.USER_NAME_EXIXTS)
    );
  }

  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(req.body.password, salt);

  await new User({
    loginType: loginType.BASIC_LOGIN,
    username: req.body.username,
    password: hashPassword,
    email: req.body.email,
    hasFilledDetails: false,
    firstName: null,
    lastName: null,
    mobileNumber: null,
    registeredEvents: [0, 0, 0, 0, 0, 0],
    eHackPendingRequests: 0,
    impetusPendingRequests: 0,
    innoventurePendingRequests: 0,
    eHackTeamId: null,
    impetusTeamId: null,
    innoventureTeamId: null,
    eHackTeamRole: null,
    impetusTeamRole: null,
    innoventureTeamRole: null,
  }).save();

  const savedUser = await User.findOne({ username: req.body.username });
  const { accessToken } = await generateTokens(savedUser);
  res.status(201).json({
    message: "Account created sucessfully",
    accessToken,
  });
});

exports.basicAuthLogIn = catchAsync(async (req, res, next) => {
  const { error } = logInBodyValidation(req.body);
  if (error) {
    return next(
      new AppError(
        error.details[0].message,
        400,
        errorCodes.INPUT_PARAMS_INVALID
      )
    );
  }

  const user = await User.findOne({ username: req.body.username });
  if (!user) {
    return next(
      new AppError(
        "Invalid username or password",
        401,
        errorCodes.INVALID_USERNAME_OR_PASSWORD
      )
    );
  }

  const verifiedPassword = await bcrypt.compare(
    req.body.password,
    user.password
  );

  if (!verifiedPassword) {
    return next(
      new AppError(
        "Invalid username or password",
        401,
        errorCodes.INVALID_USERNAME_OR_PASSWORD
      )
    );
  }

  const { accessToken } = await generateTokens(user);

  res.status(200).json({
    message: "Logged in sucessfully",
    accessToken,
  });
});
