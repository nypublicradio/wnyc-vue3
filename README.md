# Requirements

- Node v18.18.2
- [Homebrew pacakge manager](https://brew.sh/)
- Ruby >= 3
- [Xcode](https://apps.apple.com/us/app/xcode/id497799835?mt=12)
- [Android Studio](https://developer.android.com/studio)
- OSX (building the Android version only should be possible in other platforms but we don't have instructions for that yet)

# OSX Setup

## Install Build tools and dependencies

[Install Xcode](https://apps.apple.com/us/app/xcode/id497799835?mt=12)

After installing Xcode, run the following command to install the Xcode command line tools:
```bash
xcode-select --install
```

Install the dependencies:
Install Homebrew:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Install CocoaPods
```bash
brew install cocoapods
```

Install fastlane
```bash
brew install fastlane
```

(optional) Install Ruby if current version is lower than 3
```bash
brew install ruby
```

## Setting up secrets

Secret keys are in the developer 1password library

.env
/android/keystore.properties
/android/app/keystore.jks

to access our github-hosted dependencies you will need to create a personal access token

## Environment variables
Setting environment variables in your shell
```bash
export $(cat .env | xargs -L 1)
```

## Local Development

```
Install project dependencies:

```bash
npm install
```

To start the development server, run the following command:

```bash
npm run dev
```

To work on the mobile builds, run the following commands:
```bash
npm run generate
npx cap sync
npx cap open ios/android
```

Running this project in xcode for the first time may present an error about not having permissions. From a terminal run the following command : (Path will need to match the path present in the error.)

```bash
sudo xattr -w com.apple.xcode.CreatedByBuildSystem true /Users/username/Library/Developer/Xcode/DerivedData/App-fetbnufjaqwaadatgkquwnaykmin/SourcePackages/checkouts/nanopb/build
```
In xcode, select the AppLocal target to run the app on your development device. The device needs to be added to the development team in the Apple Developer Console.


## Learned Instructions for Ionic/Capacitor module for Nuxt 3
https://nypublicradio-digital.atlassian.net/l/cp/tV6d4Cwh

## JWT Authentication

This application integrates JWT authentication seamlessly with the existing Supabase authentication system. JWT tokens are automatically generated after successful login (email/password or OAuth) without requiring any changes to the existing login flow.

### Core Features
- **Zero breaking changes** - All existing login methods work as-is
- **Automatic JWT generation** - Tokens created automatically after Supabase authentication
- **Server-side protection** - APIs secured with JWT middleware
- **Rate limiting** - Protected endpoints include rate limiting (10 requests/minute per IP)
- **Secure token storage** - JWT tokens managed client-side with automatic expiration

### User Flow
1. User clicks login (Google, Apple, or email/password)
2. Supabase handles authentication (existing flow)
3. User redirected to `/confirm` (existing behavior)
4. JWT token generated automatically from Supabase session
5. User continues to `/home` (existing behavior)

### Developer Usage

#### Making Authenticated API Calls
```javascript
const { authenticatedFetch } = useAuth();

// This will automatically include JWT Bearer token
const profile = await authenticatedFetch('/api/profile', {
  method: 'POST',
  body: { salesforceID: 'contact-id' }
});
```

#### Protecting Routes
```javascript
// Add to any page that requires authentication
definePageMeta({
  middleware: 'auth'
});
```

#### Checking Auth Status
```javascript
const { isAuthenticated, currentUser } = useAuth();
```

### Configuration

**Generate a secure JWT secret:**
```bash
# Generate a URL-safe JWT secret (recommended for deployments)
npm run jwt secret
```

Add to your `.env`:
```bash
JWT_SECRET=your-generated-jwt-secret-from-above
JWT_EXPIRES_IN=24h
```

**Important**: Use the same JWT_SECRET across all environments (local, staging, production) for token compatibility. The generated secret uses only URL-safe characters to avoid deployment issues with special characters.

### Security Features
- JWT tokens expire after 24 hours (configurable)
- Rate limiting on protected endpoints
- Server-side token validation
- Automatic logout on token expiration

### Testing JWT APIs

For testing JWT-protected endpoints with tools like Bruno, Postman, or curl:

#### Generate JWT Tokens for Testing

```bash
# Generate a test JWT token (for LOCAL development only)
npm run jwt token

# With custom user data
npm run jwt token -- --user-id="test123" --email="test@example.com"

# Token that expires in 48 hours
npm run jwt token -- --expires=48

# Show help for all options
npm run jwt --help
```

**Available Options:**

- `--user-id=<id>` - User ID for the token (default: test-user-123)
- `--email=<email>` - Email for the token (default: `test@example.com`)
- `--expires=<hours>` - Expiration in hours (default: 24)

#### Using Generated Tokens

The JWT utility provides comprehensive output for easy testing:

1. **JWT Token** - Ready to use in Authorization headers
2. **Bruno Header Format** - Copy-paste ready for Bruno REST client
3. **Token Payload** - Shows what data is encoded in the token
4. **Copy Commands** - macOS clipboard commands for quick copying
5. **Curl Example** - Complete curl command for testing

**Example with Bruno REST Client:**

1. Run `npm run jwt token`
2. Copy the "Bruno HTTP Header" line from output
3. In Bruno, go to Headers tab
4. Add a new header and paste the full line
5. Bruno will parse it as: `Authorization: Bearer <token>`

#### Protected Endpoints

With the generated token, you can test any JWT-protected endpoint:

- `/api/profile` - User profile with Salesforce integration
- Any route protected with the `auth` middleware

#### Token Details

- **Valid for**: 24 hours from generation (configurable)
- **Algorithm**: HS256
- **Secret**: Uses `JWT_SECRET` from your `.env` file
- **Claims**: userId, email, iat (issued at), exp (expires), iss (issuer)

#### Troubleshooting Authentication Errors

If you get authentication errors:

1. **Different JWT secrets between environments**: The most common issue is that your local `.env` and production/staging environments use different `JWT_SECRET` values. JWT tokens are environment-specific.
   
   **Solution**: For testing production/staging endpoints, you need to either:
   - Get a JWT token from the actual environment (login through the app)
   - Or temporarily use the same `JWT_SECRET` in both environments

2. **Token expired**: Ensure the token hasn't expired (24 hour default)
3. **Wrong header format**: Verify the Authorization header format is exactly: `Authorization: Bearer <token>`
4. **Environment mismatch**: Check that `JWT_SECRET` in your local `.env` matches what the target server is using

#### Testing Against Remote Environments

**Important**: Generated tokens only work with your local development server. For testing remote environments (staging/production), you have a few options:

##### Option 1: Get Token from Remote Environment

1. Open the remote app in your browser (e.g., `https://pr-356-nypublicradio-wnyc-vue3.fly.dev`)
2. Log in normally through the UI
3. Open browser dev tools → Network tab
4. Make any authenticated request
5. Copy the `Authorization: Bearer <token>` header from the request

##### Option 2: Use Remote Environment's JWT_SECRET

1. Get the `JWT_SECRET` value from your remote environment
2. Temporarily update your local `.env` with that value
3. Generate a token with `npm run jwt token`
4. Test against the remote endpoint
5. **Remember to restore your local JWT_SECRET afterward**

##### Option 3: Test Authentication Flow End-to-End

Instead of testing individual API endpoints, test the full authentication flow through the UI on the remote environment.

### Implementation Files

- `pages/confirm.vue` - Enhanced to generate JWT after authentication
- `composables/useAuth.ts` - JWT state management and authenticated fetch
- `server/utils/jwt.ts` - JWT utilities for token generation/verification
- `server/api/auth/session-to-jwt.post.ts` - Converts Supabase sessions to JWT
- `server/api/auth/refresh.post.ts` - JWT token refresh endpoint
- `server/api/auth/verify.get.ts` - JWT token verification endpoint
- `server/api/profile.post.ts` - Example JWT-protected endpoint
- `middleware/auth.ts` - Route protection middleware
- `plugins/auth.client.ts` - Client-side token verification

## Salesforce Integration

This application uses JWT Bearer flow for secure server-to-server authentication with Salesforce. The integration allows the app to authenticate users against Salesforce and retrieve user profile data.

### Setup Requirements

1. **Generate Certificate and Private Key**

   ```bash
   # Generate private key
   openssl genrsa -out salesforce-server.key 2048
   
   # Generate self-signed certificate (valid for 1 year)
   openssl req -new -x509 -key salesforce-server.key -out salesforce-server.crt -days 365
   ```

2. **Create Salesforce Connected App**
   - Login to Salesforce as admin → Setup → Apps → App Manager → New Connected App
   - Basic Information:
     - Connected App Name: `WNYC Vue3 App`
     - Contact Email: `your-email@domain.com`
   - API (Enable OAuth Settings):
     - ✅ Enable OAuth Settings
     - Callback URL: `https://your-domain.com/oauth/callback` (Must be present but is not used)
     - OAuth Scopes: Add "Full access (full)"
     - ✅ Use digital signatures
     - Certificate: Upload `salesforce-server.crt`

3. **Configure User Access**
   - After saving: Manage → Edit Policies
   - Permitted Users: "Admin approved users are pre-authorized"
   - Manage Profiles → Add "System Administrator"

### Environment Variables

Add to your `.env`:

```bash
SF_CLIENT_ID=your_connected_app_consumer_key
SF_USERNAME=your_salesforce_username@domain.com
SF_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
your_private_key_content_from_salesforce-server.key
-----END PRIVATE KEY-----"
SF_LOGIN_URL=https://login.salesforce.com  # Use https://test.salesforce.com for sandbox
```

### Testing the Integration

Test the Salesforce integration by making an authenticated request to the profile endpoint:

```bash
# First get a JWT token by logging in through the app, then:
curl -X POST http://localhost:3000/api/profile \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{"salesforceID": "your-salesforce-contact-id"}'
```

### Common Troubleshooting

- **"user hasn't approved this consumer"** → Configure user access in Connected App settings
- **"invalid_client_id"** → Verify Consumer Key in SF_CLIENT_ID
- **"invalid_grant"** → Ensure private key matches uploaded certificate
- **"invalid_audience"** → Check SF_LOGIN_URL (production vs sandbox)

### Security Best Practices

- Use dedicated integration user with minimal permissions
- Store private key securely (never commit to version control)
- Rotate certificates annually
- Monitor Connected App usage in Salesforce Login History
- Use sandbox for development and testing

## Font Size Scale Reference Helper
--font-size = 16px
--font-ratio = 1.125
--font-size-20 = 5.202rem/83.23px	
--font-size-19 = 4.624rem/73.98px	
--font-size-18 = 4.11rem/65.76px	    
--font-size-17 = 3.653rem/58.45px	
--font-size-16 = 3.247rem/51.96px	
--font-size-15 = 2.887rem/46.18px	
--font-size-14 = 2.566rem/41.05px	
--font-size-13 = 2.281rem/36.49px	
--font-size-12 = 2.027rem/32.44px	
--font-size-11 = 1.802rem/28.83px	
--font-size-10 = 1.602rem/25.63px	
--font-size-9 = 1.424rem/22.78px	
--font-size-8 = 1.266rem/20.25px	
--font-size-7 = 1.125rem/18.00px	
--font-size-6 = 1rem/16.00px	
--font-size-5 = 0.889rem/14.22px	
--font-size-4 = 0.79rem/12.64px	
--font-size-3 = 0.702rem/11.24px	
--font-size-2 = 0.624rem/9.99px	
--font-size-1 = 0.555rem/8.88px	
--font-size-0 = 0.493rem/7.89px