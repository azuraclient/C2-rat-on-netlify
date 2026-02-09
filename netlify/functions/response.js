const crypto = require('crypto');

// Simple in-memory storage (for production, use a database)
let responses = new Map();

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

  try {
    if (event.httpMethod === 'POST') {
      // Client submits command response
      const body = JSON.parse(event.body);
      const { clientId, commandId, result, error } = body;

      if (!clientId || !commandId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: 'Missing required fields: clientId, commandId'
          })
        };
      }

      // Store response
      const responseId = crypto.randomUUID();
      responses.set(responseId, {
        id: responseId,
        clientId: clientId,
        commandId: commandId,
        result: result || null,
        error: error || null,
        timestamp: Date.now()
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: 'response_received',
          responseId: responseId,
          timestamp: Date.now()
        })
      };
    }

    if (event.httpMethod === 'GET') {
      // Controller retrieves responses (requires auth)
      if (!verifyAuth(event)) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Unauthorized' })
        };
      }

      const clientId = event.queryStringParameters.clientId;
      
      let filteredResponses = Array.from(responses.values());
      
      if (clientId) {
        filteredResponses = filteredResponses.filter(r => r.clientId === clientId);
      }

      // Sort by timestamp (newest first)
      filteredResponses.sort((a, b) => b.timestamp - a.timestamp);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          responses: filteredResponses,
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
    console.error('Response error:', error);
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
