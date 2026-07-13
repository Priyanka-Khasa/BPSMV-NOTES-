<div align="center">
  <img src="client/public/assets/image3.png" alt="BPSMV Resource Hub preview" width="760" />

  # BPSMV Resource Hub

  <p>
    A beautiful academic resource hub where BPSMV students can find notes, previous year papers,
    syllabi, discussions, career updates, profiles, and shared study material in one place.
  </p>

  <p>
    <img alt="Status" src="https://img.shields.io/badge/status-active%20development-f5a524" />
    <img alt="Frontend" src="https://img.shields.io/badge/frontend-React%2019%20%2B%20Vite-61dafb" />
    <img alt="Backend" src="https://img.shields.io/badge/backend-Node.js%20%2B%20Express-339933" />
    <img alt="Database" src="https://img.shields.io/badge/database-MongoDB-47a248" />
    <img alt="Made for" src="https://img.shields.io/badge/made%20for-BPSMV%20students-c17a5c" />
  </p>
</div>

## Why This Exists

Students should not have to search ten WhatsApp groups, old chats, random drives, and half-forgotten links before every exam.

**BPSMV Resource Hub** turns scattered academic material into a calm, searchable, student-powered workspace. It is built for the way students actually study: quick revision, subject-wise browsing, previous year question papers, shared notes, doubts, career links, and a profile that grows with their academic journey.

This project is designed to feel useful from the first click:

- New student? Register, complete onboarding, and see resources for your degree, branch, year, and semester.
- Preparing for exams? Search notes, PYQs, syllabi, PDFs, and links without losing momentum.
- Have good material? Upload it once and help the whole batch.
- Stuck in a subject? Open the discussion room and ask.
- Looking ahead? Track internships, jobs, scholarships, hiring challenges, and common career portals.

## The Student Promise

> One hub. One login. Every useful academic resource closer than your panic search.

BPSMV Resource Hub is not only a file repository. It is a study companion for the whole campus:

- **Before class:** check subject material and useful links.
- **Before exams:** filter notes and question papers by semester, year, subject, and type.
- **After exams:** upload the resources that helped you.
- **During placement prep:** follow shared internships, jobs, scholarships, and challenges.
- **Across semesters:** maintain your academic profile, CGPA history, activity graph, and public student profile.

## Highlights

### Academic Resource Library

- Subject-wise resources for B.Tech, M.Tech, BCA, MCA, BBA, MBA, B.Sc, M.Sc, B.A, M.A, and other programs.
- Degree, branch, year, semester, subject, type, and search filters.
- Resource types: notes, question papers, external links, and syllabi.
- PDF and image upload support.
- In-app PDF viewer with authenticated preview.
- Normal open and download access for uploaded files.
- Grid and table-style browsing for different study habits.

### Personalized Dashboard

- Dashboard adapts to the student's degree, branch, year, and semester.
- Subject readiness view with notes and paper counts.
- Quick upload and discussion actions.
- Focused subject workspace for exam preparation.
- Automatic academic progression logic on profile updates and login checks.

### Student Accounts

- Email and password registration with roll number.
- Optional Google OAuth login.
- Secure HTTP-only JWT cookie sessions.
- Single-device active session protection.
- Onboarding flow for academic details.
- Avatar upload, bio, social links, CGPA tracker, and public profile sharing.

### Discussions

- Subject-wise discussion rooms.
- Text comments.
- Voice messages with preview before sending.
- Emoji support.
- Auto-refreshing message list.
- Admin and owner deletion controls.

### Career Updates

- Shared jobs, internships, scholarships, hiring challenges, and career news.
- Students can post openings for everyone.
- Search and category filters.
- Deadline badges.
- Common portals included:
  - AICTE Internships
  - National Career Service
  - Internshala
  - Unstop
  - LinkedIn fresher jobs
  - TCS NextStep

### Reviews And Trust

- Student review wall on the landing page.
- One review per reviewer.
- Admin moderation for reviews.
- Real API-backed stats for resources, students, subjects, notes, branches, and courses.

### Gift Issue Reporting

