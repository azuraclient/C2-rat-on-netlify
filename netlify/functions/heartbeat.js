const { createHmac } = require('crypto');

// Use JSONBin.io for free persistent storage
const JSONBIN_API_KEY = process.env.JSONBIN_API_KEY;
const JSONBIN_BIN_ID = process.env.JSONBIN_BIN_ID;

const AUTH_TOKEN = process.env.AUTH_TOKEN || 'default-token-change-me';

function verifyAuth(event) {
  const authHeader = event.headers.authorization || event.headers.Authorization;
  return authHeader === `Bearer ${AUTH_TOKEN}`;
}

function getClientId(event) {
  return event.headers['x-client-id'] || 'unknown';
}

// Get current data from JSONBin
async function getBinData() {
  try {
    const response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`, {
      headers: {
        'X-Master-Key': JSONBIN_API_KEY
      }
    });
    const data = await response.json();
    return data.record || { clients: {}, commands: {} };
  } catch (error) {
    return { clients: {}, commands: {} };
  }
}

// Update data in JSONBin
async function updateBinData(data) {
  try {
    await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': JSONBIN_API_KEY
      },
      body: JSON.stringify(data)
    });
  } catch (error) {
    console.error('Failed to update bin:', error);
  }
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

    // Get current data
    const binData = await getBinData();

    // Update client heartbeat
    binData.clients[clientId] = {
      lastSeen: timestamp,
      ip: event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'unknown',
      userAgent: event.headers['user-agent'] || 'unknown'
    };

    // Check for pending commands
    const pendingCommand = binData.commands[clientId];
    
    if (pendingCommand) {
      // Remove command after retrieval
      delete binData.commands[clientId];
      
      // Update bin with removed command
      await updateBinData(binData);
      
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

    // Update bin with new heartbeat
    await updateBinData(binData);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: 'ok',
        timestamp: timestamp,
        next_check: 5000
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
