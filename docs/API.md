# API Map

The backend exposes routes under `/api`.

## Public Routes

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/health` | `GET` | Backend health check. |
| `/api/resources/public/stats` | `GET` | Public resource statistics for the landing page. |
| `/api/reviews/approved` | `GET` | Approved public reviews. |
| `/api/activity/public/:id` | `GET` | Share-safe public activity summary. |
| `/api/feedback` | `POST` | Gift issue report submission. |

## Auth And Account

| Area | Purpose |
| --- | --- |
| Auth | Register, login, logout, guest login, Google OAuth, and profile session handling. |
| Onboarding | Stores degree, branch, year, and semester. |
| Profile | Updates avatar, bio, academic details, links, and public profile data. |

## Protected Student Features

| Area | Purpose |
| --- | --- |
| Resources | Search, filter, view, upload, and manage academic resources. |
| Comments | Text and voice comments for subject discussions. |
| Jobs | Career updates for jobs, internships, scholarships, and challenges. |
| Activity | Personal contribution and application activity. |

## Admin Features

| Area | Purpose |
| --- | --- |
| Resources | Moderate uploaded resources. |
| Reviews | Approve or delete student reviews. |
| Jobs | Create or delete career updates. |

## Payment Routes

Payment access uses Razorpay order creation, checkout verification, subscription status checks, and webhook verification. Keep webhook secrets separate from checkout secrets.
