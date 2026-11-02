const transporter = require('./email.transporter');
const envConfig = require('../../config/env.config');
const logger = require('../../utils/logger');

class EmailService {
  /**
   * Send standard email
   * @param {{ email: string, subject: string, html: string }} emailData
   */
  static async sendEmail(emailData) {
    try {
      const mailOptions = {
        from: envConfig.smtp.from,
        to: emailData.email,
        subject: emailData.subject,
        html: emailData.html,
      };
      const info = await transporter.sendMail(mailOptions);
      logger.info(`Email sent to ${emailData.email}: ${info.response}`);
      return info;
    } catch (error) {
      logger.error(`Error sending email to ${emailData.email}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send support email
   * @param {{ email: string, subject: string, html: string }} emailData
   */
  static async sendSupportEmail(emailData) {
    try {
      const mailOptions = {
        from: emailData.email,
        to: envConfig.smtp.from,
        subject: emailData.subject,
        html: emailData.html,
      };
      const info = await transporter.sendMail(mailOptions);
      logger.info(`Support email sent from ${emailData.email}: ${info.response}`);
      return info;
    } catch (error) {
      logger.error(`Error sending support email: ${error.message}`);
      throw error;
    }
  }
}

module.exports = EmailService;

