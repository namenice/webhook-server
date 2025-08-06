// src/notifiers/email.js
const nodemailer = require('nodemailer');
require('dotenv').config();
const { formatEmailMessage } = require('../utils/emailFormatter');

const {
    MAIL_HOST,
    MAIL_PORT,
    MAIL_SECURE,
    MAIL_TO,
    MAIL_FROM,
    MAIL_CC
} = process.env;

if (!MAIL_HOST || !MAIL_PORT || !MAIL_FROM || !MAIL_TO) {
    console.error('❌ Missing required environment variables for email sending. Please check your .env file.');
    throw new Error('Missing required environment variables for email sending.');
}

const parsedMailPort = parseInt(MAIL_PORT, 10);
const parsedMailSecure = MAIL_SECURE === 'true';
const transporter = nodemailer.createTransport({
    host: MAIL_HOST,
    port: parsedMailPort,
    secure: parsedMailSecure,
});

async function send(payload) {
    const message = formatEmailMessage(payload);
    if (!message) {
        console.log('📭 No firing alerts. Email will not be sent.');
        return;
    }
    const mailOptions = {
        from: MAIL_FROM,
        to: MAIL_TO,
        cc: MAIL_CC,
        subject: '⚠️[Alert] Critical Infra From Openlandscape Cloud⚠️',
        html: message,
    };
    console.log('Preparing to send mail...');
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('📧 Email sent successfully! Message ID:', info.messageId);
    } catch (error) {
        console.error('❌ Failed to send email:', error.message);
    }
}

module.exports = {
    send,
    name: 'email'
};