- Public Gift page for reporting genuine issues, bugs, content issues, and feature requests.
- Screenshot is required so reports stay useful.
- Accepted genuine issues are eligible for a **Rs. 10 gift**.
- Submissions are stored in MongoDB and can be emailed to the configured admin address.

### Admin Panel

- Admin-only route protection.
- Resource moderation dashboard.
- Review moderation dashboard.
- Status filters, search, counts, approve, and delete actions.

## Experience Walkthrough

1. **Land on the cinematic home page**
   The landing page introduces the hub with animated study-book interactions, live stats, student reviews, and clear entry points.

2. **Create an account**
   Students register with name, email, password, and roll number, or use Google OAuth if configured.

3. **Complete onboarding**
   The app asks for degree, branch, year, and semester so the dashboard can show relevant subjects.

4. **Open the dashboard**
   Students see semester subjects, resource counts, quick upload, discussion access, and subject-specific material.

5. **Browse all resources**
   Search and filter across the full approved resource library.

6. **Preview or download**
   PDFs and images can be opened from the hub. Links open externally.

7. **Discuss subject doubts**
   Students can send text or voice messages in the subject room.

8. **Upload and contribute**
   Notes, question papers, syllabi, images, PDFs, and external links can be shared with the right subject metadata.

9. **Build a profile**
   Students can add CGPA entries, bio, avatar, coding profiles, LinkedIn, portfolio, and more.

10. **Track opportunities**
    The Jobs page keeps shared career updates and useful portals in one place.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite, React Router, Tailwind CSS |
| UI Motion | GSAP, ScrollTrigger, Lenis, Framer Motion |
| Icons | Lucide React |
| API Client | Axios |
| Backend | Node.js, Express 5 |
| Database | MongoDB, Mongoose |
| Auth | JWT cookies, Passport Google OAuth, bcryptjs |
| Uploads | Multer, Cloudinary in production, local fallback for development |
| Email | Nodemailer SMTP, optional Resend |
| Deployment Config | Vercel config, Render blueprint |

## Project Structure

```text
bpsmv-resource-hub/
|-- client/
|   |-- public/
|   |   |-- assets/
|   |-- src/
|   |   |-- components/
|   |   |   |-- ActivityCalendar.jsx
|   |   |   |-- BrandLogo.jsx
|   |   |   |-- Layout.jsx
|   |   |   |-- Navbar.jsx
|   |   |   |-- ProtectedRoute.jsx
|   |   |-- context/
|   |   |   |-- AuthContext.jsx
|   |   |-- hooks/
|   |   |   |-- useScrollAnimation.js
|   |   |-- pages/
|   |   |   |-- Admin.jsx
|   |   |   |-- Chat.jsx
|   |   |   |-- Dashboard.jsx
|   |   |   |-- Gift.jsx
|   |   |   |-- Home.jsx
|   |   |   |-- Jobs.jsx
|   |   |   |-- Login.jsx
|   |   |   |-- Onboarding.jsx
|   |   |   |-- PDFViewer.jsx
|   |   |   |-- Profile.jsx
|   |   |   |-- PublicProfile.jsx
|   |   |   |-- Resources.jsx
|   |   |   |-- UploadPage.jsx
|   |   |-- utils/
|   |   |   |-- academic.js
|   |   |-- App.jsx
|   |   |-- main.jsx
|   |   |-- index.css
|   |-- package.json
|   |-- vite.config.js
|
|-- server/
|   |-- src/
|   |   |-- config/
|   |   |   |-- cloudinary.js
|   |   |   |-- db.js
|   |   |   |-- passport.js
|   |   |   |-- storage.js
|   |   |-- models/
|   |   |   |-- Activity.js
|   |   |   |-- Comment.js
|   |   |   |-- Feedback.js
|   |   |   |-- JobUpdate.js
|   |   |   |-- Resource.js
|   |   |   |-- Review.js
|   |   |   |-- Subject.js
|   |   |   |-- User.js
|   |   |-- routes/
|   |   |   |-- activity.js
|   |   |   |-- auth.js
|   |   |   |-- comments.js
|   |   |   |-- feedback.js
|   |   |   |-- jobUpdates.js
|   |   |   |-- resources.js
|   |   |   |-- reviews.js
|   |   |-- utils/
|   |   |   |-- academicProgression.js
|   |   |   |-- env.js
|   |   |   |-- regex.js
|   |   |-- app.js
|   |-- uploads/
|   |-- .env.example
|   |-- fixDB.js
|   |-- seedSubjects.js
|   |-- package.json
|
|-- render.yaml
|-- vercel.json
|-- package.json
|-- README.md
```

