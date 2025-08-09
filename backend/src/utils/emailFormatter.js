// src/utils/emailFormatter.js
function formatAlert(alert) {
    const name = alert.labels?.alertname || 'Unknown Alert';
    const state = alert.status?.toUpperCase() || 'UNKNOWN';
    const isFiring = alert.status === 'firing';
    const emoji = {
        head: isFiring ? '🔴' : '🟢',
        annotations: '📌',
        labels: '🔖',
        time: '⏰',
    };
    let displayState = state;
    if (isFiring) {
        displayState = 'Alert';
    } else if (state === 'RESOLVED') {
        displayState = 'Resolved';
    }
    let msg = `
        <div style="border: 1px solid ${isFiring ? '#ffcccc' : '#ccffcc'}; padding: 15px; margin-bottom: 15px; border-radius: 8px; background-color: ${isFiring ? '#fff0f0' : '#f0fff0'};">
            <h3 style="color: ${isFiring ? '#cc0000' : '#008000'}; margin-top: 0; margin-bottom: 10px;">
                ${emoji.head} [${displayState}] ${name}
            </h3>
            <p style="margin-bottom: 5px;"><strong>สถานะ:</strong> <span style="font-weight: bold; color: ${isFiring ? '#cc0000' : '#008000'};">${displayState}</span></p>
    `;
    const formatTime = (isoTime) => {
        const date = new Date(isoTime);
        return date.toLocaleString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false, 
            timeZone: 'Asia/Bangkok'
        });
    };
    const startsAt = formatTime(alert.startsAt);
    let endsAt = 'อยู่ระหว่างดำเนินการแก้ไข';
    if (!isFiring && alert.endsAt && alert.endsAt !== '0001-01-01T00:00:00Z') {
        endsAt = formatTime(alert.endsAt);
    }
    msg += `<p style="margin-bottom: 5px;">${emoji.time} <strong>เวลาเริ่มต้น:</strong> ${startsAt}</p>`;
    msg += `<p style="margin-bottom: 15px;">${emoji.time} <strong>เวลาสิ้นสุด:</strong> ${endsAt}</p>`;
    if (Object.keys(alert.annotations || {}).length > 0) {
        msg += `<p style="margin-bottom: 5px;">${emoji.annotations} <strong>รายละเอียด (Annotations):</strong></p><dl style="margin-top: 0; margin-bottom: 15px; padding-left: 10px;">`;
        Object.entries(alert.annotations).forEach(([key, value]) => {
            msg += `<dt style="font-weight: bold; float: left; margin-right: 5px; min-width: 100px;">${key}:</dt><dd style="margin-left: 0; overflow: hidden; margin-bottom: 5px;">${value}</dd>`;
        });
        msg += `</dl>`;
    }
    if (Object.keys(alert.labels || {}).length > 0) {
        msg += `<p style="margin-bottom: 5px;">${emoji.labels} <strong>ข้อมูลอื่นๆ (Labels):</strong></p><dl style="margin-top: 0; margin-bottom: 0; padding-left: 10px;">`;
        Object.entries(alert.labels).forEach(([key, value]) => {
            msg += `<dt style="font-weight: bold; float: left; margin-right: 5px; min-width: 100px;">${key}:</dt><dd style="margin-left: 0; overflow: hidden; margin-bottom: 5px;">${value}</dd>`;
        });
        msg += `</dl>`;
    }
    msg += `</div>`;
    return msg;
}
function formatEmailMessage(payload) {
    const firingAlerts = payload.alerts.filter(alert => alert.status === 'firing');
    const resolvedAlerts = payload.alerts.filter(alert => alert.status === 'resolved');
    if (firingAlerts.length === 0 && resolvedAlerts.length === 0) {
        return null;
    }
    const allAlerts = [...firingAlerts, ...resolvedAlerts];
    const alertCount = allAlerts.length;
    const note = `<p><strong>📣 หมายเหตุ:</strong> <span style="background-color: #ffff00; padding: 2px;">รบกวนเปิดเคสแจ้งทีม Openlandscape Cloud ตรวจสอบครับ</span> (จำนวนการแจ้งเตือนทั้งหมด ${alertCount} รายการ >> <span style="color: #cc0000; font-weight: bold;">Firing : ${firingAlerts.length}</span> , <span style="color: #008000; font-weight: bold;">Resolved : ${resolvedAlerts.length}</span>)</p><hr style="margin:20px 0;">`;
    const alertsHtml = allAlerts.map(formatAlert).join('<hr style="margin:20px 0;">');
    return note + alertsHtml;
}
module.exports = { formatEmailMessage };
