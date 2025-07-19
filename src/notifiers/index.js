const TeamsNotifier = require('./teams');

const notifiers = [
  new TeamsNotifier(),
  // 🔜 new SlackNotifier(), new EmailNotifier() …
];

async function notifyAll(payload) {
  await Promise.allSettled(notifiers.map(n => n.send(payload)));
}

module.exports = { notifyAll };
