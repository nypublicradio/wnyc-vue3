# Testing Utilities

This directory contains utilities for testing JWT-protected API endpoints and managing JWT secrets.

## JWT Utilities

The `jwt-utils.js` script provides comprehensive JWT management functionality:

- Generate JWT tokens for testing API endpoints
- Generate URL-safe JWT secrets for deployment

### Commands

#### Generate JWT Secret (URL-Safe)

```bash
npm run jwt secret
```

Creates a cryptographically secure JWT secret using only URL-safe characters (letters, numbers, hyphens, underscores). This avoids deployment issues with special characters like `/` and `+` found in standard base64 encoding.

Options:

- `--length=<bytes>` - Secret length in bytes (default: 48)

Example:

```bash
npm run jwt secret -- --length=64
```

#### Generate JWT Token for Testing

```bash
npm run jwt token
```

Creates valid JWT tokens for testing API endpoints with tools like Bruno, Postman, or curl.

Options:

- `--user-id=<id>` - User ID for the token (default: test-user-123)
- `--email=<email>` - Email for the token (default: `test@example.com`)
- `--expires=<hours>` - Expiration in hours (default: 24)

Examples:

```bash
# Basic token generation
npm run jwt token

# Custom user data
npm run jwt token -- --user-id="custom-user-123" --email="user@example.com"

# Token that expires in 48 hours
npm run jwt token -- --expires=48
```

#### Show Help

```bash
npm run jwt --help
# or
npm run jwt
```

### Output

The script provides:

1. **JWT Token** - Ready to use in Authorization headers
2. **Bruno Header Format** - Copy-paste ready for Bruno REST client
3. **Token Payload** - Shows what data is encoded in the token
4. **Copy Commands** - macOS clipboard commands for quick copying
5. **Curl Example** - Complete curl command for testing

### Example Output

```text
📋 Generated JWT Token:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0LXVzZXItMTIzIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiaWF0IjoxNjk5ODczMjAwLCJleHAiOjE2OTk5NTk2MDAsImlzcyI6IndueWMtdnVlMy1hcHAifQ.example_signature

📝 Bruno HTTP Header:
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0LXVzZXItMTIzIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiaWF0IjoxNjk5ODczMjAwLCJleHAiOjE2OTk5NTk2MDAsImlzcyI6IndueWMtdnVlMy1hcHAifQ.example_signature
```

### Using with Bruno

1. Run `npm run jwt token`
2. Copy the "Bruno HTTP Header" line
3. In Bruno, go to Headers tab
4. Add a new header and paste the full line
5. Bruno will parse it as: `Authorization: Bearer <token>`

### Token Details

- **Valid for**: 24 hours from generation
- **Algorithm**: HS256
- **Secret**: Uses `JWT_SECRET` from your `.env` file
- **Claims**: userId, email, iat (issued at), exp (expires), iss (issuer)

### Testing Protected Endpoints

With the generated token, you can test any JWT-protected endpoint:

- `/api/profile` - User profile with Salesforce integration
- Any route protected with the `auth` middleware

### Troubleshooting

If you get authentication errors:

1. **Different JWT secrets between environments**: The most common issue is that your local `.env` and production/staging environments use different `JWT_SECRET` values. JWT tokens are environment-specific.
   
   **Solution**: For testing production/staging endpoints, you need to either:
   - Get a JWT token from the actual environment (login through the app)
   - Or temporarily use the same `JWT_SECRET` in both environments

2. **Token expired**: Ensure the token hasn't expired (24 hour default)
3. **Wrong header format**: Verify the Authorization header format is exactly: `Authorization: Bearer <token>`
4. **Environment mismatch**: Check that `JWT_SECRET` in your local `.env` matches what the target server is using

### Testing Against Remote Environments

**Important**: JWT tokens generated locally will only work against your local development server. For testing against production or staging deployments (like Fly.io), you have a few options:

#### Option 1: Get Token from Remote Environment

1. Open the remote app in your browser (e.g., `https://pr-356-nypublicradio-wnyc-vue3.fly.dev`)
2. Log in normally through the UI
3. Open browser dev tools → Network tab
4. Make any authenticated request
5. Copy the `Authorization: Bearer <token>` header from the request

#### Option 2: Use Remote Environment's JWT_SECRET

1. Get the `JWT_SECRET` value from your remote environment
2. Temporarily update your local `.env` with that value
3. Generate a token with `npm run jwt token`
4. Test against the remote endpoint
5. **Remember to restore your local JWT_SECRET afterward**

#### Option 3: Test Authentication Flow End-to-End

Instead of testing individual API endpoints, test the full authentication flow through the UI on the remote environment.
