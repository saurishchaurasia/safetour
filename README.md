# SafeTour AI

Production-ready full-stack web and mobile-compatible application inspired by the Smart Tourist Safety Monitoring & Incident Response System.

Theme:

> Smart Tourist Safety Monitoring & Incident Response System using AI, Geo-Fencing, Real-time Communication, and Digital Tourist Identity.

## Tech Stack

Frontend:
- React.js + Vite
- Tailwind CSS
- React Router
- Axios
- Leaflet + OpenStreetMap
- Socket.IO client
- React Hot Toast
- Framer Motion
- QR code generation

Backend:
- Node.js + Express.js
- MongoDB + Mongoose
- JWT authentication
- bcrypt password hashing
- Socket.IO realtime events
- Twilio SMS adapter
- Nodemailer email adapter
- Zod input validation
- Helmet, CORS, rate limiting

## Project Structure

```text
frontend/
  src/
    api/
    components/
    context/
    hooks/
    pages/
backend/
  src/
    config/
    controllers/
    middleware/
    models/
    routes/
    services/
    utils/
docs/
  API.md
  DEPLOYMENT.md
mobile/
shared/
docker/
```

The old static prototype files are still at the repository root, but the full-stack project lives in `frontend/` and `backend/`.

## Features

- Digital Tourist ID with generated `TID...`, QR payload, temporary validity, hotel details, itinerary, blood group, and blockchain hash mock.
- Signup, login, JWT session handling, forgot password flow, bcrypt password hashing, and role-based APIs.
- Live GPS capture, continuous location updates, Leaflet/OpenStreetMap, danger zones, safe zones, and AI heatmap overlays.
- AI danger heatmap score using historical incidents, user reports, tourist ratings, SOS count, and time-of-day weighting.
- SOS center with countdown, false-alarm cancel, notification adapters, admin broadcasts, and tourist volunteer network model.
- Emergency contacts CRUD with primary contact support.
- Nearby hospitals, police stations, fire stations, shelters, pharmacies, hotels, ATMs, and tourist recommendations.
- Verified tourist-only reviews with safety, cleanliness, crowd, scam risk, hospitality, trust score, and fake-review heuristic.
- AI safety assistant chatbot with OpenAI integration placeholder.
- Realtime Socket.IO alerts for nearby danger and admin SOS events.
- Admin dashboard with active tourists, SOS events, danger zones, analytics, density-ready location feeds.
- Optional trip sharing, check-in settings, mock facial verification, and mobile app placeholder.
- Dark futuristic glassmorphism UI, responsive dashboard, loading states, toast notifications, and animated landing page.

## Local Setup

Install dependencies in both folders:

```powershell
cd backend
npm install
copy .env.example .env

cd ..\frontend
npm install
copy .env.example .env
```

Start MongoDB locally, then edit `backend/.env`:

```env
MONGO_URI=mongodb://127.0.0.1:27017/safetour-ai
JWT_SECRET=use-a-long-random-secret
CLIENT_URL=http://localhost:5173
```

Run the backend:

```powershell
cd backend
npm run dev
```

Run the frontend:

```powershell
cd frontend
npm run dev
```

Open:

```text
http://localhost:5173
```

## Notifications

Email and SMS are optional in development. If SMTP or Twilio credentials are missing, the backend logs dry-run messages instead of failing.

To enable SMS:

```env
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

To enable email:

```env
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM="SafeTrail <alerts@example.com>"
```

## API Documentation

See [docs/API.md](docs/API.md).

## Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Docker

```powershell
copy backend\.env.example backend\.env
docker compose up --build
```

Frontend: `http://localhost:5173`

Backend: `http://localhost:5000`

## Notes

For production, use HTTPS. Browser geolocation, secure JWT handling, and notification permissions work best on secure origins. Add a background worker or scheduled job for automatic check-in timeout SOS escalation.
