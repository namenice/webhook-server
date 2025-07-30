// src/routes/alertHistory.js
const express = require('express');
const router = express.Router();
const alertDB = require('../db/alertDB');

router.get('/all', (req, res) => {
  try {
    const alerts = alertDB.getAllAlerts();
    res.json(alerts);
  } catch (err) {
    console.error('Error in /api/alerts/history/all:', err);
    res.status(500).json({ error: 'get-all-failed' });
  }
});

router.get('/unresolved', (req, res) => {
  try {
    const alerts = alertDB.getUnresolvedAlerts();
    res.json(alerts);
  } catch (err) {
    console.error('Error in /api/alerts/history/unresolved:', err);
    res.status(500).json({ error: 'get-unresolved-failed' });
  }
});

router.get('/counts', (req, res) => {
  try {
    const counts = alertDB.getCounts();
    res.json(counts);
  } catch (err) {
    console.error('Error in /api/alerts/history/counts:', err);
    res.status(500).json({ error: 'get-counts-failed' });
  }
});

// New PUT endpoint to resolve an alert by ID
router.put('/resolve/:id', async (req, res) => {
  const alertId = req.params.id; // Get the alert ID from the URL parameter
  try {
    // Call a function in alertDB to update the alert's status to 'resolved'
    // You'll need to implement this `resolveAlert` function in your alertDB module
    const success = await alertDB.resolveAlert(alertId);

    if (success) {
      res.status(200).json({ message: `Alert ${alertId} resolved successfully.` });
    } else {
      // If resolveAlert returns false, it means the alert was not found or could not be updated
      res.status(404).json({ error: `Alert with ID ${alertId} not found or could not be resolved.` });
    }
  } catch (err) {
    console.error(`Error resolving alert ${alertId}:`, err);
    res.status(500).json({ error: 'resolve-alert-failed', details: err.message });
  }
});

// src/routes/alertHistory.js (เพิ่มส่วนนี้)
router.put('/edit/:id', async (req, res) => {
  const alertId = req.params.id;
  const updatedData = req.body; // รับข้อมูลที่แก้ไขจาก Frontend
  try {
    const success = await alertDB.updateAlertById(alertId, updatedData);
    if (success) {
      res.status(200).json({ message: `Alert ${alertId} updated successfully.` });
    } else {
      res.status(404).json({ error: 'Alert not found or no changes made.' });
    }
  } catch (error) {
    console.error('Error updating alert in backend:', error);
    res.status(500).json({ error: 'update-alert-failed', details: error.message });
  }
});

router.get('/cluster-counts', async (req, res) => {
  try {
    const clusterCounts = await alertDB.getClusterCounts(); // Call new function from alertDB
    res.json(clusterCounts);
  } catch (err) {
    console.error('Error in /api/alerts/history/cluster-counts:', err);
    res.status(500).json({ error: 'get-cluster-counts-failed', details: err.message });
  }
});

module.exports = router;

