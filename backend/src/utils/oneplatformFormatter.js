// src/utils/oneplatformFormatter.js
const formatDetails = (title, emoji, data) => {
    if (!data || Object.keys(data).length === 0) {
        return '';
    }
    let details = `\n${emoji} **${title}**:\n`;
    Object.entries(data).forEach(([key, value]) => {
        details += `- ${key} : ${value}  \n`;
    });
    return details;
};

function formatAlert(alert) {
    const name = alert.labels?.alertname || 'Unknown Alert';
    const state = alert.status?.toUpperCase() || 'UNKNOWN';
    const priority = alert.labels.priority?.toUpperCase() || 'UNKNOWN';

    const isFiring = alert.status === 'firing';
    const emoji = {
        head: isFiring ? '🔴' : '🟢',
        status: isFiring ? '🚨' : '✅',
        annotations: isFiring ? '📌' : '✅',
        labels: isFiring ? '🔖' : '✅',
        time: '⏰',
        priority: '🚩',
    };

    let displayState = 'Alert';
    if (state === 'RESOLVED') {
        displayState = 'Resolved';
    }

    let msg = `${emoji.head} **[${displayState}] ${name}** \n`;
    msg += `**สถานะ**: ${displayState} \n`;
    msg += `${emoji.priority} **Priority** : ${priority} \n`;

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

    msg += formatDetails('Annotations', emoji.annotations, alert.annotations);
    msg += formatDetails('Labels', emoji.labels, alert.labels);

    return msg.trim();
}

function formatOnePlatformMessage(payload) {
    return payload.alerts.map(formatAlert).join('\n\n');
}

module.exports = { formatOnePlatformMessage };
