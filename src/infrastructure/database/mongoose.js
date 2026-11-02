const mongoose = require('mongoose');
const databaseConfig = require('../../config/database.config');
const logger = require('../../utils/logger');

let isListenersAttached = false;

const attachLifecycleListeners = () => {
  if (isListenersAttached) return;
  isListenersAttached = true;

  mongoose.connection.on('connected', () => {
    logger.info('Mongoose default connection open to MongoDB Atlas');
  });

  mongoose.connection.on('error', (err) => {
    logger.error(`Mongoose connection error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('Mongoose connection disconnected. Attempting to reconnect...');
  });

  mongoose.connection.on('reconnected', () => {
    logger.info('Mongoose connection reconnected to MongoDB Atlas');
  });
};

const connectDatabase = async () => {
  try {
    attachLifecycleListeners();
    const conn = await mongoose.connect(databaseConfig.uri, databaseConfig.options);
    logger.info(`Database connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.error(`Database connection failed: ${error.message}`);
    throw error;
  }
};

const disconnectDatabase = async () => {
  await mongoose.disconnect();
  logger.info('Database disconnected cleanly.');
};

module.exports = {
  connectDatabase,
  disconnectDatabase,
};
