const express = require('express');
const router = express.Router();
const { tokenCheck } = require('../../middlewares/auth');
const cacheMiddleware = require('../../middlewares/cache.middleware');
const {
  getFeeSettingsController,
  updatePlatformFeeController,
  updateInstructorCommissionController,
  getFeeHistoryController
} = require('./platformSetting.controller');

// 1. Get current fees and commission percentages
router.get('/', tokenCheck, cacheMiddleware(300), getFeeSettingsController);
router.get('/fees', tokenCheck, cacheMiddleware(300), getFeeSettingsController);

// 2. Update Platform Fee
router.patch('/platform-fee', tokenCheck, updatePlatformFeeController);
router.put('/platform-fee', tokenCheck, updatePlatformFeeController);

// 3. Update Instructor Commission
router.patch('/commission', tokenCheck, updateInstructorCommissionController);
router.put('/commission', tokenCheck, updateInstructorCommissionController);

// 4. View Audit History
router.get('/history', tokenCheck, cacheMiddleware(300), getFeeHistoryController);
router.get('/history/:type', tokenCheck, cacheMiddleware(300), getFeeHistoryController);

module.exports = router;
