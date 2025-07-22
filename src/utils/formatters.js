function formatAlert(alert) {
  const name = alert.labels?.alertname || 'Unknown Alert';
  const state = alert.status?.toUpperCase() || 'UNKNOWN';

  const isFiring = alert.status === 'firing';
  const emoji = {
    head: isFiring ? '🔴' : '🟢',
    status: isFiring ? '🚨' : '✅',
    annotations: isFiring ? '📌' : '🧷',
    labels: isFiring ? '🔖' : '🪪',
  };

  let msg = `${emoji.head} **[${state}] ${name}**  \n`;
  msg += `${emoji.status} **Status** : ${state}  \n`;

  // Annotations
  msg += `\n${emoji.annotations} **Annotations**:\n`;
  Object.entries(alert.annotations || {}).forEach(([key, value]) => {
    msg += `- ${key} : ${value}  \n`;
  });

  // Labels
  msg += `\n${emoji.labels} **Labels**:\n`;
  Object.entries(alert.labels || {}).forEach(([key, value]) => {
    msg += `- ${key} : ${value}  \n`;
  });

  return msg.trim();
}

function formatOnePlatformMessage(payload) {
  return payload.alerts.map(formatAlert).join('\n\n');
}

module.exports = { formatOnePlatformMessage };