## Getting Started

### Prerequisites

Install these before running the project:

- Node.js 22.x for the backend
- npm
- MongoDB local server or MongoDB Atlas connection string

### 1. Clone And Enter The Project

```bash
git clone <your-repository-url>
cd bpsmv-resource-hub
```

### 2. Install Dependencies

Install frontend and backend packages:

```bash
npm run install:client
npm run install:server
```

Or install manually:

```bash
cd client
npm install

cd ../server
npm install
```

### 3. Configure Backend Environment

Create `server/.env` using `server/.env.example` as a guide:

```env
MONGO_URI=mongodb://localhost:27017/bpsmv
JWT_SECRET=replace_with_a_strong_secret
AUTH_SESSION_DAYS=30
CLIENT_URL=http://localhost:5173
CLIENT_URLS=http://localhost:5173
API_URL=http://localhost:5000
COOKIE_SAME_SITE=lax

ADMIN_EMAIL=admin@example.com

SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your_sender_email@gmail.com
SMTP_PASS=your_app_password
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=BPSMV Hub <noreply@your-verified-domain.com>
EMAIL_TIMEOUT_MS=20000

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

PORT=5000

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_separate_webhook_secret

ENABLE_GUEST_LOGIN=false
NODE_ENV=development
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Notes:

- Email/password login works without Google OAuth.
- Gift submissions are saved even if SMTP is not configured.
- Password reset OTP delivery requires SMTP or Resend in production. In development, missing email credentials are logged to the console for testing.
- For Gmail SMTP on Render, prefer `SMTP_PORT=465` with `SMTP_SECURE=true`; the mail sender also falls back to Gmail 465 if 587 times out.
- Resend testing mode only sends to the Resend account owner's email. To send OTPs to students, verify a domain in Resend and use that domain in `EMAIL_FROM`, or leave `RESEND_API_KEY` unset and use SMTP.
- On Render, add either verified-domain `RESEND_API_KEY`/`EMAIL_FROM` or `SMTP_USER`/`SMTP_PASS`; otherwise forgot-password cannot email OTPs.
- Cloudinary is required in production for durable uploads. Without these credentials, production startup fails so files are not silently saved to Render's ephemeral disk.
- Uploaded PDFs, avatars, screenshots, and voice comments use Cloudinary when configured. Local `server/uploads` storage is only a development fallback.
- In production, always use a strong `JWT_SECRET`.
- `AUTH_SESSION_DAYS` controls how many days users stay logged in. The default is 30.
- Use Razorpay test keys while developing. Never put `RAZORPAY_KEY_SECRET` in the client.
- In Razorpay, configure a webhook for `payment.captured` at `https://YOUR_API_DOMAIN/api/payments/webhook` and use the same `RAZORPAY_WEBHOOK_SECRET`.
- If frontend and backend are hosted on separate domains, configure `CLIENT_URLS` and cookie settings carefully.

### 4. Start The Backend

```bash
cd server
npm start
```

Backend URL:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/api/health
```

### 5. Start The Frontend

Open a second terminal:

```bash
cd client
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

### 6. Seed Subjects

The server checks subject seeding on startup, but you can run it manually:

```bash
cd server
node seedSubjects.js
```

### 7. Fix Old MongoDB Indexes If Needed

If registration fails because of an old unique index, run:

```bash
cd server
node fixDB.js
```

## Frontend Routes

