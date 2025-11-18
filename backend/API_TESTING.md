# API Testing Guide

## Base URL
```
http://localhost:8001
```

## Health Check

### Check API Health
```bash
curl http://localhost:8001/health
```

**Response:**
```json
{"status": "healthy"}
```

## Authentication Endpoints

### 1. Register New User

```bash
curl -X POST http://localhost:8001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "is_active": true,
    "is_superuser": false
  }'
```

**Response:**
```json
{
  "id": "691cb974b8b2f4b027487da1",
  "email": "user@example.com",
  "is_active": true,
  "is_superuser": false,
  "created_at": "2025-11-18T18:22:44.380762"
}
```

### 2. Login (Get Access Token)

```bash
curl -X POST http://localhost:8001/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }'
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### 3. Get Current User (Protected Route)

```bash
# Save the token from login response
TOKEN="your_access_token_here"

curl -X GET http://localhost:8001/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "id": "691cb974b8b2f4b027487da1",
  "email": "user@example.com",
  "is_active": true,
  "is_superuser": false,
  "created_at": "2025-11-18T18:22:44.380000"
}
```

### 4. Logout

```bash
curl -X POST http://localhost:8001/api/auth/logout \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "message": "Successfully logged out"
}
```

## Error Responses

### Unauthorized (No Token)
```json
{
  "detail": "Not authenticated"
}
```

### Invalid Credentials
```json
{
  "detail": "Incorrect email or password"
}
```

### Email Already Registered
```json
{
  "detail": "Email already registered"
}
```

### Invalid Token
```json
{
  "detail": "Could not validate credentials"
}
```

## Complete Authentication Flow Example

```bash
# 1. Register
RESPONSE=$(curl -s -X POST http://localhost:8001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@cityplanning.com",
    "password": "DemoPass123!",
    "is_active": true,
    "is_superuser": false
  }')
echo "Registration: $RESPONSE"

# 2. Login and extract token
TOKEN=$(curl -s -X POST http://localhost:8001/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@cityplanning.com",
    "password": "DemoPass123!"
  }' | jq -r '.access_token')
echo "Token: $TOKEN"

# 3. Get user info
USER_INFO=$(curl -s -X GET http://localhost:8001/api/auth/me \
  -H "Authorization: Bearer $TOKEN")
echo "User Info: $USER_INFO"

# 4. Logout
LOGOUT=$(curl -s -X POST http://localhost:8001/api/auth/logout \
  -H "Authorization: Bearer $TOKEN")
echo "Logout: $LOGOUT"
```

## Testing with httpie (Alternative)

If you have httpie installed:

```bash
# Register
http POST localhost:8001/api/auth/register email="user@example.com" password="SecurePass123!"

# Login
http POST localhost:8001/api/auth/token email="user@example.com" password="SecurePass123!"

# Get current user
http GET localhost:8001/api/auth/me "Authorization: Bearer YOUR_TOKEN"
```

## Swagger UI Documentation

Visit http://localhost:8001/docs for interactive API documentation where you can test all endpoints directly in your browser.

## ReDoc Documentation

Visit http://localhost:8001/redoc for alternative API documentation.
