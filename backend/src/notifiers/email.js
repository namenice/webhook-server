// src/notifiers/email.js
const nodemailer = require('nodemailer');
require('dotenv').config();
const { formatEmailMessage } = require('../utils/emailFormatter');

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT, 10),
  secure: process.env.MAIL_SECURE === 'true', // true for 465, false for others
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

async function send(payload) {
  const message = formatEmailMessage(payload);

  if (!message) {
    console.log('📭 No firing alerts. Email will not be sent.');
    return;
  }

  const mailOptions = {
    from: `"Alert Bot" <${process.env.MAIL_USER}>`,
    to: process.env.MAIL_TO,
    subject: '⚠️[Alert] Critical from Openlandscape Cloud⚠️',
    html: message
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Email sent:', info.messageId);
  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
  }
}

module.exports = {
  send,
  name: 'email'
};