| Route | Purpose |
| --- | --- |
| `/` | Cinematic landing page, stats, reviews, and entry actions |
| `/login` | Login, register, and Google sign-in entry |
| `/onboarding` | Protected academic onboarding |
| `/subscribe` | Rs. 10 monthly or Rs. 50 yearly secure access checkout |
| `/dashboard` | Personalized student study dashboard |
| `/resources` | Full searchable resource explorer |
| `/viewer/:id` | Protected PDF/image resource viewer |
| `/chat` | Subject-wise discussion rooms |
| `/jobs` | Jobs, internships, scholarships, and career updates |
| `/upload` | Dedicated upload page |
| `/profile` | Student profile, CGPA, social links, activity |
| `/u/:id` | Public shareable profile |
| `/gift` | Public issue reporting and gift page |
| `/admin` | Admin moderation panel |

## API Overview

All protected routes use the HTTP-only `token` cookie set during login.

### Auth

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/auth/google` | Start Google OAuth login |
| `GET` | `/api/auth/google/callback` | Google OAuth callback |
| `POST` | `/api/auth/register` | Register with name, email, password, roll number |
| `POST` | `/api/auth/login` | Login with email and password |
| `POST` | `/api/auth/forgot-password` | Send password reset OTP to registered email |
| `POST` | `/api/auth/verify-reset-otp` | Verify password reset OTP |
| `POST` | `/api/auth/reset-password` | Update password using verified OTP |
| `POST` | `/api/auth/logout` | Logout and clear active session |
| `GET` | `/api/auth/me` | Get current user |
| `POST` | `/api/auth/onboard` | Save academic onboarding |
| `PUT` | `/api/auth/profile` | Update profile, social links, and CGPA |
| `POST` | `/api/auth/avatar` | Upload avatar |
| `POST` | `/api/auth/guest` | Guest login when enabled |

### Payments

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/payments/config` | Get public checkout configuration and server-owned plan prices |
| `GET` | `/api/payments/status` | Get the signed-in student's access status |
| `POST` | `/api/payments/order` | Create a Razorpay order for the selected access plan |
| `POST` | `/api/payments/verify` | Verify Razorpay's HMAC signature and activate access |
| `POST` | `/api/payments/webhook` | Process signed Razorpay payment events |

### Resources

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/resources/public/stats` | Public landing-page stats |
| `GET` | `/api/resources/all` | Search and filter approved resources |
| `GET` | `/api/resources/subjects` | Get subjects for the user or filters |
| `GET` | `/api/resources/filter-options` | Get degree and branch filter options |
| `GET` | `/api/resources/subject/:subjectId` | Get resources for one subject |
| `GET` | `/api/resources/:id/file` | Authenticated file preview stream |
| `GET` | `/api/resources/:id` | Get one resource |
| `POST` | `/api/resources/add` | Upload file or link resource |
| `DELETE` | `/api/resources/:id` | Delete resource if owner or admin |

### Comments

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/comments/:subjectId` | Get subject discussion messages |
| `POST` | `/api/comments/:subjectId` | Add text message |
| `POST` | `/api/comments/:subjectId/voice` | Add voice message |
| `DELETE` | `/api/comments/:id` | Delete message if owner or admin |

### Reviews

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/reviews/approved` | Public approved reviews |
| `POST` | `/api/reviews` | Submit student review |
| `GET` | `/api/reviews/all` | Admin review list |
| `PUT` | `/api/reviews/:id/approve` | Admin approve review |
| `DELETE` | `/api/reviews/:id` | Admin delete review |

### Jobs And Career Updates

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/job-updates` | List career updates |
| `POST` | `/api/job-updates` | Add career update |
| `DELETE` | `/api/job-updates/:id` | Delete update if owner or admin |

### Activity

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/activity/me` | Get personal activity stats |
| `POST` | `/api/activity/job-apply/:id` | Record job application activity |

### Gift And Feedback

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/feedback` | Submit issue report with screenshot |

## Data Models

| Model | Purpose |
| --- | --- |
| `User` | Student/admin identity, auth, academic info, subscription status, CGPA, socials, avatar |
| `Payment` | Razorpay order/payment IDs, plan, amount, status, and access dates |
| `Subject` | Degree, branch, year, semester, and subject catalog |
| `Resource` | Notes, papers, syllabi, links, upload metadata |
| `Comment` | Text and voice subject discussions |
| `JobUpdate` | Shared career posts |
| `Review` | Student review wall |
| `Feedback` | Gift issue reports |
| `Activity` | PDF opens, completions, job applications, recent actions |

