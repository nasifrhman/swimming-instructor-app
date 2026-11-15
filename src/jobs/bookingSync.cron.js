const cron = require('node-cron');
const mongoose = require('mongoose');
const { syncAutoConfirmedBookings, syncAllAcceptedBookings } = require('../modules/Booking/booking.service');
const logger = require('../utils/logger');

/**
 * Background cron jobs for bookings:
 * 1. Auto-activates accepted bookings when their start time is reached.
 * 2. Auto-confirms lessons after 72 hours (3 days) if the instructor completed and user hasn't responded.
 */
const initCronJobs = () => {
  try {
    // Allow connection to stabilize before running initial sync
    setTimeout(async () => {
      if (mongoose.connection.readyState === 1) {
        try {
          await syncAllAcceptedBookings();
          await syncAutoConfirmedBookings();
        } catch (err) {
          logger.warn(`Startup booking sync warning: ${err.message}`);
        }
      }
    }, 5000);

    // Schedule to run every 10 minutes
    cron.schedule('*/10 * * * *', async () => {
      if (mongoose.connection.readyState !== 1) {
        logger.warn('Skipping booking cron job: database not currently connected.');
        return;
      }
      try {
        await syncAllAcceptedBookings();
        await syncAutoConfirmedBookings();
      } catch (cronErr) {
        logger.error(`Error running booking sync cron job: ${cronErr.message}`);
      }
    });

    logger.info('---> ⏱️  Booking 72h auto-confirmation and activation cron job initialized (runs every 10m)');
  } catch (error) {
    logger.error(`Failed to initialize booking cron jobs: ${error.message}`);
  }
};

module.exports = { initCronJobs };
