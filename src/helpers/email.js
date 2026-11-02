const EmailService = require('../infrastructure/email/email.service');

module.exports = {
  emailWithNodemailer: EmailService.sendEmail,
  supportEmailWithNodemailer: EmailService.sendSupportEmail,
};
