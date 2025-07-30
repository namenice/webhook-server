// src/routes/webhookGrafana.js
const express = require('express');
const router = express.Router();
const registry = require('../notifiers');
const alertDB = require('../db/alertDB');

router.post('/', async (req, res) => {
  const payload = req.body;

  try {
    // 1. ส่งการแจ้งเตือนไปยัง Notifier ต่างๆ และเก็บผลลัพธ์ทั้งหมด
    const notificationResults = await registry.notifyAll(payload);

    // 2. แปลงผลลัพธ์การแจ้งเตือนทั้งหมดเป็น JSON string
    // เพื่อบันทึกทั้งสถานะสำเร็จและไม่สำเร็จของแต่ละช่องทาง
    const channelNotiJsonString = JSON.stringify(notificationResults); 

    // 3. บันทึก Alert ลงฐานข้อมูล พร้อมข้อมูลสถานะการแจ้งเตือนของทุกช่องทาง
    if (Array.isArray(payload.alerts)) {
      for (const alert of payload.alerts) {
        if (alert.status === 'firing') {
          // ส่ง channelNotiJsonString ไปยัง alertDB.insertAlert
          // insertAlert ใน alertDB.js ได้รับการปรับปรุงให้รับ parameter ที่สองเป็น channel แล้ว
          alertDB.insertAlert(alert, channelNotiJsonString);
        } else if (alert.status === 'resolved') {
          // สำหรับ Alert ที่ Resolve แล้ว เราจะอัปเดตสถานะเท่านั้น ไม่จำเป็นต้องอัปเดต channelNoti
          // เพราะ channelNoti หมายถึงช่องทางที่ส่ง Alert 'firing' ครั้งแรก
          alertDB.updateAlert(alert);
        }
      }
    }

    // ตอบกลับสถานะสำเร็จ พร้อมผลลัพธ์การแจ้งเตือน
    res.status(200).json({ status: 'forwarded and saved', notificationResults });
  } catch (err) {
    console.error('Webhook processing error:', err);
    res.status(500).json({ error: 'webhook-processing-failed', details: err.message });
  }
});

module.exports = router;

