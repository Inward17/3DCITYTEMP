# FastAPI Backend - City Planning Platform

## Setup

1. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment:**
   - Copy `.env.example` to `.env`
   - Update `DATABASE_URL` with your Supabase PostgreSQL connection string
   - Update `SECRET_KEY` with a secure random string

4. **Run the server:**
   ```bash
   python run.py
   ```

The API will be available at `http://localhost:8000`

## Documentation

- OpenAPI docs: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Project Structure

```
app/
├── core/          # Configuration, security utilities
├── db/            # Database session management
├── models/        # SQLModel definitions
├── api/           # Route handlers
└── main.py        # Application entry point
```

## Authentication

### Register
```bash
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe"
}
```

### Login
```bash
POST /api/auth/token
{
  "email": "user@example.com",
  "password": "password123"
}
```

Returns:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer"
}
```

### Protected Routes
Use the token in the Authorization header:
```
Authorization: Bearer <access_token>
```
