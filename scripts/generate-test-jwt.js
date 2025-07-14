#!/usr/bin/env node

/**
 * JWT Token Generator for Testing
 * 
 * This script generates JWT tokens for testing API endpoints with Bruno or other tools.
 * 
 * Usage:
 *   node scripts/generate-test-jwt.js
 *   node scripts/generate-test-jwt.js --user-id="123" --email="test@example.com"
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
    const options = {};
    
    args.forEach(arg => {
        if (arg.startsWith('--')) {
            const [key, value] = arg.split('=');
            options[key.replace('--', '')] = value || true;
        }
    });
    
    return options;
}

function main() {
    console.log('🔑 JWT Token Generator for Testing\n');

    // Load environment variables
    const env = loadEnvFile();
    const jwtSecret = env.JWT_SECRET;
    
    if (!jwtSecret) {
        console.error('❌ JWT_SECRET not found in .env file.');
        process.exit(1);
    }

    // Parse command line arguments
    const args = parseArgs();
    
    // Default payload
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = 24 * 60 * 60; // 24 hours
    
    const payload = {
        userId: args['user-id'] || 'test-user-123',
        email: args['email'] || 'test@example.com',
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
    
    console.log('\n📋 Copy commands:');
    console.log('Token only:');
    console.log(`echo "${token}" | pbcopy`);
    console.log('\nFull header:');
    console.log(`echo "Authorization: Bearer ${token}" | pbcopy`);

    console.log('🧪 Test with curl:');
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

if (require.main === module) {
    main();
}
