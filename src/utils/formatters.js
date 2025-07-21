function formatFiringAlert(alert) {
  const name   = alert.labels?.alertname || 'Unnamed Alert';
  const state  = alert.status?.toUpperCase() || 'UNKNOWN';
  const instance = alert.labels?.instance || 'unknown instance';
  const summary = alert.annotations?.summary || 'No summary';
  const desc   = alert.annotations?.description || 'No description';
  const url    = alert.generatorURL || '';

  return (
    `🔴 **[CRITICAL ALERT] ${name}**  \n` +
    `🚨 **Status** : Alert  \n` +
    `🖥️  **Instance** : ${instance}  \n` +
    `📝 **Summary** : ${summary}  \n` +
    `📝 **Description** : ${desc}  \n`
  );
}

function formatResolvedAlert(alert) {
  const name   = alert.labels?.alertname || 'Unnamed Alert';
  const state  = alert.status?.toUpperCase() || 'UNKNOWN';
  const instance = alert.labels?.instance || 'unknown instance';
  const summary = alert.annotations?.summary || 'No summary';
  const desc   = alert.annotations?.description || 'No description';

  return (
    `🟢 **[RESOLVED] ${name}**  \n` +
    `✅ **Status** : Ok  \n` +
    `🖥️  **Instance** : ${instance}  \n` +
    `📝 **Summary** : ${summary}  \n` +
    `📝 **Description** : ${desc}`
  );
}

function formatOnePlatformMessage(payload) {
  const messages = payload.alerts.map(alert => {
    if (alert.status === 'firing') return formatFiringAlert(alert);
    if (alert.status === 'resolved') return formatResolvedAlert(alert);
    return `ℹ️ Unknown alert status: ${alert.status}`;
  });

  return messages.join('\n\n');
}

module.exports = { formatOnePlatformMessage };
