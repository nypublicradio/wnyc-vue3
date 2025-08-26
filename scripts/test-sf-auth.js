#!/usr/bin/env node

/**
 * Simple test for Salesforce JWT Bearer authentication
 * This will show the exact error you're getting
 */

const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

async function testAuth() {
    console.log('🧪 Testing Salesforce JWT Bearer Authentication\n');

    // Load environment
    const envPath = path.join(process.cwd(), '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const env = {};

    envContent.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
            env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
        }
    });

    const isSandbox = process.argv.includes('--sandbox') || process.argv.includes('-s');
    const loginUrl = isSandbox ? 'https://test.salesforce.com' : (env.SF_LOGIN_URL || 'https://login.salesforce.com');

    console.log(`🌍 Environment: ${isSandbox ? 'SANDBOX' : 'PRODUCTION'}`);
    console.log(`🔗 Login URL: ${loginUrl}`);
    console.log(`👤 Username: ${env.SF_USERNAME}`);
    console.log(`🔑 Client ID: ${env.SF_CLIENT_ID}`);
    console.log('');

    try {
        // Decode private key
        const privateKey = Buffer.from(env.SF_PRIVATE_KEY, 'base64').toString('utf8');
        
        // Create JWT payload
        const now = Math.floor(Date.now() / 1000);
        const jwtPayload = {
            iss: env.SF_CLIENT_ID,
            sub: env.SF_USERNAME,
            aud: loginUrl,
            exp: now + 300, // 5 minutes
            iat: now
        };

        console.log('🔐 JWT Payload:');
        console.log(JSON.stringify(jwtPayload, null, 2));
        console.log('');

        // Sign JWT
        const token = jwt.sign(jwtPayload, privateKey, { algorithm: 'RS256' });
        
        console.log('📝 Generated JWT (first 50 chars):');
        console.log(token.substring(0, 50) + '...');
        console.log('');

        // Make auth request
        console.log('🚀 Making authentication request...');
        const response = await fetch(`${loginUrl}/services/oauth2/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'wnyc-vue3-test/1.0',
                'Accept': 'application/json'
            },
            body: new URLSearchParams({
                grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                assertion: token
            })
        });

        console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
        
        const responseText = await response.text();
        
        if (!response.ok) {
            console.log('❌ Authentication Failed!');
            console.log('📄 Error Response:');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            
            try {
                const errorObj = JSON.parse(responseText);
                console.log(JSON.stringify(errorObj, null, 2));
            } catch {
                console.log(responseText);
            }
            
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            
            if (responseText.includes("user hasn't approved this consumer")) {
                console.log('');
                console.log('💡 This error means:');
                console.log('1. The Connected App requires manual approval, OR');
                console.log('2. The Connected App is not configured for "Admin approved users are pre-authorized"');
                console.log('3. Your user is not assigned to the correct Permission Set/Profile');
                console.log('');
                console.log('🔧 To fix this, check your Connected App settings in Salesforce:');
                console.log('• Setup → App Manager → [Your Connected App] → Manage');
                console.log('• Make sure "Admin approved users are pre-authorized" is checked');
                console.log('• Assign your user to a Permission Set or Profile that has access');
            }
        } else {
            console.log('✅ Authentication Successful!');
            console.log('📄 Response:');
            
            try {
                const authData = JSON.parse(responseText);
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                console.log(JSON.stringify(authData, null, 2));
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            } catch {
                console.log(responseText);
            }
        }

    } catch (error) {
        console.log('💥 Error during test:');
        console.log(error.message);
        console.log('');
        console.log('Stack trace:');
        console.log(error.stack);
    }
}

if (require.main === module) {
    testAuth();
}

module.exports = { testAuth };
