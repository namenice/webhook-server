require('dotenv').config();
const express  = require('express');
const morgan   = require('morgan');
const grafana  = require('./routes/grafana');

const app = express();
app.use(express.json({ limit: '2mb' }));
app.use(morgan('combined'));

app.use('/webhook/grafana', grafana);
app.get('/health', (_, res) => res.send('ok'));

const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => console.log(`Webhook server listening on :${PORT}`));
