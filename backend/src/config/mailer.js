const nodemailer = require('nodemailer');
const config = require('./index');

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.port === 465,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"PsyClinic Pro" <${config.smtp.user}>`,
      to,
      subject,
      html,
    });
    return info;
  } catch (error) {
    console.error('Email error:', error.message);
    return null;
  }
};

module.exports = { transporter, sendEmail };
