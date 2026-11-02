require('dotenv').config();

const envConfig = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.BACKEND_PORT) || 8049,
  secondaryPort: process.env.SECONDARY_PORT ? Number(process.env.SECONDARY_PORT) : 8047,
  serverIP: process.env.API_SERVER_IP || 'localhost',
  appName: process.env.APPNAME || 'swimletes',
  mongoUri: process.env.MONGODB_CONNECTION,
  socketPort: Number(process.env.SOCKET_PORT) || 3021,
  jwt: {
    secret: process.env.JWT_ACCESS_TOKEN || 'default_jwt_secret',
    accessExpiry: process.env.JWT_ACCESS_EXPIRATION || '7d',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRATION || '30d',
    resetExpiry: process.env.JWT_RESET_EXPIRATION || '15m',
  },
  session: {
    secret: process.env.SESSION_SECRET || 'swimletes_session_secret_key',
  },
  stripe: {
    secretKey: process.env.STRIPE_SK || process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },
  smtp: {
    username: process.env.SMTP_USERNAME,
    password: process.env.SMTP_PASSWORD,
    from: process.env.SMTP_USERNAME,
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true,
  },
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    fromPhone: process.env.TWILIO_PHONE_NUMBER,
  },
  monitor: {
    username: process.env.MONITOR_USERNAME,
    password: process.env.MONITOR_PASSWORD,
  }
};

module.exports = envConfig;

