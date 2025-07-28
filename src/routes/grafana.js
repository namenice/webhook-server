const express  = require('express');
const router   = express.Router();
const registry = require('../notifiers');

router.post('/', async (req, res) => {
  const payload = req.body;                // payload รูปแบบตาม Grafana 12 :contentReference[oaicite:1]{index=1}
//  console.log('Received payload from Grafana:', JSON.stringify(payload, null, 2));

  try {
    const result = await registry.notifyAll(payload);
    res.status(200).json({ status: 'forwarded', result });
  } catch (err) {
    console.error('Notify error', err);
    res.status(500).json({ error: 'notify-failed' });
  }
});

module.exports = router;
