const express = require('express');
const router = express.Router();
const { auth } = require('../../middlewares/auth');
const {
  getInstructorEarningsOverview,
  getInstructorTransactionsHistory,
  requestWithdrawal,
  getAdminPendingWithdrawals,
  getAdminWithdrawalHistory,
  getAdminWithdrawalDetails,
  adminActionWithdrawal,
  getAdminPlatformEarningsOverview,
  getAdminPlatformTransactions,
  getBankAccount,
  saveBankAccount,
  deleteBankAccount
} = require('./earnings.controller');

// 
router.get('/admin/overview', auth(['admin']), getAdminPlatformEarningsOverview);
router.get('/admin/transactions', auth(['admin']), getAdminPlatformTransactions);
router.get('/admin/breakdown', auth(['admin']), getAdminPlatformTransactions);
router.get('/admin', auth(['admin']), getAdminPlatformEarningsOverview);

// 
router.get('/admin/withdrawals/pending', auth(['admin']), getAdminPendingWithdrawals);
router.get('/admin/withdrawals/history', auth(['admin']), getAdminWithdrawalHistory);
router.get('/admin/withdrawals/:id', auth(['admin']), getAdminWithdrawalDetails);
router.patch('/admin/withdrawals/:id/action', auth(['admin']), adminActionWithdrawal);
router.patch('/admin/withdrawals/:id/approve', auth(['admin']), adminActionWithdrawal);
router.patch('/admin/withdrawals/:id/reject', auth(['admin']), adminActionWithdrawal);

// 
// Earnings Overview Screen
router.get('/', auth(['instructor', 'admin']), getInstructorEarningsOverview);
router.get('/overview', auth(['instructor', 'admin']), getInstructorEarningsOverview);

// Transactions History Screen
router.get('/transactions', auth(['instructor', 'admin']), getInstructorTransactionsHistory);
router.get('/history', auth(['instructor', 'admin']), getInstructorTransactionsHistory);
router.get('/transactions/history', auth(['instructor', 'admin']), getInstructorTransactionsHistory);

// Instructor Withdrawal Request
router.post('/withdraw', auth(['instructor', 'admin']), requestWithdrawal);
router.post('/withdrawal', auth(['instructor', 'admin']), requestWithdrawal);

// 
router.get('/bank-account', auth(['instructor', 'user', 'admin']), getBankAccount);
router.post('/bank-account', auth(['instructor', 'user', 'admin']), saveBankAccount);
router.put('/bank-account', auth(['instructor', 'user', 'admin']), saveBankAccount);
router.patch('/bank-account', auth(['instructor', 'user', 'admin']), saveBankAccount);
router.delete('/bank-account', auth(['instructor', 'user', 'admin']), deleteBankAccount);

module.exports = router;

