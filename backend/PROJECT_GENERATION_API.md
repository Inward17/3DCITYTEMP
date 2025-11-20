# Project Generation API Documentation

## Overview
The Project Generation API provides server-side procedural generation of city planning layouts and corporate campuses with dynamic positioning using a radial algorithm.

## Base URL
```
http://localhost:8001/api/v1/projects
```

## Authentication
All endpoints require JWT authentication via Bearer token in the Authorization header.

### Get Token
```bash
# 1. Register user
curl -X POST http://localhost:8001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# 2. Get access token
curl -X POST http://localhost:8001/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

## Endpoints

### 1. Generate Project
**POST** `/api/v1/projects/generate`

Generates a new project with procedurally generated locations and roads based on selected sectors.

#### Request Body
```json
{
  "name": "string",              // Required: Project name
  "description": "string",       // Optional: Project description
  "model_type": "planning",      // Required: "planning" or "corporate"
  "sectors": ["government"],     // Required: Array of sector names (min 1)
  "theme": "string"              // Optional: Theme/style
}
```

#### Model Types & Available Sectors

##### City Planning (`model_type: "planning"`)
- `government` - Administrative buildings (City Hall, Police HQ)
- `healthcare` - Medical facilities (Hospital, Medical Center)
- `education` - Educational institutions (Library, School)
- `commercial` - Business districts (Mall, Office Tower)
- `residential` - Housing areas (Apartments, Hotels)
- `green` - Parks and green spaces (Central Park, Gardens)
- `transportation` - Transit hubs (Station, Terminal)

##### Corporate Campus (`model_type: "corporate"`)
- `admin` - Administration (Office Building, HR Block)
- `research` - R&D facilities (Lab, Innovation Center)
- `conference` - Meeting spaces (Conference Hall, Training Center)
- `cafeteria` - Dining facilities (Cafeteria, Coffee Shop)
- `clinic` - Medical center
- `parking` - Parking structures (Main, Visitor)
- `security` - Security facilities (Command Center, Gate)

#### Response
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "model_type": "planning" | "corporate",
  "sectors": ["string"],
  "theme": "string",
  "user_id": "string",
  "locations": [
    {
      "id": "string",           // Unique ID like "government_1"
      "name": "string",
      "type": "string",         // Building type
      "position": [x, y, z],    // 3D coordinates
      "description": "string",
      "color": "#hexcolor",
      "zone": "string"          // Sector name
    }
  ],
  "roads": [
    {
      "id": "string",           // Unique ID like "r_main_gov1_health1"
      "from_location": "string",
      "to_location": "string",
      "distance": number,
      "type": "main" | "secondary"
    }
  ],
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

#### Example: City Planning
```bash
curl -X POST http://localhost:8001/api/v1/projects/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Downtown Development",
    "description": "Modern city planning project",
    "model_type": "planning",
    "sectors": ["government", "healthcare", "education", "commercial"]
  }'
```

#### Example: Corporate Campus
```bash
curl -X POST http://localhost:8001/api/v1/projects/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Tech Campus Alpha",
    "description": "Modern corporate campus",
    "model_type": "corporate",
    "sectors": ["admin", "research", "cafeteria", "parking"]
  }'
```

### 2. List Projects
**GET** `/api/v1/projects/`

Returns all projects for the authenticated user.

#### Query Parameters
- `skip` (optional, default: 0) - Number of records to skip
- `limit` (optional, default: 100) - Maximum records to return

#### Example
```bash
curl -X GET http://localhost:8001/api/v1/projects/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Get Project
**GET** `/api/v1/projects/{project_id}`

Returns a specific project with all embedded locations and roads.

#### Example
```bash
curl -X GET http://localhost:8001/api/v1/projects/691f5114c6a055aed7e13547 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Delete Project
**DELETE** `/api/v1/projects/{project_id}`

Deletes a project (user must be the owner).

#### Example
```bash
curl -X DELETE http://localhost:8001/api/v1/projects/691f5114c6a055aed7e13547 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Generation Algorithm

### Radial Positioning
- **Center Hub**: First location (usually government/admin) placed as central hub
- **Sector Distribution**: Remaining sectors positioned radially around the center
- **Intra-Zone Spacing**: Multiple buildings in same sector get small offsets (3 units)
- **Base Radius**: 20 units from center for sector placement

### Road Generation
1. **Main Roads**: Connect central hub to first building of each sector
2. **Secondary Roads**: Connect buildings within same sector

## Error Handling

### 400 Bad Request
```json
{
  "detail": "At least one sector must be specified"
}
```
```json
{
  "detail": "No valid sectors provided for planning model"
}
```

### 401 Unauthorized
Missing or invalid authentication token

### 403 Forbidden
User attempting to access/delete another user's project

### 404 Not Found
Project ID does not exist

## Data Structure

### Embedded Model
Locations and roads are **embedded directly** in the Project document for optimal performance:
- Single MongoDB query loads entire scene
- No additional joins required
- Ideal for 3D visualization where all data is needed together

### Database Schema
```
Project {
  _id: ObjectId
  name: string
  description: string
  model_type: enum
  sectors: [string]
  user_id: string
  locations: [LocationEmbedded]  // Embedded array
  roads: [RoadEmbedded]          // Embedded array
  created_at: datetime
  updated_at: datetime
}
```

## Testing Results

✅ City Planning generation (4 sectors): 8 locations, 7 roads
✅ Corporate Campus generation (5 sectors): 9 locations, 8 roads
✅ Full City generation (7 sectors): 14 locations, 13 roads
✅ Empty sectors validation
✅ Invalid sector validation
✅ Authentication required
✅ MongoDB embedded storage verified

## Performance
- Average generation time: <100ms
- Single MongoDB read for complete project
- Radial algorithm complexity: O(n) where n = number of sectors
