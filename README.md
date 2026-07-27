<div align="center">
  <img src="client/public/assets/image4.jpeg" alt="Student studying with notes and laptop" width="260" />

  # BPSMV Resource Hub

  A student-first hub for BPSMV notes, previous year papers, discussions, career updates,
  profiles, and shared academic resources.

  <p>
    <img alt="Frontend" src="https://img.shields.io/badge/frontend-React%2019%20%2B%20Vite-61dafb" />
    <img alt="Backend" src="https://img.shields.io/badge/backend-Node.js%20%2B%20Express-339933" />
    <img alt="Database" src="https://img.shields.io/badge/database-MongoDB-47a248" />
    <img alt="Made for" src="https://img.shields.io/badge/made%20for-BPSMV%20students-c17a5c" />
  </p>
</div>

## Overview

BPSMV Resource Hub helps students find and share academic material without digging through old chats, scattered drives, and random links.

Students can browse resources by degree, branch, semester, subject, and type; upload notes or question papers; discuss subject doubts; track career opportunities; and maintain a student profile.

## Features

- Academic resource library for notes, PYQs, syllabi, PDFs, images, and external links.
- Personalized dashboard based on degree, branch, year, and semester.
- Subject-wise discussion rooms with text and voice comments.
- Student profiles with avatar, bio, social links, CGPA, and activity history.
- Career updates for jobs, internships, scholarships, hiring challenges, and useful portals.
- Admin moderation for resources and reviews.
- Gift issue reporting with required screenshot upload.
- Razorpay access payments with server-side amount and signature verification.
- Durable Cloudinary uploads for production.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite, React Router, Tailwind CSS |
| UI | GSAP, Lenis, Framer Motion, Lucide React |
| Backend | Node.js, Express 5 |
| Database | MongoDB, Mongoose |
| Auth | JWT cookies, Passport Google OAuth, bcryptjs |
| Uploads | Multer, Cloudinary |
| Payments | Razorpay |
| Email | Nodemailer SMTP, optional Resend for Gift emails |
| Deployment | Vercel frontend, Render backend |

## Project Structure

```text
bpsmv-resource-hub/
|-- client/
|   |-- public/
|   |-- src/
|   |   |-- components/
|   |   |-- context/
|   |   |-- hooks/
|   |   |-- pages/
|   |   |-- utils/
|-- server/
|   |-- src/
|   |   |-- config/
|   |   |-- models/
|   |   |-- routes/
|   |   |-- utils/
|   |   |-- app.js
|   |-- .env.example
|-- render.yaml
|-- vercel.json
|-- package.json
|-- README.md
```

## Getting Started

Install dependencies:

```bash
npm run install:client
npm run install:server
```

Create `server/.env` from `server/.env.example`:

```env
MONGO_URI=mongodb://localhost:27017/bpsmv
JWT_SECRET=replace_with_a_strong_secret
CLIENT_URL=http://localhost:5173
CLIENT_URLS=http://localhost:5173
API_URL=http://localhost:5000
COOKIE_SAME_SITE=lax

ADMIN_EMAIL=priyankakhasa937@gmail.com

SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=priyankakhasa937@gmail.com
SMTP_PASS=your_gmail_app_password
SMTP_FROM=BPSMV Hub <priyankakhasa937@gmail.com>
DISABLE_RESEND=true

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_separate_webhook_secret

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

NODE_ENV=development
PORT=5000
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Run the backend:

```bash
cd server
npm start
```

Run the frontend:

```bash
cd client
npm run dev
```

Frontend: `http://localhost:5173`  
Backend health check: `http://localhost:5000/api/health`

## Useful Scripts

```bash
# Build frontend
cd client
npm run build

# Run backend tests
cd server
npm test

# Seed subjects manually
cd server
node seedSubjects.js

# Fix old MongoDB indexes if registration fails
cd server
node fixDB.js
```

## Main Routes

| Route | Purpose |
| --- | --- |
| `/` | Landing page |
| `/login` | Login, signup, Google sign-in |
| `/onboarding` | Academic profile setup |
| `/subscribe` | Access payment checkout |
| `/dashboard` | Personalized study dashboard |
| `/resources` | Resource search and browsing |
| `/viewer/:id` | Protected PDF/image viewer |
| `/chat` | Subject discussions |
| `/jobs` | Career updates |
| `/upload` | Resource upload |
| `/profile` | Student profile |
| `/u/:id` | Shareable student profile |
| `/gift` | Issue reporting |
| `/admin` | Admin moderation |

## API Summary

| Area | Endpoints |
| --- | --- |
| Auth | Register, login, logout, Google OAuth, onboarding, profile, avatar, guest login |
| Payments | Config, status, order creation, checkout verification, webhook |
| Resources | Stats, list, filters, subjects, details, file stream, upload, delete |
| Comments | List, text comment, voice comment, delete |
| Jobs | List, create, delete career updates |
| Reviews | Approved reviews, submit review, admin approve/delete |
| Activity | Personal stats, job application activity |
| Feedback | Gift issue submission with screenshot |

## Security Notes

- Passwords are hashed with bcryptjs.
- JWT sessions use HTTP-only cookies.
- Only the newest active login session remains valid.
- Razorpay checkout and webhook signatures are verified.
- Uploads use Cloudinary in production so files survive Render restarts.
- Resource upload, comment, feedback, guest login, and public auth routes are rate limited.
- Search input is escaped before MongoDB regex filters are built.
- Helmet adds baseline HTTP security headers.
- Unapproved resources are restricted to owner/admin access.
- Public profile lookup is rate limited and returns only share-safe profile/activity fields.
- Production startup rejects missing or weak critical configuration.

## Deployment Notes

- Frontend is configured for Vercel through `vercel.json`.
- Backend is configured for Render through `render.yaml`.
- Set production environment variables in the hosting dashboards, never in public code.
- Cloudinary credentials are required in production for PDFs, avatars, screenshots, and voice comments.
- Use strong `JWT_SECRET`, `SESSION_SECRET`, Razorpay secrets, and MongoDB credentials.
- Configure Razorpay webhook at `https://YOUR_API_DOMAIN/api/payments/webhook`.
- Render free services can sleep after inactivity, so the first request after idle may be slow.

## Contributing

Students can help by uploading clean notes, adding PYQs, sharing useful links, answering doubts, posting genuine career updates, and reporting issues through the Gift page.

For code changes, keep pull requests focused, test backend/frontend changes, and never commit `.env`, logs, uploads, or generated build folders.

## License

Add a license file before public distribution.

## Credits

Built for BPSMV students: study faster, share better, and keep useful academic material easy to find.
