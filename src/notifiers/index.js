// src/notifiers/index.js
require('dotenv').config();

const emailNoti = require('./email');
const oneplatformNoti = require('./oneplatform');

const notifiers = [];
if (process.env.ENABLE_EMAIL === 'true') notifiers.push(emailNoti);
if (process.env.ENABLE_ONEPLATFORM === 'true') notifiers.push(oneplatformNoti);

module.exports = {
  async notifyAll(payload) {
    const results = [];

    for (const notifier of notifiers) {
      try {
        await notifier.send(payload);
        results.push({ notifier: notifier.name || 'unknown', success: true });
      } catch (error) {
        console.error(`❌ Error sending alert with ${notifier.name}:`, error.message);
        results.push({ notifier: notifier.name || 'unknown', success: false });
      }
    }

    return results;
  }
};
