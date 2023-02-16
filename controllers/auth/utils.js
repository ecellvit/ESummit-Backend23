const jwt = require("jsonwebtoken");

const generateTokens = async (user) => {
  try {
    const payload = {
      _id: user._id,
    };
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "5d",
    });
    return Promise.resolve({ accessToken });
  } catch (err) {
    return Promise.reject(err);
  }
};

module.exports = { generateTokens };
