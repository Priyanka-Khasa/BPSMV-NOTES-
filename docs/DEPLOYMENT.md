# Deployment Guide

BPSMV Resource Hub is split into a Vercel frontend and a Render backend.

## Frontend

The frontend lives in `client/` and is configured with `client/vercel.json`.

Set this environment variable in Vercel:

```env
VITE_API_URL=https://your-backend-domain.com/api
```

Build command:

```bash
npm run build
```

## Backend

The backend lives in `server/` and is configured for Render with `render.yaml`.

Set production environment variables in the Render dashboard. Do not commit production secrets.

Important production variables:

- `MONGO_URI`
- `JWT_SECRET`
- `CLIENT_URL` or `CLIENT_URLS`
- `API_URL`
- `ADMIN_EMAIL`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- Razorpay keys and webhook secret when payments are enabled

## Post-Deploy Checks

- Visit `/api/health`.
- Test login and logout.
- Confirm CORS allows the deployed frontend.
- Upload a small test resource and confirm it appears through Cloudinary.
- Run a Razorpay test checkout before switching to live keys.
