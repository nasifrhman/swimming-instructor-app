const envConfig = require('./env.config');

const databaseConfig = {
  uri: envConfig.mongoUri,
  options: {
    autoIndex: true,
    serverSelectionTimeoutMS: 45000,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 45000,
  }
};

module.exports = databaseConfig;
