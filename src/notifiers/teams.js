const axios     = require('axios');
const Notifier  = require('./notifier');
const { toTeamsMessage } = require('../utils/formatters');

class TeamsNotifier extends Notifier {
  constructor() {
    super('teams');
    this.webhookUrl = process.env.TEAMS_WEBHOOK_URL;
    if (!this.webhookUrl) throw new Error('TEAMS_WEBHOOK_URL not set');
  }

  async send(payload) {
    const text = toTeamsMessage(payload);
    await axios.post(this.webhookUrl, { text });
  }
}

module.exports = TeamsNotifier;
