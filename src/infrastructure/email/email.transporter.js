const nodemailer = require('nodemailer');
const envConfig = require('../../config/env.config');

const transporter = nodemailer.createTransport({
  host: envConfig.smtp.host,
  port: envConfig.smtp.port,
  secure: envConfig.smtp.secure,
  auth: {
    user: envConfig.smtp.username,
    pass: envConfig.smtp.password
  },
  tls: {
    rejectUnauthorized: false,
  }
});

module.exports = transporter;

