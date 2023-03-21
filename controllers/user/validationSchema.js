const Joi = require("joi");

module.exports = {
  fillUserDetailsBodyValidation: (body) => {
    const schema = Joi.object({
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      mobileNumber: Joi.string()
        .length(10)
        .pattern(/^[0-9]+$/)
        .required(),
      regNo: Joi.string(),
    });
    return schema.validate(body);
  },

  hasFilledDetailsBodyValidation: (body) => {
    const schema = Joi.object({
      token: Joi.string().required(),
      email: Joi.string().email().required(),
    });
    return schema.validate(body);
  },

  joinTeamViaTokenBodyValidation: (body) => {
    const schema = Joi.object({
      token: Joi.string().required(),
    });
    return schema.validate(body);
  },

  updateRequestBodyValidation: (body) => {
    const schema = Joi.object({
      status: Joi.number().min(0).max(1).required(),
    });
    return schema.validate(body);
  },

  registerEventBodyValidation: (body) => {
    const schema = Joi.object({
      op: Joi.number().min(0).max(1).required(),
      eventCode: Joi.number().min(0).max(5).required(),
    });
    return schema.validate(body);
  },
};
