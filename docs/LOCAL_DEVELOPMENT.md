# Local Development

This guide keeps the local setup steps in one place for contributors working on BPSMV Resource Hub.

## Prerequisites

- Node.js 22 for the backend.
- MongoDB running locally, or a reachable MongoDB Atlas connection string.
- Cloudinary credentials if you want to test durable file uploads.
- Razorpay test keys if you want to test payment flows.

## Install Dependencies

From the project root:

```bash
npm run install:client
npm run install:server
```

## Environment Files

Create `server/.env` from `server/.env.example`.

Create `client/.env` with:

```env
VITE_API_URL=http://localhost:5000/api
```

## Run The App

Start the backend:

```bash
cd server
npm start
```

Start the frontend in another terminal:

```bash
cd client
npm run dev
```

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend health check: `http://localhost:5000/api/health`

## Useful Checks

- Confirm the backend can connect to MongoDB before testing auth, uploads, or payments.
- Use test payment credentials locally.
- Keep real `.env` files, logs, uploaded files, and generated builds out of Git.
