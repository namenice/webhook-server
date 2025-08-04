// src/routes/webhookGrafana.js
const express = require('express');
const router = express.Router();
const registry = require('../notifiers');

router.post('/', async (req, res) => {
  const payload = req.body;

  try {
    const notificationResults = await registry.notifyAll(payload);
    res.status(200).json({ status: 'forwarded and saved', notificationResults });
  } catch (err) {
    console.error('Webhook processing error:', err);
    res.status(500).json({ error: 'webhook-processing-failed', details: err.message });
  }
});

module.exports = router;

