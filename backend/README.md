# City Planning Platform - Backend API

FastAPI backend for the 3D City Planning Platform with PostgreSQL database and JWT authentication.

## Directory Structure

```
backend/
├── app/
│   ├── main.py                 # FastAPI application entry point
│   ├── api/
│   │   ├── routes/
│   │   │   └── auth.py        # Authentication endpoints
│   │   └── deps.py            # Dependency injection (auth, db)
│   ├── core/
│   │   ├── config.py          # Settings and configuration
│   │   └── security.py        # JWT and password hashing
│   ├── db/
│   │   └── database.py        # Database connection and session
│   └── models/
│       ├── user.py            # User model and schemas
│       └── project.py         # Project model and schemas
├── requirements.txt
├── .env                        # Environment variables
└── run.py                      # Development server runner
```

## Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment

Edit `.env` file with your database credentials:

```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/city_planning
SECRET_KEY=your-secret-key-here
```

### 3. Start PostgreSQL

Make sure PostgreSQL is running. If using Docker:

```bash
docker run --name city-planning-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=city_planning \
  -p 5432:5432 \
  -d postgres:15
```

### 4. Run the Server

```bash
python run.py
```

The API will be available at: `http://localhost:8000`

## API Documentation

Once the server is running, visit:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Authentication Endpoints

### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

### Login (Get Token)
```bash
POST /api/auth/token
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}

Response:
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer"
}
```

### Get Current User
```bash
GET /api/auth/me
Authorization: Bearer <access_token>
```

## Database Schema

### Users Table
- `id` (Primary Key)
- `email` (Unique, Indexed)
- `hashed_password`
- `is_active`
- `is_superuser`
- `created_at`
- `updated_at`

### Projects Table
- `id` (Primary Key)
- `user_id` (Foreign Key -> users.id)
- `name`
- `description`
- `model_type` (planning/corporate)
- `sectors` (JSON array)
- `theme`
- `created_at`
- `updated_at`

## Development

### Generate Secret Key

```bash
openssl rand -hex 32
```

### Database Migrations

The app automatically creates tables on startup. For production, consider using Alembic for migrations.

## Testing

Test the authentication flow:

```bash
# Register a user
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "testpass123"}'

# Login
curl -X POST http://localhost:8000/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "testpass123"}'

# Get user info (use token from login response)
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer <your-token-here>"
```
