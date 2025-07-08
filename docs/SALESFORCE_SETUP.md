# Salesforce JWT Bearer Authentication Setup Guide

This application uses the JWT Bearer flow for secure server-to-server authentication with Salesforce. Follow these steps to set up the Connected App and obtain the required credentials.

## 1. Create a Connected App in Salesforce

1. **Login to Salesforce** as an admin user
2. **Navigate to Setup** → Apps → App Manager (or Setup → Create → Apps)
3. **Click "New Connected App"**
4. **Fill in Basic Information:**
   - Connected App Name: `WNYC Vue3 App` (or your preferred name)
   - API Name: Will auto-populate
   - Contact Email: Your admin email
   - Description: `Server-to-server API access for WNYC Vue3 application`

## 2. Configure OAuth Settings

1. **Check "Enable OAuth Settings"**
2. **Set Callback URL:** `https://your-domain.com/api/salesforce/callback` (this is required but not used for JWT flow)
3. **Select OAuth Scopes:**
   - Full access (full)
   - Access and manage your data (api)
   - Access your basic information (id)
   - Access unique user identifiers (openid)

## 3. Configure JWT Bearer Flow

1. **Check "Use digital signatures"**
2. **Upload a Certificate:**
   - First, generate a self-signed certificate and private key:
   
   ```bash
   # Generate private key
   openssl genrsa -out server.key 2048
   
   # Generate certificate (you'll be prompted for certificate details)
   openssl req -new -x509 -key server.key -out server.crt -days 365
   ```
   
   - In the Connected App form, after checking "Use digital signatures", you'll see a **"Choose File"** button next to "Certificate"
   - Click **"Choose File"** and select your `server.crt` file
   - The certificate will be uploaded and you should see the filename appear
   - Keep the `server.key` file secure (this is your SF_PRIVATE_KEY)

## Detailed Steps for Certificate Upload

Here's exactly where to find the certificate upload option:

### Step-by-Step Certificate Upload Process:

1. **In the Connected App creation form**, scroll down to the **"API (Enable OAuth Settings)"** section
2. **Check the box** for "Enable OAuth Settings" 
3. **Enter a Callback URL** (required field): `https://your-domain.com/oauth/callback`
4. **Select OAuth Scopes** (add "Full access (full)" and "Perform requests on your behalf at any time (refresh_token, offline_access)")
5. **Look for "Use digital signatures"** checkbox and **check it**
6. **Immediately below "Use digital signatures"**, you'll see a field labeled **"Certificate"**
7. **Click the "Choose File" or "Browse" button** next to the Certificate field
8. **Select your `server.crt` file** that you generated with OpenSSL
9. **The filename should appear** in the Certificate field after upload
10. **Continue with the rest of the Connected App configuration**

### Visual Cues to Look For:
- The certificate upload field only appears AFTER you check "Use digital signatures"
- It's in the same "API (Enable OAuth Settings)" section
- The field is labeled simply as "Certificate" with a file picker button
- After uploading, you should see the certificate filename displayed

### If You Don't See the Certificate Field:
- Make sure "Enable OAuth Settings" is checked first
- Ensure "Use digital signatures" is checked
- The field should appear immediately below the "Use digital signatures" checkbox
- If still not visible, try refreshing the page and re-checking the boxes

## 4. Additional Settings

1. **Permitted Users:** Select "Admin approved users are pre-authorized"
2. **IP Relaxation:** Choose "Relax IP restrictions" if needed
3. **Refresh Token Policy:** Select "Immediately expire refresh token"
4. **Save** the Connected App

## 5. Manage Profiles/Permission Sets

1. **Navigate to** the Connected App you just created
2. **Click "Manage"**
3. **Edit Policies**
4. **Permitted Users:** Select "Admin approved users are pre-authorized"
5. **Click "Manage Profiles"** and add the System Administrator profile
6. **Or Click "Manage Permission Sets"** and add appropriate permission sets

## 6. Environment Variables

Set these environment variables in your deployment environment:

```bash
# The Consumer Key from your Connected App
SF_CLIENT_ID=your_connected_app_consumer_key

# The username of a valid Salesforce user (usually an admin or integration user)
SF_USERNAME=your_salesforce_username@yourdomain.com

# The private key content (include the full key with headers)
SF_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
your_private_key_content_here
-----END PRIVATE KEY-----"

# Salesforce login URL (use https://test.salesforce.com for sandbox)
SF_LOGIN_URL=https://login.salesforce.com
```

## 7. Testing

Once configured, you can test the connection by hitting the test endpoint:
```
GET /api/salesforce/test
```

This will return success/failure and detailed error information if there are issues.

## Troubleshooting

**"Invalid JWT" errors:**
- Verify the private key format is correct (includes headers/footers)
- Check that the certificate uploaded to Salesforce matches the private key
- Ensure the Consumer Key (Client ID) is correct

**"User not authorized" errors:**
- Check that the username exists and is active
- Verify the user has the correct profile/permission set assigned to the Connected App
- Ensure the Connected App is configured for "Admin approved users are pre-authorized"

**"Audience validation failed" errors:**
- Check that SF_LOGIN_URL is correct (https://login.salesforce.com for production, https://test.salesforce.com for sandbox)

## Security Notes

- Store the private key securely and never commit it to source control
- Use environment variables or secure secret management for all credentials
- Consider using a dedicated integration user rather than a personal admin account
- Regularly rotate certificates (recommended annually)
