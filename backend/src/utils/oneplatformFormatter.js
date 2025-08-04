// src/utils/oneplatformFormatter.js
function formatAlert(alert) {
  const name = alert.labels?.alertname || 'Unknown Alert';
  const state = alert.status?.toUpperCase() || 'UNKNOWN';

  const isFiring = alert.status === 'firing';
  const emoji = {
    head: isFiring ? '🔴' : '🟢',
    status: isFiring ? '🚨' : '✅',
    annotations: isFiring ? '📌' : '🧷',
    labels: isFiring ? '🔖' : '🪪',
    time: '⏰',
  };

  let msg = `${emoji.head} **[${state}] ${name}**  \n`;
  msg += `${emoji.status} **Status** : ${state}  \n`;

  // Time
  const formatTime = (isoTime) => {
    const date = new Date(isoTime);
    return date.toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' });
  };

  const startsAt = formatTime(alert.startsAt);
  let endsAt = 'กำลังดำเนินการแก้ไข';
  if (!isFiring && alert.endsAt && alert.endsAt !== '0001-01-01T00:00:00Z') {
    endsAt = formatTime(alert.endsAt);
  }
  msg += `${emoji.time} **StartTime** : ${startsAt}  \n`;
  msg += `${emoji.time} **EndTime** : ${endsAt}  \n`;

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
