# SafeTour AI Deployment Guide

## Backend

Recommended platforms:

- Render
- Railway
- Fly.io
- AWS Elastic Beanstalk
- DigitalOcean App Platform

Steps:

1. Create a MongoDB Atlas cluster.
2. Deploy `backend/` as a Node.js service.
3. Set environment variables from `backend/.env.example`.
4. Use `npm install` as the build command.
5. Use `npm start` as the start command.
6. Enable HTTPS on the deployed domain.

Important production variables:

```env
NODE_ENV=production
MONGO_URI=<MongoDB Atlas URI>
JWT_SECRET=<long random secret>
CLIENT_URL=https://your-frontend-domain.com
```

## Frontend

Recommended platforms:

- Vercel
- Netlify
- Cloudflare Pages
- Render static site

Steps:

1. Deploy `frontend/`.
2. Set `VITE_API_URL` to your backend API URL.
3. Set `VITE_SOCKET_URL` to your backend origin.
4. Build with `npm run build`.
5. Publish the `dist/` directory.

Example:

```env
VITE_API_URL=https://your-api-domain.com/api
VITE_SOCKET_URL=https://your-api-domain.com
```

## Production Security Checklist

- Use HTTPS everywhere.
- Store JWT in a secure strategy appropriate for your deployment. For high-security production, prefer httpOnly cookies.
- Rotate `JWT_SECRET` if leaked.
- Configure CORS to the exact frontend domain.
- Use MongoDB Atlas network rules.
- Add request logging and alerting.
- Use provider webhooks/logs for Twilio and email delivery.
- Add a scheduled worker for missed check-in SOS escalation.
- Add audit logs for admin actions.
- Add moderation for public incident reports.

## Docker Deployment

Local container run:

```powershell
copy backend\.env.example backend\.env
docker compose up --build
```

For cloud deployment, split services:

- MongoDB Atlas for database
- Backend container from `docker/Dockerfile.backend`
- Frontend static container from `docker/Dockerfile.frontend`

## OpenAI Placeholder

The chatbot currently uses local deterministic responses. To integrate OpenAI:

1. Add `OPENAI_API_KEY` in backend environment.
2. Replace `assistantReply` in `backend/src/controllers/chatController.js` with a call to the OpenAI API.
3. Keep emergency guidance constrained and include local emergency numbers.
