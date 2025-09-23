const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3030;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Store SMS messages in memory
const messages = [];

// API endpoint to receive SMS
app.post('/api/sms', (req, res) => {
  const sms = {
    id: `sms-${Date.now()}`,
    ...req.body,
    timestamp: new Date().toISOString(),
    status: 'delivered'
  };

  messages.unshift(sms); // Add to beginning of array

  // Keep only last 100 messages
  if (messages.length > 100) {
    messages.pop();
  }

  console.log('📱 SMS Received:', {
    to: sms.to,
    from: sms.from,
    message: sms.body?.substring(0, 50) + '...'
  });

  res.json({
    success: true,
    messageId: sms.id,
    message: 'SMS queued for delivery'
  });
});

// Get all messages
app.get('/api/messages', (req, res) => {
  res.json(messages);
});

// Clear all messages
app.delete('/api/messages', (req, res) => {
  messages.length = 0;
  res.json({ success: true, message: 'All messages cleared' });
});

// Simple HTML interface
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>SMS Simulator</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          background: #f5f5f5;
        }
        h1 {
          color: #333;
          border-bottom: 2px solid #3b82f6;
          padding-bottom: 10px;
        }
        .stats {
          background: white;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .message {
          background: white;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 10px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          transition: transform 0.2s;
        }
        .message:hover {
          transform: translateY(-2px);
          box-shadow: 0 2px 6px rgba(0,0,0,0.15);
        }
        .header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          padding-bottom: 10px;
          border-bottom: 1px solid #e5e7eb;
        }
        .to {
          color: #3b82f6;
          font-weight: bold;
        }
        .from {
          color: #6b7280;
          font-size: 0.9em;
        }
        .timestamp {
          color: #9ca3af;
          font-size: 0.85em;
        }
        .body {
          margin-top: 10px;
          padding: 10px;
          background: #f9fafb;
          border-radius: 4px;
          white-space: pre-wrap;
          word-wrap: break-word;
        }
        .controls {
          margin-bottom: 20px;
        }
        button {
          background: #ef4444;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
        }
        button:hover {
          background: #dc2626;
        }
        .refresh-btn {
          background: #3b82f6;
          margin-right: 10px;
        }
        .refresh-btn:hover {
          background: #2563eb;
        }
        .badge {
          display: inline-block;
          padding: 2px 8px;
          background: #10b981;
          color: white;
          border-radius: 12px;
          font-size: 0.75em;
          margin-left: 10px;
        }
        .no-messages {
          text-align: center;
          padding: 40px;
          color: #6b7280;
          background: white;
          border-radius: 8px;
        }
      </style>
    </head>
    <body>
      <h1>📱 SMS Simulator</h1>
      <div class="stats">
        <strong>Status:</strong> Running on port ${PORT} |
        <strong>Total Messages:</strong> <span id="count">0</span>
      </div>
      <div class="controls">
        <button class="refresh-btn" onclick="loadMessages()">🔄 Refresh</button>
        <button onclick="clearMessages()">🗑️ Clear All</button>
      </div>
      <div id="messages"></div>

      <script>
        function loadMessages() {
          fetch('/api/messages')
            .then(res => res.json())
            .then(messages => {
              const container = document.getElementById('messages');
              document.getElementById('count').textContent = messages.length;

              if (messages.length === 0) {
                container.innerHTML = '<div class="no-messages">No messages yet. Waiting for SMS...</div>';
                return;
              }

              container.innerHTML = messages.map(msg => {
                const to = Array.isArray(msg.to) ? msg.to.join(', ') : msg.to;
                return \`
                  <div class="message">
                    <div class="header">
                      <div>
                        <span class="to">\${to}</span>
                        <span class="badge">Delivered</span>
                      </div>
                      <span class="timestamp">\${new Date(msg.timestamp).toLocaleString()}</span>
                    </div>
                    <div class="from">From: \${msg.from || 'Unknown'}</div>
                    <div class="body">\${msg.body || msg.message || 'No content'}</div>
                  </div>
                \`;
              }).join('');
            });
        }

        function clearMessages() {
          if (confirm('Clear all messages?')) {
            fetch('/api/messages', { method: 'DELETE' })
              .then(() => loadMessages());
          }
        }

        // Load messages on page load
        loadMessages();

        // Auto-refresh every 2 seconds
        setInterval(loadMessages, 2000);
      </script>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                  📱 SMS SIMULATOR STARTED                   ║
╠════════════════════════════════════════════════════════════╣
║ Web Interface: http://localhost:${PORT}                        ║
║ API Endpoint:  POST http://localhost:${PORT}/api/sms           ║
║ Status:        Ready to receive SMS messages               ║
╚════════════════════════════════════════════════════════════╝
  `);
});