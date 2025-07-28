// src/notifiers/oneplatform.js

const axios = require('axios');
require('dotenv').config();
const { formatOnePlatformMessage } = require('../utils/oneplatformFormatter');

const CHATBOT_API_URL = process.env.CHATBOT_API_URL;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const RECIPIENT_ID = process.env.RECIPIENT_ID;

async function sendToOnePlatform(payload) {
  const message = formatOnePlatformMessage(payload);
  console.log('✅ Sent to OnePlatform', message);

  const requestBody = {
    to: RECIPIENT_ID,
    message: message,
    type: "text",
    custom_notification: "PRD Alert อ่านเดียวนี้!!!"
  };

  const headers = {
    Authorization: `Bearer ${ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  };

  try {
    const res = await axios.post(CHATBOT_API_URL, requestBody, { headers });
    console.log('✅ Sent Alert to OnePlatform');
  } catch (err) {
    console.error('❌ Failed to send to OnePlatform:', err.message);
    throw err;
  }
}

module.exports = {
  send: sendToOnePlatform,
  name: 'oneplatform'
};
