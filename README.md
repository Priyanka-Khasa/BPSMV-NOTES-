<div align="center">
  <img src="client/public/vite.svg" alt="BPSMV Resource Hub logo" width="96" />

  # BPSMV Resource Hub

  <p>
    A cinematic, responsive university resource hub for BPSMV students.
  </p>

  ![Status](https://img.shields.io/badge/status-in%20development-yellow)
  ![Frontend](https://img.shields.io/badge/frontend-React%2019%20%2B%20Tailwind-61DAFB)
  ![Backend](https://img.shields.io/badge/backend-Node.js%20%2B%20Express-339933)
  ![Database](https://img.shields.io/badge/database-MongoDB-47A248)
  ![License](https://img.shields.io/badge/license-MIT-blue)
</div>

Students can upload, discover, view, and discuss subject-wise PDFs, notes, links, syllabi, and previous year question papers in one clean academic workspace.

## Features

- Dual authentication with Google OAuth or email/password login.
- Guest mode for quick access without registration.
- Personalized dashboard filtered by degree and branch.
- Resource explorer with search and filters for degree, branch, semester, year, type, and subject.
- Upload system for PDFs, notes, question papers, external links, and syllabi.
- PDF viewer with preview and download support.
- Subject discussion board for student comments.
- Student reviews with one review allowed per person.
- Gift section for reporting real bugs and genuine issues.
- Accepted genuine issues are eligible for a Rs. 10 gift.
- Gift submissions are saved and emailed to `priyankakhasa937@gmail.com`.
- Admin panel for resource moderation.
- Fully responsive layout for mobile, tablet, laptop, and desktop.
- Premium logo-led landing page with interactive book motion, smooth scrolling, and responsive storytelling.

## Tech Stack

| Layer | Stack |
|---|---|
| Frontend | React 19, Vite, React Router, Tailwind CSS, GSAP, Lenis, Framer Motion, Lucide React |
| Backend | Node.js, Express.js, Passport.js, JWT, bcryptjs, Nodemailer |
| Database | MongoDB with Mongoose |
| File Storage | Local disk in `server/uploads/` |

## Project Structure

```text
bpsmv-resource-hub/
|-- client/
|   |-- src/
|   |   |-- components/
|   |   |-- context/
|   |   |-- pages/
|   |   |   |-- Admin.jsx
|   |   |   |-- Chat.jsx
|   |   |   |-- Dashboard.jsx
|   |   |   |-- Gift.jsx
|   |   |   |-- Home.jsx
|   |   |   |-- Login.jsx
|   |   |   |-- Onboarding.jsx
|   |   |   |-- PDFViewer.jsx
|   |   |   |-- Profile.jsx
|   |   |   |-- Resources.jsx
|   |   |   |-- UploadPage.jsx
|   |   |-- App.jsx
|   |   |-- main.jsx
|   |   |-- index.css
|   |-- package.json
|   |-- tailwind.config.js
|
|-- server/
|   |-- src/
|   |   |-- config/
|   |   |-- models/
|   |   |-- routes/
|   |   |-- app.js
|   |-- uploads/
|   |-- package.json
|   |-- seedSubjects.js
|   |-- fixDB.js
```

## Environment Setup

Create a `.env` file inside `server/`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/bpsmv-resource-hub
JWT_SECRET=your_jwt_secret_here
CLIENT_URL=http://localhost:5173

# Gift submission email destination
ADMIN_EMAIL=priyankakhasa937@gmail.com

# Required for real email delivery
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_sender_email@gmail.com
SMTP_PASS=your_app_password

# Optional Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SESSION_SECRET=your_session_secret_here
```

If SMTP credentials are not configured, Gift submissions are still saved in MongoDB and the email content is printed in the server console.

## Run Locally

### Backend

```bash
cd bpsmv-resource-hub/server
npm install
node src/app.js
```

The backend runs on `http://localhost:5000`.

### Frontend

```bash
cd bpsmv-resource-hub/client
npm install
npm run dev
```

The frontend runs on `http://localhost:5173`.

### Seed Subjects

Run this once after the database is connected:

```bash
cd bpsmv-resource-hub/server
node seedSubjects.js
```

### Fix MongoDB Indexes

If registration fails because of an old index, run:

```bash
cd bpsmv-resource-hub/server
node fixDB.js
```

## API Endpoints

### Auth

- `GET /api/auth/google` - Start Google login.
- `GET /api/auth/google/callback` - Google login callback.
- `POST /api/auth/register` - Register with email and password.
- `POST /api/auth/login` - Log in with email and password.
- `POST /api/auth/logout` - Log out.
- `GET /api/auth/me` - Get the current user.
- `POST /api/auth/onboard` - Complete onboarding.
- `PUT /api/auth/profile` - Update profile.

### Resources

- `GET /api/resources/all` - List resources with search and filters.
- `GET /api/resources/subjects` - List subjects.
- `GET /api/resources/filter-options` - Get degree and branch filter options.
- `GET /api/resources/subject/:id` - Get resources for a subject.
- `GET /api/resources/:id` - Get one resource.
- `POST /api/resources/add` - Upload a resource.
- `DELETE /api/resources/:id` - Delete a resource.

### Comments

- `GET /api/comments/:subjectId` - Get comments for a subject.
- `POST /api/comments/:subjectId` - Add a comment.
- `DELETE /api/comments/:id` - Delete a comment.

### Reviews

- `GET /api/reviews/approved` - Show approved student reviews.
- `POST /api/reviews` - Submit one review per person. After submission, the form is hidden and the student can see their own review with other reviews.

### Gift

- `POST /api/feedback` - Submit Gift issue report data with a required screenshot. Accepted genuine bugs or issues are eligible for a Rs. 10 gift. The submission is stored in MongoDB and emailed to `ADMIN_EMAIL`, which defaults to `priyankakhasa937@gmail.com`.

## Auth & Security

- Passwords are hashed with bcryptjs.
- JWT tokens are stored in HTTP-only cookies.
- Upload, delete, and comment routes are protected where needed.
- Resource deletion checks ownership or admin role.
- Guest accounts are real users with generated credentials.

## Roadmap

- [x] Authentication system.
- [x] Google OAuth with duplicate account prevention.
- [x] Guest mode.
- [x] Resource upload and viewer.
- [x] Subject discussion board.
- [x] Gift form for genuine bugs/issues, with Rs. 10 reward messaging.
- [ ] Admin view for managing subjects without direct database access.
- [ ] Pagination for subjects and resources at scale.
- [ ] Real-time chat.

## License

MIT - free to use and adapt with attribution.

Developed for BPSMV University students.
