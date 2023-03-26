const AppError = require("../../utils/appError");
const { errorCodes } = require("../../utils/constants");
const innoventureTeams = require("../../models/innoventureTeamModel");
const userModel = require("../../models/userModel");

module.exports = {
  pagination: function () {
    return async (req, res, next) => {
      const page = parseInt(req.query.page);
      const limit = parseInt(req.query.limit);

      if (!page && !limit) {
        try {
          const results = {};
          results.results = await innoventureTeams.find(
            {
              $expr: {
                $lt: [{ $size: { $ifNull: ["$members", []] } }, 4],
              },
            },
            {
              email: 1,
              firstName: 1,
              lastName: 1,
              mobileNumber: 1,
              registeredEvents: 1,
              eHackTeamId: 1,
              impetusTeamId: 1,
              innoventureTeamId: 1,
              eHackTeamRole: 1,
              impetusTeamRole: 1,
              innoventureTeamRole: 1,
              eHackPendingRequests: 1,
              impetusPendingRequests: 1,
              innoventurePendingRequests: 1,
            }
          );

          res.paginatedResults = results;
          next();
        } catch (e) {
          return next(
            new AppError("Internal Server Error", 500, errorCodes.UNKNOWN_ERROR)
          );
        }
      }

      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;

      const results = {};
      if (
        endIndex <
        (await innoventureTeams.countDocuments({
          $expr: {
            $lt: [{ $size: { $ifNull: ["$members", []] } }, 4],
          },
        }))
      ) {
        results.next = {
          page: page + 1,
          limit: limit,
        };
      }
      if (startIndex > 0) {
        results.previous = {
          page: page - 1,
          limit: limit,
        };
      }

      try {
        results.results = await innoventureTeams
          .find({
            $expr: {
              $lt: [{ $size: { $ifNull: ["$members", []] } }, 4],
            },
          })
          .populate("members", {
            email: 1,
            firstName: 1,
            lastName: 1,
            mobileNumber: 1,
            registeredEvents: 1,
            eHackTeamId: 1,
            impetusTeamId: 1,
            innoventureTeamId: 1,
            eHackTeamRole: 1,
            impetusTeamRole: 1,
            innoventureTeamRole: 1,
            eHackPendingRequests: 1,
            impetusPendingRequests: 1,
            innoventurePendingRequests: 1,
          })
          .limit(limit)
          .skip(startIndex)
          .exec();
        res.paginatedResults = results;
        // console.log(res.paginatedResults);
        next();
      } catch (e) {
        return next(
          new AppError("Internal Server Error", 500, errorCodes.UNKNOWN_ERROR)
        );
      }
    };
  },

  paginateAddMembers: function () {
    return async (req, res, next) => {
      const page = parseInt(req.query.page);
      const limit = parseInt(req.query.limit);

      if (!page && !limit) {
        try {
          const results = {};
          results.results = await userModel.find(
            {
              "registeredEvents.2": 1,
              innoventureTeamId: null,
            },
            {
              email: 1,
              firstName: 1,
              lastName: 1,
              // mobileNumber: 1,
            }
          );

          res.paginatedResults = results;
          next();
        } catch (e) {
          return next(
            new AppError("Internal Server Error", 500, errorCodes.UNKNOWN_ERROR)
          );
        }
      }
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;

      const results = {};
      if (
        endIndex <
        (await userModel.countDocuments({
          $expr: {
            $and: [
              { $eq: ["$innoventureTeamId", null] },
              { $eq: [{ $arrayElemAt: ["$registeredEvents", 2] }, 1] },
            ],
          },
        }))
      ) {
        results.next = {
          page: page + 1,
          limit: limit,
        };
      }
      if (startIndex > 0) {
        results.previous = {
          page: page - 1,
          limit: limit,
        };
      }

      try {
        results.results = await userModel
          .find(
            {
              "registeredEvents.2": 1,
              innoventureTeamId: null,
            },
            {
              email: 1,
              firstName: 1,
              lastName: 1,
              // mobileNumber: 1,
            }
          )
          .limit(limit)
          .skip(startIndex)
          .exec();
        res.paginatedResults = results;
        // console.log(res.paginatedResults);
        return next();
      } catch (e) {
        return next(
          new AppError("Internal Server Error", 500, errorCodes.UNKNOWN_ERROR)
        );
      }
    };
  },
};
