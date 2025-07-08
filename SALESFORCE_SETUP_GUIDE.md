# Salesforce Connected App Setup Guide

This guide walks you through setting up a Salesforce Connected App for JWT Bearer authentication.

## Prerequisites

- Salesforce org with admin access
- A certificate and private key for JWT signing

## Step 1: Create a Connected App

1. **Log in to Salesforce** as an administrator
2. **Navigate to Setup** → **App Manager** → **New Connected App**
3. **Fill in basic information:**
   - Connected App Name: `WNYC Vue3 App` (or your preferred name)
   - API Name: `WNYC_Vue3_App`
   - Contact Email: Your email

## Step 2: Configure OAuth Settings

1. **Enable OAuth Settings:** Check "Enable OAuth Settings"
2. **Callback URL:** `https://your-domain.com/callback` (can be placeholder for JWT flow)
3. **Selected OAuth Scopes:** Add these scopes:
   - `Access and manage your data (api)`
   - `Access your basic information (id, profile, email, address, phone)`
   - `Full access (full)`

## Step 3: Enable JWT Bearer Flow

1. **Use digital signatures:** Check this option
2. **Upload Certificate:** Upload your certificate file (.crt)
   - This should correspond to the private key in your `SF_PRIVATE_KEY` environment variable

## Step 4: Configure User Access (CRITICAL)

This step resolves the "user hasn't approved this consumer" error:

### Option A: Allow All Users (Recommended for internal apps)
1. **After saving the Connected App**, go to **Setup** → **Connected Apps** → **Manage Connected Apps**
2. **Click on your Connected App**
3. **Click "Edit"**
4. **Set Permitted Users** to "All users may self-authorize"
5. **Save**

### Option B: Pre-authorize Specific Users
1. **In the Connected App settings**, set **Permitted Users** to "Admin approved users are pre-authorized"
2. **Create/Edit Permission Sets:**
   - Go to **Setup** → **Permission Sets**
   - Create a new permission set or edit existing one
   - Under **Connected App Access**, add your Connected App
3. **Assign Users to Permission Set:**
   - Assign the permission set to users who need access

### Option C: Profile-based Access
1. **Set Permitted Users** to "Admin approved users are pre-authorized"
2. **Edit Profiles:**
   - Go to **Setup** → **Profiles**
   - Edit the relevant profile(s)
   - Under **Connected App Access**, enable your Connected App

## Step 5: Configure Environment Variables

Set these environment variables in your application:

```bash
SF_CLIENT_ID=your_connected_app_consumer_key
SF_USERNAME=integration-user@yourorg.com
SF_PRIVATE_KEY=your_base64_encoded_private_key_or_pem_string
SF_LOGIN_URL=https://login.salesforce.com  # or https://test.salesforce.com for sandbox
```

## Step 6: Generate Certificate and Private Key (if needed)

If you don't have a certificate/key pair:

```bash
# Generate private key
openssl genrsa -out private.key 2048

# Generate certificate signing request
openssl req -new -key private.key -out request.csr

# Generate self-signed certificate (valid for 1 year)
openssl x509 -req -days 365 -in request.csr -signkey private.key -out certificate.crt

# Convert private key to base64 (for environment variable)
base64 -i private.key -o private.key.base64
```

## Troubleshooting Common Errors

### "user hasn't approved this consumer"
- **Cause:** Connected App not configured to allow user access
- **Solution:** Follow Step 4 above to configure user access

### "invalid_app_access"
- **Cause:** User doesn't have permission to access the Connected App
- **Solution:** Use Option B or C in Step 4 to grant specific user access

### "invalid_client_id"
- **Cause:** Wrong Consumer Key in SF_CLIENT_ID
- **Solution:** Copy the Consumer Key from Connected App details

### "invalid_grant" with certificate errors
- **Cause:** Private key doesn't match uploaded certificate
- **Solution:** Ensure the certificate was generated from the same private key

### "invalid_audience"
- **Cause:** Wrong login URL
- **Solution:** Use https://login.salesforce.com for production, https://test.salesforce.com for sandbox

## Testing the Setup

Once configured, test the integration:

```bash
curl -X GET http://localhost:8880/api/profile
```

If successful, you should see a 200 response. If not, check the error message for specific guidance.

## Security Best Practices

1. **Use a dedicated integration user** with minimal required permissions
2. **Store private key securely** (never commit to version control)
3. **Rotate certificates regularly**
4. **Monitor Connected App usage** in Salesforce Setup → Login History
5. **Use sandbox for development** and testing

## Additional Resources

- [Salesforce JWT Bearer Flow Documentation](https://help.salesforce.com/s/articleView?id=sf.remoteaccess_oauth_jwt_flow.htm)
- [Connected Apps Documentation](https://help.salesforce.com/s/articleView?id=sf.connected_app_overview.htm)
