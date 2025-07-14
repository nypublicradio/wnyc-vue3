#!/usr/bin/env node

/**
 * JWT Utilities for WNYC Vue3 App
 * 
 * This comprehensive script provides utilities for JWT management:
 * 1. Generate JWT tokens for testing API endpoints
 * 2. Generate URL-safe JWT secrets for deployment
 * 
 * Usage:
 *   # Generate JWT token for testing
 *   node scripts/jwt-utils.js token
 *   node scripts/jwt-utils.js token --user-id="123" --email="test@example.com"
 *   
 *   # Generate JWT secret for deployment
 *   node scripts/jwt-utils.js secret
 *   node scripts/jwt-utils.js secret --length=64
 *   
 *   # Show help
 *   node scripts/jwt-utils.js --help
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// JWT implementation without external dependencies
function base64UrlEncode(str) {
    return Buffer.from(str)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

function createJWT(payload, secret) {
    const header = {
        alg: 'HS256',
        typ: 'JWT'
    };

    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    
    const signature = crypto
        .createHmac('sha256', secret)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');

    return `${encodedHeader}.${encodedPayload}.${signature}`;
}

function generateUrlSafeSecret(length = 48) {
    // Use URL-safe base64 encoding (no +, /, or = characters)
    const bytes = crypto.randomBytes(length);
    return bytes.toString('base64')
        .replace(/\+/g, '-')  // Replace + with -
        .replace(/\//g, '_')  // Replace / with _
        .replace(/=/g, '');   // Remove padding =
}

function loadEnvFile() {
    const envPath = path.join(process.cwd(), '.env');
    if (!fs.existsSync(envPath)) {
        console.error('❌ .env file not found. Please create one with JWT_SECRET.');
        process.exit(1);
    }

    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
            envVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
        }
    });

    return envVars;
}

function parseArgs() {
    const args = process.argv.slice(2);
    const options = { command: 'help' };
    
    if (args.length > 0 && !args[0].startsWith('--')) {
        options.command = args[0];
    }
    
    args.forEach(arg => {
        if (arg.startsWith('--')) {
            const [key, value] = arg.split('=');
            options[key.replace('--', '')] = value || true;
        }
    });
    
    return options;
}

function showHelp() {
    console.log('🔑 JWT Utilities for WNYC Vue3 App\n');
    
    console.log('COMMANDS:');
    console.log('  token    Generate JWT token for testing');
    console.log('  secret   Generate URL-safe JWT secret for deployment\n');
    
    console.log('TOKEN OPTIONS:');
    console.log('  --user-id=<id>      User ID for the token (default: test-user-123)');
    console.log('  --email=<email>     Email for the token (default: test@example.com)');
    console.log('  --expires=<hours>   Expiration in hours (default: 24)\n');
    
    console.log('SECRET OPTIONS:');
    console.log('  --length=<bytes>    Secret length in bytes (default: 48)\n');
    
    console.log('EXAMPLES:');
    console.log('  # Generate test JWT token');
    console.log('  npm run jwt token');
    console.log('  npm run jwt token -- --user-id="user123" --email="test@example.com"');
    console.log('');
    console.log('  # Generate JWT secret');
    console.log('  npm run jwt secret');
    console.log('  npm run jwt secret -- --length=64');
    console.log('');
    console.log('  # Direct script usage');
    console.log('  node scripts/jwt-utils.js token');
    console.log('  node scripts/jwt-utils.js secret');
}

function generateToken(options) {
    console.log('🔑 JWT Token Generator for Testing\n');

    // Load environment variables
    const env = loadEnvFile();
    const jwtSecret = env.JWT_SECRET;
    
    if (!jwtSecret) {
        console.error('❌ JWT_SECRET not found in .env file.');
        console.error('💡 Generate one with: npm run jwt secret');
        process.exit(1);
    }

    // Parse options
    const now = Math.floor(Date.now() / 1000);
    const expiresHours = parseInt(options.expires) || 24;
    const expiresIn = expiresHours * 60 * 60; // Convert hours to seconds
    
    const payload = {
        userId: options['user-id'] || 'test-user-123',
        email: options['email'] || 'test@example.com',
        iat: now,
        exp: now + expiresIn,
        iss: 'wnyc-vue3-app'
    };

    // Generate JWT
    const token = createJWT(payload, jwtSecret);

    console.log('📋 Generated JWT Token:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(token);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📝 Bruno HTTP Header:');
    console.log(`Authorization: Bearer ${token}\n`);

    console.log('📊 Token Payload:');
    console.log(JSON.stringify(payload, null, 2));
    console.log(`\n⏱️  Token expires: ${new Date(payload.exp * 1000).toISOString()}`);

    console.log('\n🔧 Usage Examples:');
    console.log('For Bruno REST Client, add this header to your request:');
    console.log(`Authorization: Bearer ${token}`);
    
    console.log('\n📋 Copy commands (macOS):');
    console.log('Token only:');
    console.log(`echo "${token}" | pbcopy`);
    console.log('\nFull header:');
    console.log(`echo "Authorization: Bearer ${token}" | pbcopy`);

    console.log('\n🧪 Test with curl:');
    console.log(`curl -X POST http://localhost:3000/api/profile \\`);
    console.log(`  -H "Authorization: Bearer ${token}" \\`);
    console.log(`  -H "Content-Type: application/json" \\`);
    console.log(`  -d '{"salesforceID": "your-salesforce-contact-id"}'`);

    console.log('\n⚠️  Important Notes:');
    console.log('• This token only works with your LOCAL development server');
    console.log('• For testing remote environments (staging/production), you need:');
    console.log('  - A token from that environment, OR');
    console.log('  - To use that environment\'s JWT_SECRET value');
    console.log('• JWT tokens are environment-specific due to different secrets');
}

function generateSecret(options) {
    console.log('🔐 JWT Secret Generator (URL-Safe)\n');
    
    const length = parseInt(options.length) || 48; // Default 48 bytes
    const secret = generateUrlSafeSecret(length);
    
    console.log('Generated JWT Secret (URL-safe):');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(secret);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('📋 Add to your .env file:');
    console.log(`JWT_SECRET=${secret}\n`);
    
    console.log('🔧 Features:');
    console.log('• Uses only URL-safe characters (letters, numbers, -, _)');
    console.log('• No special characters that cause deployment issues');
    console.log(`• Cryptographically secure (${length} random bytes)`);
    console.log('• Compatible with all deployment environments\n');
    
    console.log('⚠️  Security Notes:');
    console.log('• Keep this secret secure and never commit to version control');
    console.log('• Use different secrets for different environments');
    console.log('• Rotate regularly (recommended: every 3 months)');
    console.log('• Make sure all environments use the same secret for JWT compatibility');
    
    console.log('\n📋 Copy command (macOS):');
    console.log(`echo "${secret}" | pbcopy`);
    
    console.log('\n🚀 Deployment:');
    console.log('• For Fly.io: fly secrets set JWT_SECRET="' + secret + '"');
    console.log('• For other platforms: Set JWT_SECRET environment variable');
}

function main() {
    const options = parseArgs();
    
    switch (options.command) {
        case 'token':
            generateToken(options);
            break;
        case 'secret':
            generateSecret(options);
            break;
        case 'help':
        case '--help':
        default:
            showHelp();
            break;
    }
}

if (require.main === module) {
    main();
}

module.exports = {
    generateToken,
    generateSecret,
    createJWT,
    generateUrlSafeSecret
};
