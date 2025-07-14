# Testing Utilities

This directory contains utilities for testing JWT-protected API endpoints.

## JWT Token Generator

The `generate-test-jwt.js` script creates valid JWT tokens for testing API endpoints with tools like Bruno, Postman, or curl.

### Usage

#### Basic Usage
```bash
npm run generate-jwt
```
This generates a token with default test values.

#### Custom User Data
```bash
node scripts/generate-test-jwt.js --user-id="custom-user-123" --email="user@example.com"
```

### Output

The script provides:
1. **JWT Token** - Ready to use in Authorization headers
2. **Bruno Header Format** - Copy-paste ready for Bruno REST client
3. **Token Payload** - Shows what data is encoded in the token
4. **Copy Commands** - macOS clipboard commands for quick copying
5. **Curl Example** - Complete curl command for testing

### Example Output

```
📋 Generated JWT Token:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0LXVzZXItMTIzIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiaWF0IjoxNjk5ODczMjAwLCJleHAiOjE2OTk5NTk2MDAsImlzcyI6IndueWMtdnVlMy1hcHAifQ.example_signature

📝 Bruno HTTP Header:
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0LXVzZXItMTIzIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiaWF0IjoxNjk5ODczMjAwLCJleHAiOjE2OTk5NTk2MDAsImlzcyI6IndueWMtdnVlMy1hcHAifQ.example_signature
```

### Using with Bruno

1. Run `npm run generate-jwt`
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
3. Generate a token with `npm run generate-jwt`
4. Test against the remote endpoint
5. **Remember to restore your local JWT_SECRET afterward**

#### Option 3: Test Authentication Flow End-to-End
Instead of testing individual API endpoints, test the full authentication flow through the UI on the remote environment.
