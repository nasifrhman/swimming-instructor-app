const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const ApiError = require('../../exceptions/ApiError');
const { status: httpStatus } = require('http-status');

const appleClient = jwksClient({
  jwksUri: 'https://appleid.apple.com/auth/keys',
});

const getAppleSigningKey = async (kid) => {
  const key = await appleClient.getSigningKey(kid);
  return key.getPublicKey();
};

const verifyAppleToken = async (idToken) => {
  try {
    const decodedHeader = jwt.decode(idToken, {
      complete: true,
    });

    if (!decodedHeader || !decodedHeader.header?.kid) {
      throw new Error('Invalid token header');
    }

    const publicKey = await getAppleSigningKey(decodedHeader.header.kid);

    const payload = jwt.verify(idToken, publicKey, {
      algorithms: ['RS256'],
      issuer: 'https://appleid.apple.com',
    });

    return {
      appleId: payload.sub,
      email: payload.email ?? null,
      emailVerified: payload.email_verified,
      name: payload.name || 'New User',
    };
  } catch (err) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'Invalid Apple ID token'
    );
  }
};

module.exports = {
  verifyAppleToken,
};

