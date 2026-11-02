const jwt = require('jsonwebtoken');
const envConfig = require('../config/env.config');

const tokenGenerator = async (user) => {
  const payload = {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    number: user.number,
    countryCode: user.countryCode,
    image: user.image,
    role: user.role,
    tokenVersion: user.tokenVersion
  };

  return jwt.sign(payload, envConfig.jwt.secret, {
    expiresIn: '1y',
  });
};

const resetTokenGenerator = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      purpose: "reset-password"
    },
    envConfig.jwt.secret,
    {
      expiresIn: envConfig.jwt.resetExpiry || "15m"
    }
  );
};

module.exports = {
  tokenGenerator,
  resetTokenGenerator,
};

