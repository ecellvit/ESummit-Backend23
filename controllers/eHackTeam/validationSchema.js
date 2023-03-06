const Joi = require("joi");
const { objectIdLength } = require("../../utils/constants");

module.exports = {
  createTeamBodyValidation: (body) => {
    const schema = Joi.object({
      teamName: Joi.string().required(),
    });
    return schema.validate(body);
  },

  updateTeamBodyValidation: (body) => {
    const Schema = Joi.object({
      teamName: Joi.string().required(),
    });
    return Schema.validate(body);
  },

  updateRequestBodyValidation: (body) => {
    const Schema = Joi.object({
      userId: Joi.string().required().length(objectIdLength).required(),
      status: Joi.number().min(0).max(1).required(),
    });
    return Schema.validate(body);
  },

  removeMemberBodyValidation: (body) => {
    const Schema = Joi.object({
      userId: Joi.string().required().length(objectIdLength).required(),
    });
    return Schema.validate(body);
  },

  fileUploadBodyValidation: (body) => {
    const Schema = Joi.object({
      file: Joi.string().required(),
    });
    return Schema.validate(body);
  },
};
