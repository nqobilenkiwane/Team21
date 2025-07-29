# AI Health Dashboard - API Endpoints

This document outlines the API endpoints that the backend should implement to support the AI Health Dashboard.

## Base URL
```
http://localhost:3001
```

## Authentication
All endpoints (except login/register) require authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

## Health Endpoints

### Get Health Metrics
```
GET /health/metrics
```
**Response:**
```json
{
  "heartRate": 72,
  "bloodPressure": "120/80",
  "weight": 70,
  "steps": 8432,
  "sleepHours": 7.5,
  "waterIntake": 2.1
}
```

### Update Health Metrics
```
PUT /health/metrics
```
**Request Body:**
```json
{
  "heartRate": 72,
  "bloodPressure": "120/80",
  "weight": 70,
  "steps": 8432,
  "sleepHours": 7.5,
  "waterIntake": 2.1
}
```

### Get Symptoms
```
GET /health/symptoms
```
**Response:**
```json
[
  {
    "id": 1,
    "symptom": "Headache",
    "severity": "mild",
    "date": "2025-07-29"
  }
]
```

### Add Symptom
```
POST /health/symptoms
```
**Request Body:**
```json
{
  "symptom": "Headache",
  "severity": "mild",
  "date": "2025-07-29"
}
```

### Get Appointments
```
GET /health/appointments
```
**Response:**
```json
[
  {
    "id": 1,
    "doctor": "Dr. Smith",
    "specialty": "Cardiology",
    "date": "2025-08-02",
    "time": "10:00 AM"
  }
]
```

### Create Appointment
```
POST /health/appointments
```
**Request Body:**
```json
{
  "doctor": "Dr. Smith",
  "specialty": "Cardiology",
  "date": "2025-08-02",
  "time": "10:00 AM"
}
```

### Get AI Recommendations
```
GET /health/ai-recommendations
```
**Response:**
```json
[
  "Consider increasing your water intake to 3L per day",
  "Your sleep pattern is excellent - keep it up!",
  "Based on your symptoms, consider scheduling a check-up"
]
```

### Get AI Diagnosis
```
POST /health/ai-diagnosis
```
**Request Body:**
```json
{
  "symptoms": ["headache", "fatigue", "nausea"]
}
```
**Response:**
```json
{
  "message": "Based on your symptoms, please consult with a healthcare professional for proper evaluation.",
  "recommendations": [
    "Schedule an appointment with your healthcare provider",
    "Monitor your symptoms and note any changes",
    "Rest and stay hydrated"
  ],
  "urgency": "medium"
}
```

**Urgency Levels:**
- `low`: Minor symptoms, routine care recommended
- `medium`: Moderate symptoms, medical consultation advised
- `high`: Severe symptoms, immediate medical attention required

### Get Health Score
```
GET /health/score
```
**Response:**
```json
{
  "score": 85,
  "status": "Good Health"
}
```

### Generate Health Report
```
GET /health/report
```
**Response:**
```json
{
  "reportId": "12345",
  "downloadUrl": "/downloads/health-report-12345.pdf",
  "message": "Health report generated successfully"
}
```

### Find Nearby Clinics
```
POST /health/nearby-clinics
```
**Request Body:**
```json
{
  "location": "current"
}
```
**Response:**
```json
[
  {
    "id": 1,
    "name": "City Medical Center",
    "address": "123 Main St",
    "distance": "0.5 miles",
    "rating": 4.5
  }
]
```

## User Endpoints

### Get User Profile
```
GET /user/profile
```
**Response:**
```json
{
  "id": 1,
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com"
}
```

### Update User Profile
```
PUT /user/profile
```
**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com"
}
```

## Authentication Endpoints

### Login (Already implemented)
```
POST /login
```
**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

### Register
```
POST /register
```
**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "user@example.com",
  "password": "password123"
}
```

## Error Responses

All endpoints should return appropriate HTTP status codes and error messages:

```json
{
  "error": "Error message here",
  "status": 400
}
```

Common status codes:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error
