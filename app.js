const express = require("express");
const cors = require("cors");
const errorController = require("./controllers/errorController");
const { errorCodes } = require("./utils/constants");
const AppError = require("./utils/appError");
const morgan = require("morgan");

const app = express();

app.use(express.json());

app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  // Request headers you wish to allow
  res.setHeader("Access-Control-Allow-Headers", "*");

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", true);

  // Pass to next layer of middleware
  next();
});

morgan.token("req-headers", function (req, res) {
  return JSON.stringify(req.headers);
});

process.env.NODE_ENV != "production" &&
  app.use(morgan(":method :url :status :req-headers"));

app.get("/heartbeat", function (req, res) {
  res.status(200).json({
    message: "Success. Server is up and running",
  });
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/user", require("./routes/userRoutes"));
app.use("/api/impetus", require("./routes/impetusTeamRoutes"));
app.use("/api/ehack", require("./routes/eHackTeamRoutes"));
app.use("/api/innoventure", require("./routes/innoventureTeamRoutes"));
app.use("/api/events", require("./routes/eventRoutes"));
app.use("/api/ecelltech/admin", require("./routes/adminRoutes"));

//all invalid urls handled here
app.all("*", (req, res, next) => {
  next(
    new AppError(
      `Can't find ${req.originalUrl} on this server`,
      404,
      errorCodes.INVALID_URL
    )
  );
});

app.use(errorController);

module.exports = app;
