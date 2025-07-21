// src/notifiers/index.js
const oneplatform = require('./oneplatform');
module.exports = {
  async notifyAll(payload) {
    await oneplatform.send(payload);
  }
};
