
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

<https://nypublicradio-digital.atlassian.net/l/cp/tV6d4Cwh>

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
JWT_EXPIRES_IN=30m  # 30 minutes (recommended for security)
```

**Important**: Use the same JWT_SECRET across all environments (local, staging, production) for token compatibility. The generated secret uses only URL-safe characters to avoid deployment issues with special characters.

### Token Expiration & Automatic Refresh

#### Why 30-minute tokens are secure AND user-friendly:

**Security Benefits:**
- ✅ Short-lived tokens limit exposure if compromised
- ✅ Reduces risk from XSS attacks
- ✅ Forces regular re-authentication checks
- ✅ Follows industry best practices (Auth0, Google OAuth, OWASP)

**User Experience:**
- ✅ **Users NEVER need to re-authenticate manually**
- ✅ Automatic refresh happens transparently
- ✅ Seamless donation/settings access
- ✅ Perfect for infrequent access patterns

#### How Automatic Refresh Works:

```typescript
// Timeline for user accessing donation settings:
User logs in → Gets 30m JWT + 30-day Supabase refresh token
↓
25 minutes later → Auto-refresh triggers (5 min buffer)
↓
New 30m JWT issued silently → User never knows it happened
↓
User accesses donations → Seamless experience
```

#### Multiple Layers of Token Protection:

1. **Proactive Refresh (Every 2 minutes)**
   ```typescript
   // Checks if token expires in < 5 minutes
   // Auto-refreshes before user notices
   setInterval(checkTokenExpiry, 2 * 60 * 1000);
   ```

2. **Reactive Refresh (On API Failure)**
   ```typescript
   // If API call gets 401 (token expired):
   // 1. Auto-refresh token
   // 2. Retry original request
   // 3. Return data seamlessly
   ```

3. **Token Lifespans:**
   - **JWT (Access Token):** 30 minutes
   - **Supabase Refresh Token:** ~30 days
   - **User Re-login Required:** Only after 30+ days of inactivity

#### Environment-Specific Configuration:

```bash
# Production (recommended - secure)
JWT_EXPIRES_IN=30m

# Development (optional - convenience)
JWT_EXPIRES_IN=2h

# Never use in production (security risk)
JWT_EXPIRES_IN=24h
```

### Security Features

- JWT tokens expire after 30 minutes (configurable via `JWT_EXPIRES_IN`)
- Automatic token refresh using Supabase refresh tokens (30-day lifespan)  
- Transparent refresh - users never experience interruptions
- Rate limiting on protected endpoints (10 requests/minute per IP)
- Server-side token validation with HS256 algorithm
- Automatic logout only after refresh token expires (30+ days)

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

- **Valid for**: 30 minutes from generation (configurable via `JWT_EXPIRES_IN`)
- **Algorithm**: HS256  
- **Secret**: Uses `JWT_SECRET` from your `.env` file
- **Claims**: userId, email, iat (issued at), exp (expires), iss (issuer)
- **Auto-refresh**: Transparent refresh via Supabase refresh token (30-day lifespan)

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

## Salesforce Error Handling

The Salesforce integration includes comprehensive error handling with Sentry integration for production monitoring.

### Features

1. **Structured Error Classification** - Categorizes errors into specific types for better debugging
2. **Sentry Integration** - Automatically sends errors to Sentry for production monitoring (when available)
3. **Comprehensive Context** - Includes relevant metadata for debugging
4. **Graceful Fallbacks** - Falls back to console logging when Sentry is not available
5. **Circuit Breaker Protection** - Prevents cascading failures with automatic recovery

### Error Types

```typescript
enum SalesforceErrorType {
    AUTHENTICATION = 'authentication',     // JWT/Session issues
    AUTHORIZATION = 'authorization',       // Permission/access issues  
    NETWORK = 'network',                  // Connection/timeout issues
    VALIDATION = 'validation',            // Input validation failures
    DATA_FORMAT = 'data_format',          // Unexpected response format
    RATE_LIMIT = 'rate_limit',           // API rate limiting
    SOQL_INJECTION = 'soql_injection',    // Security violations
    CIRCUIT_BREAKER = 'circuit_breaker',  // Circuit breaker active
    CONNECTION_POOL = 'connection_pool',  // Pool management issues
    UNKNOWN = 'unknown'                   // Uncategorized errors
}
```

### Enhanced Methods

All Salesforce utility methods include robust error handling:

- **`generateAccessToken()`** - JWT authentication with validation
- **`queryRecord(soql)`** - Raw SOQL with injection protection
- **`findOne(objectType, conditions, fields)`** - SObject single record lookup
- **`find(objectType, conditions, fields)`** - SObject multiple record lookup

### Usage Example

```typescript
try {
    const records = await salesforce.find('Contact', { Id: contactId }, ['Id']);
    return records;
} catch (error) {
    // SalesforceError is automatically created and sent to Sentry
    // Just re-throw for API layer to handle HTTP status mapping
    throw error;
}
```

### API Error Mapping

The profile API automatically maps error types to appropriate HTTP status codes:

- `authentication` → 401 Unauthorized
- `network/circuit_breaker` → 503 Service Unavailable  
- `validation` → 400 Bad Request
- `unknown` → 500 Internal Server Error

### Connection Pool Monitoring

Check connection pool health:

```typescript
const stats = salesforce.getPoolStats();
console.log({
    totalConnections: stats.totalConnections,
    activeConnections: stats.activeConnections,
    tokenCached: stats.tokenCached,
    circuitBreakerFailures: stats.circuitBreakerFailures
});
```

### Circuit Breaker

- Automatically opens after 5 consecutive failures
- Remains open for 60 seconds before allowing retry attempts
- Prevents cascading failures across the system

### Sentry Integration

- Uses existing `@sentry/vue` package with conditional imports
- Falls back to console logging when Sentry is not available
- Includes rich context: operation details, Salesforce objects, system metadata
- Tags errors by type for better monitoring and alerting

### Best Practices

1. **Use SObject Methods**: Prefer `findOne()` and `find()` over raw SOQL for automatic sanitization
2. **Handle SalesforceError**: Check for `instanceof SalesforceError` before re-wrapping
3. **Provide Context**: Include relevant parameters in error context
4. **Monitor Pool Health**: Use `getPoolStats()` for health checks
5. **Respect Circuit Breaker**: Don't bypass circuit breaker logic

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