## Security And Quality Notes

- Passwords are hashed with bcryptjs.
- Password reset uses a hashed 6-digit OTP with expiry, attempt limits, and session invalidation after password change.
- JWTs are stored in HTTP-only cookies.
- Protected routes validate the current session against the database.
- Only the newest login session remains active for an account.
- Monthly and yearly prices are fixed on the server in paise; the browser cannot choose an amount.
- Razorpay checkout responses and webhooks are verified with HMAC-SHA256 signatures.
- Payment records are unique and retained per student for an auditable access history.
- Expired or unpaid students receive `402 SUBSCRIPTION_REQUIRED` before protected APIs run.
- Uploaded files are stored durably in Cloudinary in production and streamed through authenticated, paid-access routes instead of public static hosting.
- Resource deletion requires owner or admin access.
- Admin routes are guarded by role checks.
- Search input is escaped before MongoDB regex filters are created.
- Feedback and guest-login routes are rate limited.
- Resource uploads, text comments, and voice comments are rate limited.
- Helmet sets baseline HTTP security headers.
- Students cannot request unapproved resources through the `isApproved` query filter.
- Direct resource metadata and file routes reject unapproved resources unless the user is the owner or an admin.
- Shareable profile/activity lookup requires login, so profile links work for students without allowing anonymous scraping.
- Legacy local file preview paths are resolved safely inside the upload directory.
- CORS uses configured frontend origins.
- Production startup rejects weak or missing critical configuration.
- Backend tests cover JWT session invalidation helpers and Razorpay signature verification.

## Deployment Notes

This repository includes deployment configuration files:

- `vercel.json` for Vercel-oriented routing/build setup.
- `render.yaml` for Render deployment blueprint setup.

Before deploying:

- Set all backend environment variables in the hosting dashboard.
- Use MongoDB Atlas or another reachable MongoDB service.
- Configure `CLIENT_URL`, `CLIENT_URLS`, and `API_URL` to match deployed domains.
- Use a strong production `JWT_SECRET`.
- Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` in Render before deploying. Render web service filesystems are ephemeral, so PDFs, avatars, screenshots, and voice comments must not rely on `server/uploads` in production.
- Add the live Razorpay keys and webhook secret, then test a real Rs. 10 transaction before launch.
- Keep Razorpay Test Mode and Live Mode credentials separate.
- Confirm uploads work after a redeploy by opening an uploaded PDF/avatar again.
- `render.yaml` currently uses `plan: free`. Render free services can spin down after inactivity, so the first request after idle may feel slow. Upgrade the plan when daily student usage matters.

## Build Commands

Frontend production build:

```bash
cd client
npm run build
```

Root build shortcut:

```bash
npm run build
```

Backend start:

```bash
cd server
npm start
```

## How Students Can Contribute

You can make this hub stronger even without writing code:

- Upload clean notes with clear titles.
- Add previous year question papers with the correct year.
- Share official syllabi and helpful links.
- Answer doubts in subject discussions.
- Post genuine internship or job openings.
- Report bugs through the Gift page with a screenshot.
- Leave a review so new students know the hub is alive.

For code contributions:

1. Create a new branch.
2. Keep changes focused.
3. Test the frontend and backend locally.
4. Avoid committing `.env`, uploaded private files, logs, or generated build folders.
5. Open a pull request with a clear description and screenshots for UI changes.

## Future Ideas

- Admin subject management without direct database scripts.
- Better resource approval workflow.
- Pagination and infinite scroll for very large resource collections.
- Real-time discussion updates with WebSockets.
- Admin tools for cleaning or replacing old uploaded resources.
- Notifications for new subject resources.
- Saved resources and personal study lists.
- AI-powered resource summaries and study planning.

## License

This project is currently marked as private in package metadata. Add a repository license file before public distribution.

## Credits

Built with care for BPSMV students: a place to study faster, share better, and make useful academic material easier to find for everyone.
