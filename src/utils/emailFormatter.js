// src/utils/emailFormatter.js
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

  let msg = `<h3>${emoji.head} [${state}] ${name}</h3>`;
  msg += `<p>${emoji.status} <strong>Status</strong>: ${state}</p>`;

  // Time
  const startsAt = new Date(alert.startsAt).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' });
  msg += `<p>${emoji.time} <strong>Time:</strong> ${startsAt}<br>`;

  // Annotations
  msg += `<p>${emoji.annotations} <strong>Annotations:</strong><ul>`;
  Object.entries(alert.annotations || {}).forEach(([key, value]) => {
    msg += `<li><strong>${key}</strong>: ${value}</li>`;
  });
  msg += `</ul></p>`;

  // Labels
  msg += `<p>${emoji.labels} <strong>Labels:</strong><ul>`;
  Object.entries(alert.labels || {}).forEach(([key, value]) => {
    msg += `<li><strong>${key}</strong>: ${value}</li>`;
  });
  msg += `</ul></p>`;

  return msg;
}

function formatEmailMessage(payload) {
  // กรองเฉพาะ alert ที่ status = 'firing'
  const firingAlerts = payload.alerts.filter(alert => alert.status === 'firing');
  if (firingAlerts.length === 0) {
    return null; // ไม่มีข้อความให้ส่ง
  }

  const note = `<p><strong>📣 หมายเหตุ:</strong> รบกวนเปิดเคสแจ้งทีม Openlandscape Cloud ตรวจสอบครับ</p><hr style="margin:20px 0;">`;
  const alertsHtml = firingAlerts.map(formatAlert).join('<hr style="margin:20px 0;">');
  return note + alertsHtml;
}

module.exports = { formatEmailMessage };
