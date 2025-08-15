const http = require('http');
const express = require('express');
const helmet = require('helmet');
const rate = require('express-rate-limit');
const { WebSocketServer } = require('ws');

const app = express();
app.use(express.json(), helmet(), rate({ windowMs: 60_000, max: 200 }));
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

function broadcast(evt) {
  const data = JSON.stringify(evt);
  wss.clients.forEach(c => c.readyState === 1 && c.send(data));
}

// Example ingestion endpoint (from your auth/pay services)
app.post('/api/sec/event', (req, res) => {
  const evt = { ...req.body, ts: Date.now() };
  broadcast(evt);
  res.json({ ok: true });
});

// Demo: emit a fake event every 10s
setInterval(() => broadcast({ type: 'heartbeat', ts: Date.now() }), 10_000);

server.listen(3008, () => console.log('CyberFort Dashboard :3008'));
