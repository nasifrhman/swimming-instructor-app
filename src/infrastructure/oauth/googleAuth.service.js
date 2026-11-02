const { OAuth2Client } = require('google-auth-library');
const ApiError = require('../../exceptions/ApiError');
const { status: httpStatus } = require('http-status');
const logger = require('../../utils/logger');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const verifyGoogleToken = async (idToken) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        'Invalid Google ID token'
      );
    }

    if (!payload.email_verified) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        'Google email is not verified'
      );
    }

    return {
      googleId: payload.sub,
      email: payload.email,
      name: payload.name,
      image: payload.picture,
      emailVerified: payload.email_verified,
    };
  } catch (error) {
    logger.error(`Google token verification failed: ${error.message}`);
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'Invalid Google ID token'
    );
  }
};

module.exports = {
  verifyGoogleToken,
};

