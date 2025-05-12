# GoalGenius API Documentation

This document provides detailed information about the GoalGenius API endpoints. All API routes are prefixed with `/api`.

## Authentication

All API endpoints require authentication. The application uses [Better Auth](https://github.com/better-auth/better-auth) for authentication, supporting both GitHub and Google OAuth providers.

## Response Format

All responses are returned in JSON format. Successful responses will contain the requested data, while error responses will have the following structure:

```json
{
  "error": "Error message description"
}
```

## Common HTTP Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

## API Endpoints

### Goals

#### Get All Goals
```http
GET /api/goals?userId={userId}
```

**Query Parameters:**
- `userId` (required): The ID of the user whose goals to retrieve

**Response:**
```json
[
  {
    "id": "uuid",
    "userId": "string",
    "title": "string",
    "description": "string?",
    "category": "health" | "career" | "learning" | "relationships",
    "timeFrame": "string",
    "status": "not-started" | "in-progress" | "completed",
    "progress": number,
    "dueDate": "string?",
    "createdAt": "string",
    "updatedAt": "string"
  }
]
```

#### Create Goal
```http
POST /api/goals
```

**Request Body:**
```json
{
  "userId": "string",
  "title": "string",
  "description": "string?",
  "category": "health" | "career" | "learning" | "relationships",
  "timeFrame": "string",
  "status": "not-started" | "in-progress" | "completed",
  "progress": number,
  "dueDate": "string?"
}
```

**Response:** The created goal object

#### Update Goal
```http
PUT /api/goals
```

**Request Body:**
```json
{
  "id": "uuid",
  "title": "string?",
  "description": "string?",
  "category": "string?",
  "timeFrame": "string?",
  "status": "string?",
  "progress": number?,
  "dueDate": "string?"
}
```

**Response:** The updated goal object

#### Delete Goal
```http
DELETE /api/goals?id={goalId}
```

**Query Parameters:**
- `id` (required): The ID of the goal to delete

**Response:**
```json
{
  "success": true
}
```

### Todos

#### Get All Todos
```http
GET /api/todos?userId={userId}
```

**Query Parameters:**
- `userId` (required): The ID of the user whose todos to retrieve

#### Create Todo
```http
POST /api/todos
```

**Request Body:**
```json
{
  "userId": "string",
  "title": "string",
  "description": "string?",
  "priority": "low" | "medium" | "high",
  "status": "pending" | "in-progress" | "completed",
  "dueDate": "string?"
}
```

#### Update Todo
```http
PUT /api/todos
```

#### Delete Todo
```http
DELETE /api/todos?id={todoId}
```

### Notes

#### Get All Notes
```http
GET /api/notes?userId={userId}
```

#### Create Note
```http
POST /api/notes
```

#### Update Note
```http
PUT /api/notes
```

#### Delete Note
```http
DELETE /api/notes?id={noteId}
```

### Milestones

#### Get All Milestones
```http
GET /api/milestones?goalId={goalId}
```

#### Create Milestone
```http
POST /api/milestones
```

#### Update Milestone
```http
PUT /api/milestones
```

#### Delete Milestone
```http
DELETE /api/milestones?id={milestoneId}
```

### Check-ins

#### Get All Check-ins
```http
GET /api/checkins?userId={userId}
```

#### Create Check-in
```http
POST /api/checkins
```

#### Update Check-in
```http
PUT /api/checkins
```

#### Delete Check-in
```http
DELETE /api/checkins?id={checkinId}
```

## Error Handling

The API uses standard HTTP status codes to indicate the success or failure of requests. Here are some common error scenarios:

### Validation Errors (400)
```json
{
  "error": "Missing required fields"
}
```

### Authentication Errors (401)
```json
{
  "error": "Unauthorized access"
}
```

### Not Found Errors (404)
```json
{
  "error": "Resource not found"
}
```

### Server Errors (500)
```json
{
  "error": "Failed to process request"
}
```

## Rate Limiting

The API is protected by Cloudflare's rate limiting. Please be mindful of the following limits:
- Maximum of 100 requests per minute per IP
- Maximum of 1000 requests per hour per IP

## Development and Testing

For local development and testing:

1. Set up your environment variables:
   ```bash
   cp .dev.vars.example .dev.vars
   cp .env.local.example .env.local
   ```

2. Start the development server:
   ```bash
   pnpm dev
   ```

3. The API will be available at `http://localhost:3000/api`

## API Versioning

The current API version is v1. All endpoints are currently unversioned, but future breaking changes will be introduced under new versioned paths (e.g., `/api/v2/`).

## Support

If you encounter any issues or need help with the API:
1. Check the [documentation](https://goalgenius.online/docs) (coming soon)
2. Create an issue on [GitHub](https://github.com/ismailco/goalgenius/issues)

---

Last updated: 2025
