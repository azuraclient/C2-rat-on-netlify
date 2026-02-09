const crypto = require('crypto');

// Simple in-memory storage (for production, use a database)
let clients = new Map();
let commands = new Map();

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
