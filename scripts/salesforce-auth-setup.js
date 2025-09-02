#!/usr/bin/env node

/**
 * Salesforce Connected App Authorization Setup
 * 
 * This script helps you authorize a Connected App for JWT Bearer flow
 * by generating the authorization URL for manual approval.
 */

const fs = require('fs');
const path = require('path');

function loadEnvFile() {
    const envPath = path.join(process.cwd(), '.env');
    if (!fs.existsSync(envPath)) {
        console.error('❌ .env file not found');
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

function generateAuthUrl() {
    console.log('🔗 Salesforce Connected App Authorization Setup\n');

    // Check if sandbox mode is requested
    const isSandbox = process.argv.includes('--sandbox') || process.argv.includes('-s');

    const env = loadEnvFile();
    
    // Use sandbox URL if flag is provided, otherwise use environment or default to production
    let loginUrl;
    if (isSandbox) {
        loginUrl = 'https://test.salesforce.com';
        console.log('🏖️  SANDBOX MODE ENABLED');
    } else {
        loginUrl = env.SF_LOGIN_URL || 'https://login.salesforce.com';
        console.log('🏢 PRODUCTION MODE');
    }
    
    const clientId = env.SF_CLIENT_ID;
    
    // Check if custom redirect URI is provided via command line
    const customRedirectIndex = process.argv.findIndex(arg => arg === '--redirect');
    let redirectUri;
    
    if (customRedirectIndex !== -1 && process.argv[customRedirectIndex + 1]) {
        redirectUri = process.argv[customRedirectIndex + 1];
        console.log(`🔗 Using custom redirect URI: ${redirectUri}`);
    } else {
        // Use the standard Salesforce success page that actually works
        redirectUri = 'https://login.salesforce.com/services/oauth2/success';
        console.log('🔗 Using standard Salesforce success page redirect');
    }

    if (!clientId) {
        console.error('❌ SF_CLIENT_ID not found in .env file');
        process.exit(1);
    }

    const authUrl = `${loginUrl}/services/oauth2/authorize?` +
        `response_type=code&` +
        `client_id=${encodeURIComponent(clientId)}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=full%20refresh_token&` +
        `prompt=consent`;

    console.log('📋 Configuration:');
    console.log(`Environment: ${isSandbox ? 'SANDBOX' : 'PRODUCTION'}`);
    console.log(`Login URL: ${loginUrl}`);
    console.log(`Client ID: ${clientId}`);
    console.log(`Username: ${env.SF_USERNAME || 'Not set'}`);
    console.log('');

    console.log('🌐 Authorization URL:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(authUrl);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    console.log('📋 Instructions:');
    console.log('1. Copy the URL above');
    console.log('2. Open it in your browser');
    console.log(`3. Log in with your Salesforce ${isSandbox ? 'SANDBOX' : 'production'} credentials`);
    console.log('4. Click "Allow" to authorize the Connected App');
    console.log('5. You\'ll be redirected to a success page');
    console.log('6. The Connected App will now be approved for JWT Bearer flow');
    console.log('');

    console.log('📋 Copy command (macOS):');
    console.log(`echo "${authUrl}" | pbcopy`);
    console.log('');

    console.log('⚠️  Important Notes:');
    console.log('• Use the same user account that you\'re trying to authenticate with JWT');
    console.log(`• Make sure you log in as: ${env.SF_USERNAME || 'your SF username'}`);
    console.log(`• Environment: ${isSandbox ? 'SANDBOX (test.salesforce.com)' : 'PRODUCTION (login.salesforce.com)'}`);
    console.log('• This only needs to be done once per user per Connected App');
    console.log('• After approval, JWT Bearer flow should work for this user');
    console.log('');
    
    if (!isSandbox) {
        console.log('💡 TIP: Use --sandbox or -s flag for sandbox environment:');
        console.log('   npm run sf-auth -- --sandbox');
        console.log('💡 TIP: Use --redirect <url> to specify custom redirect URI:');
        console.log('   npm run sf-auth -- --redirect "https://login.nypublicradio.org/salesforce/callback"');
    } else {
        console.log('💡 TIP: Use --redirect <url> to specify custom redirect URI:');
        console.log('   npm run sf-auth-sandbox -- --redirect "https://login.nypublicradio.org/salesforce/callback"');
    }
}

if (require.main === module) {
    generateAuthUrl();
}

module.exports = { generateAuthUrl };
