const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const { status } = require('http-status');
const ApiError = require('../exceptions/ApiError');
const envConfig = require('../config/env.config');
const userModel = require('../modules/User/user.model');
const { verifyAppleToken } = require('../infrastructure/oauth/appleAuth.service');

const auth = (userRoles, { optional = false } = {}) => {
  return catchAsync(async (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization || !authorization.startsWith('Bearer ')) {
      if (optional) {
        req.User = null;
        return next();
      }
      throw new ApiError(status.UNAUTHORIZED, 'Unauthorized');
    }

    const token = authorization.split(' ')[1];
    let decodedData;

    try {
      decodedData = jwt.verify(token, envConfig.jwt.secret);
    } catch (err) {
      if (optional) {
        req.User = null;
        return next();
      }
      throw new ApiError(status.UNAUTHORIZED, 'Invalid or expired token');
    }

    const user = await userModel.findById(decodedData._id);
    if (!user) throw new ApiError(status.NOT_FOUND, 'Unauthorized User');

    if (userRoles && !userRoles.includes(decodedData.role)) {
      throw new ApiError(status.UNAUTHORIZED, 'You are not authorized');
    }

    if (decodedData.tokenVersion !== undefined && user.tokenVersion !== undefined && decodedData.tokenVersion !== user.tokenVersion) {
      throw new ApiError(status.UNAUTHORIZED, 'Session expired. Please login again.');
    }

    if (decodedData.isLoginToken === false) {
      throw new ApiError(status.FORBIDDEN, 'You are not authorized');
    }

    req.User = decodedData;
    req.dbUser = user;
    next();
  });
};

const resetTokenCheck = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, envConfig.jwt.secret);

    if (decoded.purpose !== 'reset-password') {
      throw new Error();
    }

    req.ResetUser = decoded;
    next();
  } catch {
    throw new ApiError(status.UNAUTHORIZED, 'Invalid or expired token');
  }
};

const tokenCheck = catchAsync(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    const token = authHeader.split(' ')[1];

    if (token && token !== 'null' && token !== 'undefined') {
      try {
        req.User = jwt.verify(token, envConfig.jwt.secret);
      } catch (error) {
        req.User = null;
      }
    }
  }
  next();
});

const requirePermission = catchAsync((permission) => {
  return async (req, res, next) => {
    if (!req.User || !req.User._id) {
      throw new ApiError(status.UNAUTHORIZED, 'Authentication required');
    }
    const admin = await userModel.findOne({ _id: req.User._id, role: 'admin' });
    if (!admin) {
      return res.status(403).json({ message: 'Permission denied, you are not authorized for that' });
    }
    next();
  };
});

const authOrOnboarding = (userRoles, { optional = false } = {}) => {
  return catchAsync(async (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization || !authorization.startsWith('Bearer ')) {
      if (optional) {
        req.User = null;
        return next();
      }
      throw new ApiError(status.UNAUTHORIZED, 'Unauthorized - Bearer token required');
    }

    const token = authorization.split(' ')[1];
    let decodedData;

    try {
      decodedData = jwt.verify(token, envConfig.jwt.secret);
    } catch (err) {
      if (optional) {
        req.User = null;
        return next();
      }
      throw new ApiError(status.UNAUTHORIZED, 'Invalid or expired token');
    }

    // 1. Existing user in DB with _id
    if (decodedData._id) {
      const user = await userModel.findById(decodedData._id);
      if (!user) throw new ApiError(status.NOT_FOUND, 'User not found');

      if (userRoles && !userRoles.includes(user.role)) {
        throw new ApiError(status.FORBIDDEN, 'You are not authorized for this action');
      }

      if (decodedData.tokenVersion !== undefined && user.tokenVersion !== undefined && decodedData.tokenVersion !== user.tokenVersion) {
        throw new ApiError(status.UNAUTHORIZED, 'Session expired. Please login again.');
      }

      req.User = { ...decodedData, _id: user._id, role: user.role };
      req.dbUser = user;
      return next();
    }

    // 2. Existing user in DB found by email
    if (decodedData.email) {
      const user = await userModel.findOne({ email: decodedData.email, isDeleted: false });
      if (user) {
        if (userRoles && !userRoles.includes(user.role)) {
          throw new ApiError(status.FORBIDDEN, 'You are not authorized for this action');
        }
        req.User = { ...decodedData, _id: user._id, role: user.role };
        req.dbUser = user;
        return next();
      }
    }

    // 3. Onboarding user (OTP verified, not yet in DB)
    if (!decodedData.isOtpVerified) {
      throw new ApiError(status.UNAUTHORIZED, 'Please verify OTP before proceeding with onboarding');
    }

    if (userRoles && decodedData.role && !userRoles.includes(decodedData.role)) {
      throw new ApiError(status.FORBIDDEN, 'Role not authorized for this action');
    }

    req.User = decodedData;
    req.dbUser = null;
    next();
  });
};

module.exports = {
  auth,
  authOrOnboarding,
  tokenCheck,
  requirePermission,
  resetTokenCheck,
  verifyAppleToken,
};

