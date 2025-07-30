// src/index.js
require('dotenv').config();
const express  = require('express');
const morgan   = require('morgan');
const cors = require('cors');

const webhookGrafanaRoute = require('./routes/webhookGrafana');
const alertHistoryRoute = require('./routes/alertHistory');

const app = express();

app.use(cors());

app.use(express.json({ limit: '2mb' }));
app.use(morgan('combined'));

// Health check endpoint
app.get('/health', (_, res) => res.send('ok'));

// Webhook
app.use('/webhook/grafana', webhookGrafanaRoute);

// API Get Alert
app.use('/api/alerts/history', alertHistoryRoute);




const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => console.log(`Webhook server listening on :${PORT}`));

