# SafeTour AI API Documentation

Base URL:

```text
http://localhost:5000/api
```

Private endpoints require:

```http
Authorization: Bearer <jwt>
```

## Authentication

### POST `/auth/signup`

```json
{
  "name": "Aarav Mehta",
  "email": "aarav@example.com",
  "phone": "+919000011111",
  "password": "password123"
}
```

Returns:

```json
{
  "token": "jwt",
  "user": {}
}
```

### POST `/auth/login`

```json
{
  "email": "aarav@example.com",
  "password": "password123"
}
```

### GET `/auth/me`

Returns current user.

### POST `/auth/forgot-password`

```json
{
  "email": "aarav@example.com"
}
```

### POST `/auth/reset-password`

```json
{
  "token": "reset-token",
  "password": "newpassword123"
}
```

## Users

### PATCH `/users/me`

Updates profile, trip settings, and preferences.

```json
{
  "name": "Aarav Mehta",
  "phone": "+919000011111",
  "tripStatus": {
    "sharingEnabled": true,
    "currentCity": "Delhi",
    "checkInEnabled": true,
    "checkInMinutes": 30
  },
  "preferences": {
    "darkMode": false,
    "loudAlarm": true,
    "pushNotifications": true
  }
}
```

### POST `/users/me/check-in`

Confirms tourist safety and schedules the next check-in due time.

### GET `/users`

Admin only. Lists users.

## Contacts

### GET `/contacts`

Lists current user's trusted contacts.

### POST `/contacts`

```json
{
  "name": "Priya Mehta",
  "phone": "+919999988888",
  "email": "priya@example.com",
  "relationship": "Family",
  "isPrimary": true
}
```

### PATCH `/contacts/:id`

Partial update.

### DELETE `/contacts/:id`

Deletes a contact.

## Location

### POST `/locations`

Stores the latest GPS update and checks active alerts nearby.

```json
{
  "latitude": 28.6139,
  "longitude": 77.209,
  "accuracy": 12,
  "addressLabel": "India Gate",
  "source": "gps"
}
```

### GET `/locations/latest`

Latest location for current user.

### GET `/locations/history`

Recent location history.

## Emergencies

### POST `/emergencies/sos`

Creates an SOS event, saves it in MongoDB, sends SMS/email notifications, and emits a Socket.IO admin event.

```json
{
  "message": "Emergency assistance requested",
  "alarmEnabled": true,
  "location": {
    "latitude": 28.6139,
    "longitude": 77.209,
    "accuracy": 12,
    "addressLabel": "India Gate"
  }
}
```

### GET `/emergencies/mine`

Lists current user's emergency events.

### PATCH `/emergencies/:id/status`

Admin only.

```json
{
  "status": "resolved"
}
```

## Alerts

### GET `/alerts`

Lists active danger alerts.

### GET `/alerts/nearby?latitude=28.6139&longitude=77.209`

Lists active alerts within their configured radius.

### POST `/alerts`

Admin only.

```json
{
  "title": "Pickpocketing reports near market",
  "message": "Use main roads and avoid isolated exits.",
  "category": "crime",
  "severity": "high",
  "location": {
    "latitude": 28.6139,
    "longitude": 77.209,
    "radiusMeters": 1200
  }
}
```

### PATCH `/alerts/:id/deactivate`

Admin only.

## Notifications

### POST `/notifications/send`

Sends email or SMS through configured providers.

```json
{
  "channel": "email",
  "to": "family@example.com",
  "subject": "Trip status",
  "message": "Aarav checked in safely."
}
```

## Admin

### GET `/admin/dashboard`

Admin metrics, recent locations, and event status analytics.

### GET `/admin/emergencies`

Admin emergency event list.

## Digital Tourist Profile

### GET `/tourist-profiles/me`

Returns the current tourist's digital identity profile.

### PUT `/tourist-profiles/me`

Creates or updates the profile and auto-generates a Tourist ID.

```json
{
  "nationality": "Indian",
  "identityType": "passport",
  "identityNumber": "P1234567",
  "bloodGroup": "O+",
  "hotel": {
    "name": "SafeStay Hotel",
    "address": "Central Tourist District",
    "phone": "011-1111-2222"
  },
  "itinerary": [
    {
      "place": "Heritage Fort",
      "city": "Delhi",
      "startsAt": "2026-05-22T09:00:00.000Z",
      "endsAt": "2026-05-22T12:00:00.000Z",
      "notes": "Morning visit"
    }
  ],
  "travelStart": "2026-05-21T09:00:00.000Z",
  "travelEnd": "2026-05-27T18:00:00.000Z"
}
```

### POST `/tourist-profiles/me/facial-verification`

Completes mock facial verification and raises tourist trust score.

## Heatmap

### GET `/heatmap`

Returns AI danger heatmap points.

### POST `/heatmap/seed-demo`

Admin only. Seeds demo danger zones and matching alerts.

## Reviews

### GET `/reviews`

Lists tourist reviews. Supports `?placeId=`.

### GET `/reviews/stats`

Returns aggregated safe-place review stats.

### POST `/reviews`

Verified tourist-only review endpoint.

```json
{
  "placeId": "fort-001",
  "placeName": "Sunrise Fort Museum",
  "category": "monument",
  "safety": 5,
  "cleanliness": 4,
  "crowd": 3,
  "scamRisk": 2,
  "hospitality": 5,
  "comment": "Safe and well managed."
}
```

## Recommendations

### GET `/recommendations`

Query params:

- `latitude`
- `longitude`
- `category`
- `budget`
- `openNow=true`

Returns AI-ranked suggestions.

### GET `/recommendations/emergency-services`

Returns nearby hospitals, police, fire, ambulance/shelter-style services.

## AI Assistant

### GET `/chat`

Returns chat history.

### POST `/chat`

```json
{
  "message": "Suggest a safe route to my hotel"
}
```

Uses a deterministic local assistant response and marks the OpenAI API integration point.

## SOS Tourist Network

### POST `/sos-network/:id/accept`

Nearby tourist accepts a help request as a volunteer responder.

## Socket.IO Events

Client emits:

- `join:user` with user id
- `join:admin`

Server emits:

- `location:update` to admins
- `alert:nearby` to users
- `emergency:new` to admins
- `alert:new` to admins
