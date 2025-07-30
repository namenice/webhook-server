// src/db/alertDB.js
// นี่คือฐานข้อมูลจำลองในหน่วยความจำ (In-memory mock database)
// ใน Production จริง คุณจะต้องเชื่อมต่อกับฐานข้อมูลจริงๆ เช่น MongoDB, PostgreSQL, MySQL เป็นต้น

const Database = require('better-sqlite3');
const path = require('path');
// กำหนดพาธไปยังไฟล์ฐานข้อมูล alert.db ที่จะถูกสร้างในโฟลเดอร์ root ของ backend
const db = new Database(path.resolve(__dirname, '../../alert.db'));

// สร้างตาราง alerts ถ้ายังไม่มี พร้อมเพิ่มคอลัมน์ channelNoti
db.prepare(`
  CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    alertname TEXT,
    status TEXT,
    startsAt TEXT,
    endsAt TEXT,
    labels TEXT,
    annotations TEXT,
    rawPayload TEXT,
    channelNoti TEXT, -- เพิ่มคอลัมน์นี้
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`).run();

/**
 * ฟังก์ชันสำหรับบันทึก Alert ใหม่ลงในฐานข้อมูล
 * @param {object} alert - ออบเจกต์ Alert จาก Grafana webhook payload
 * @param {string} [channel] - ชื่อช่องทางการแจ้งเตือนที่ถูกส่ง (เช่น 'email,oneplatform')
 */
function insertAlert(alert, channel = null) { // เพิ่ม channel parameter
  // กำหนด endsAt เป็น null ถ้าเป็นค่าเริ่มต้นที่ไม่ได้ระบุการสิ้นสุด
  const endsAt = (alert.endsAt === '0001-01-01T00:00:00Z') ? null : alert.endsAt;

  const stmt = db.prepare(`
    INSERT INTO alerts (alertname, status, startsAt, endsAt, labels, annotations, rawPayload, channelNoti)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    alert.labels?.alertname || 'Unknown', // ใช้ alertname จาก labels หรือ 'Unknown'
    alert.status,
    alert.startsAt,
    endsAt,
    JSON.stringify(alert.labels || {}),      // แปลง labels เป็น JSON string
    JSON.stringify(alert.annotations || {}), // แปลง annotations เป็น JSON string
    JSON.stringify(alert),                   // แปลง payload ทั้งหมดเป็น JSON string
    channel                                  // บันทึก channelNoti ที่นี่
  );
}

/**
 * ฟังก์ชันสำหรับอัปเดตสถานะของ Alert เมื่อได้รับการแก้ไข (resolved)
 * @param {object} alert - ออบเจกต์ Alert จาก Grafana webhook payload ที่มีการแก้ไขสถานะ
 */
function updateAlert(alert) {
  // กำหนด endsAt เป็น null ถ้าเป็นค่าเริ่มต้นที่ไม่ได้ระบุการสิ้นสุด
  const endsAt = (alert.endsAt === '0001-01-01T00:00:00Z') ? null : alert.endsAt;

  const stmt = db.prepare(`
    UPDATE alerts
    SET status = ?, endsAt = ?, rawPayload = ?
    WHERE alertname = ? AND startsAt = ?
  `);

  // อัปเดต status, endsAt และ rawPayload โดยใช้ alertname และ startsAt เป็นเงื่อนไข
  stmt.run(
    alert.status,
    endsAt,
    JSON.stringify(alert),
    alert.labels?.alertname || 'Unknown',
    alert.startsAt
  );
}

/**
 * ดึงข้อมูล Alert ทั้งหมดจากฐานข้อมูล เรียงตามเวลาที่สร้างล่าสุด
 * @returns {Array<object>} รายการ Alert ทั้งหมด
 */
function getAllAlerts() {
  // SELECT * จะดึง channelNoti มาให้เอง หากคอลัมน์นี้มีอยู่
  return db.prepare(`SELECT * FROM alerts ORDER BY created_at DESC`).all();
}

/**
 * ดึงข้อมูล Alert ที่ยังไม่ได้แก้ไข (status = 'firing') จากฐานข้อมูล
 * @returns {Array<object>} รายการ Alert ที่ยัง firing อยู่
 */
function getUnresolvedAlerts() {
  // SELECT * จะดึง channelNoti มาให้เอง หากคอลัมน์นี้มีอยู่
  return db.prepare(`SELECT * FROM alerts WHERE status = 'firing' ORDER BY created_at DESC`).all();
}

/**
 * ดึงจำนวน Alert ที่เป็น 'firing' และ 'resolved'
 * @returns {object} ออบเจกต์ที่มี firing count และ resolved count
 */
function getCounts() {
  const stmt = db.prepare(`
    SELECT status, COUNT(*) as count
    FROM alerts
    GROUP BY status
  `);
  const result = stmt.all();

  const counts = { firing: 0, resolved: 0 };
  for (const row of result) {
    if (row.status === 'firing') counts.firing = row.count;
    if (row.status === 'resolved') counts.resolved = row.count;
  }

  return counts;
}

/**
 * ฟังก์ชันสำหรับแก้ไขสถานะของ Alert ให้เป็น 'resolved' โดยใช้ ID
 * @param {string} alertId - ID ของ Alert ที่ต้องการแก้ไข
 * @returns {boolean} true ถ้าอัปเดตสำเร็จ, false ถ้าไม่พบ Alert
 */
async function resolveAlert(alertId) {
  try {
    const now = new Date().toISOString(); // เวลาปัจจุบันในรูปแบบ ISO
    const stmt = db.prepare(`
      UPDATE alerts
      SET status = 'resolved', endsAt = ?
      WHERE id = ? AND status != 'resolved'
    `);
    const info = stmt.run(now, alertId);

    // info.changes จะเป็น 1 ถ้ามีการอัปเดตแถวสำเร็จ, 0 ถ้าไม่พบ Alert หรือ Alert ถูก Resolve ไปแล้ว
    return info.changes > 0;
  } catch (error) {
    console.error(`Error resolving alert ${alertId} in DB:`, error);
    throw error; // ส่ง Error ต่อไปให้ Route Handler จัดการ
  }
}

function getClusterCounts() {
  const stmt = db.prepare(`
    SELECT
      CASE
        WHEN json_extract(labels, '$.cluster') IS NOT NULL AND json_extract(labels, '$.cluster') != '' THEN json_extract(labels, '$.cluster')
        ELSE 'unknown'
      END AS cluster,
      SUM(CASE WHEN status = 'firing' THEN 1 ELSE 0 END) AS firingCount,
      SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) AS resolvedCount
    FROM alerts
    GROUP BY cluster
    ORDER BY cluster ASC
  `);
  return stmt.all();
}

module.exports = {
  insertAlert,
  updateAlert,
  getAllAlerts,
  getUnresolvedAlerts,
  getCounts,
  resolveAlert,
  getClusterCounts
};
