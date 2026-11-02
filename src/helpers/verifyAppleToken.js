const { verifyAppleToken } = require('../infrastructure/oauth/appleAuth.service');
const { verifyGoogleToken } = require('../infrastructure/oauth/googleAuth.service');

module.exports = {
  verifyAppleToken,
  verifyGoogleToken,
};
