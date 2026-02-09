const { createHmac } = require('crypto');

// Simple in-memory storage (for production, use a database)
let clients = new Map();
let commands = new Map();

const AUTH_TOKEN = process.env.AUTH_TOKEN || 'default-token-change-me';

function verifyAuth(event) {
  const authHeader = event.headers.authorization || event.headers.Authorization;
  return authHeader === `Bearer ${AUTH_TOKEN}`;
}

function getClientId(event) {
  return event.headers['x-client-id'] || 'unknown';
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

  try {
    // Verify authentication for both clients and controllers
    if (!verifyAuth(event)) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Unauthorized' })
      };
    }

    const clientId = getClientId(event);
    const timestamp = Date.now();

    // Update client heartbeat
    clients.set(clientId, {
      lastSeen: timestamp,
      ip: event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'unknown',
      userAgent: event.headers['user-agent'] || 'unknown'
    });

    // Check for pending commands
    const pendingCommand = commands.get(clientId);
    
    if (pendingCommand) {
      // Remove command after retrieval
      commands.delete(clientId);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: 'command_pending',
          command: pendingCommand,
          timestamp: timestamp
        })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: 'heartbeat_received',
        timestamp: timestamp,
        next_check: 5000 // Check again in 5 seconds
      })
    };

  } catch (error) {
    console.error('Heartbeat error:', error);
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
