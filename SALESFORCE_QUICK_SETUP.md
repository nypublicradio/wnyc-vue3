# Quick Salesforce Setup Reference

## Generated Files
- `salesforce-server.crt` - Upload this to Salesforce Connected App
- `salesforce-server.key` - Use content as SF_PRIVATE_KEY environment variable

## Exact Steps for Certificate Upload in Salesforce:

1. **Setup → Apps → App Manager → New Connected App**

2. **Basic Information:**
   - Connected App Name: `WNYC Vue3 App`
   - API Name: (auto-populated)
   - Contact Email: your-email@domain.com

3. **API (Enable OAuth Settings) Section:**
   - ✅ Check "Enable OAuth Settings"
   - Callback URL: `https://your-domain.com/oauth/callback`
   - Selected OAuth Scopes: Add "Full access (full)"
   - ✅ Check "Use digital signatures"
   - **Certificate:** Click "Choose File" → Select `salesforce-server.crt`

4. **After Saving:**
   - Copy the Consumer Key (this is your SF_CLIENT_ID)
   - Navigate to Manage → Edit Policies
   - Permitted Users: "Admin approved users are pre-authorized"
   - Click "Manage Profiles" → Add "System Administrator"

## Environment Variables to Set:

```bash
SF_CLIENT_ID=your_consumer_key_from_connected_app
SF_USERNAME=your_salesforce_username@domain.com
SF_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDRtHn2qEXDbE6x
g5q91YlEAGVK4juabnXS/1/L+uYVruKlwhVjJDaSDz14aSRIZVD9jwmr25C0Z0U9
xklK6fMUdMMuh1sttyufIUt7m4LqU2OWZBWEKuWmyx8n5P58LHltZ+/eaB9A3cxH
lDmgEsWbZ0zkwU2hfsmKthqMskZAEc2dGIVKEPNvasSV/q8vXx5lT9CXNxTFN3lA
Kzw0y7ksYZB/iX0JV6vHTfuWVBxhiAimbCj9Oy8AYWF2oSwvxhr1PrU2ZQvv652N
CPyRsccdE/k8ox1PGaisHhrHve3bZKkV3yBWppRCUhdNk6c7EQ+wFL9C+Zb6d3y1
dqJWSxYfAgMBAAECggEAHa8YhT1Bjs2cgA0we3GoGgZHpad2J2s+ZhfRusvbrjMQ
uxpI271LCjbPt+UuMR9CV89btPDXar9O3P/d7RWbsTLBVCtDJqqjKUXVwPv84T2H
lHNmBkzqMBzYNAClXfS6WthtFa7odE6mdXVlCM8kxgAuhsJZbPmc/skTOK+djmuU
1Tt/N/HCR3Pi2zB/XlXySmJRyZNBaypo7epbCo2wQB0eoyWZK4x4aWmwVIgnQtOJ
gnryBCLgPoWH8lNC083J6YgAXEmrZQFI9YsPo87cFmrKXZX4vAT5ftUZMeWtLFQl
A2YKgxtFe25MTbuEgNIRJkyG56wXYzvXOCScxLjm/QKBgQD+yvvsSfwJ8mUW/Nc1
qvvsz2ZA5efQD9Q/8yYDu244olIBYRjxN0/kvvh7JwsYeL84eceqhJp7ReVKsazy
HY6Hw2pp3tRiOS/rvjF8DFAAL9e0t+UAZQSCSriCQQp5Ncsci/xbK6PK2NCCf7bm
hCWBSpIaLLg9qnaUkaHLubQxswKBgQDSss8ltRmz851KBZ9x7tVgVSko7e5zBn7w
5jy6+xvil43UZ3cG6UfJX0j3caZSYMaYpG6KQvBXe9SZIpIvQHuITc8b/A11iOyR
QSWcaiP2DWkiiuMcHnQOMr5uEge+ml5qeah46HTKgXqiblJus0CpdltwjZxtNF+/
6RzQk9Bb5QKBgBz/t0p+ZSwwpWbHYiseicu7EzVBtW+Nzad1ohb8px/VAaZcib0y
gWpUfe1uVSn03DauTZZPv1FWdDFbJYbs7ELxb9Qa42tGfPjEzdcDg7txtohAAdVY
qfm2TWetxWZkQ/i8yf0Ka3rz0E95/7QeyDH97cEC4/lIxHRGWvbX7PVXAoGBAKxl
P9bTildSMlVZqm93gsFSjN3/aEZXf1Auomw/gD5z0MmFar+N6n3a6AIGzJbEtlo4
2HVqdequ2HH/9mqRMUKCn75/Cqgrw5zKGDMWKZxutqJbz523UTA41tWLDSkod65Z
Ir7jPIRhUu1KpUoMgxDlVcYPKHm2C84jt7714tr9AoGAG8HqDpM1IyrohOgJ0ueL
C18eK/SyYG6ZbIC0c3vFr0q0w/WfiPI+m/icKGnyE6iWfOX+ubGZNWq5tOoQ90ie
i/s3f3LtbuoIt7jYpHSXc0X2go4zwNjlmAWR5eUPf0Hy2eyZ1uzXTkVvnkJYRmn6
FrZKumVESCucjMtcYeZ4wbo=
-----END PRIVATE KEY-----"
SF_LOGIN_URL=https://login.salesforce.com
```

## Test the Connection:
After setup, test with: `GET /api/salesforce/test`
