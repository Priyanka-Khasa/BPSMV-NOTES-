# 🎓 BPSMV Resource Hub

A real-time academic resource platform built for students of **BPSMV** (Bhagat Phool Singh Mahila Vishwavidyalaya University). It gives students a single, centralized place to find previous years' question papers, subject notes, and other study material — filtered automatically by their degree and branch.

![Status](https://img.shields.io/badge/status-in%20development-yellow)
![Frontend](https://img.shields.io/badge/frontend-React%20%2B%20Vite-61DAFB)
![Backend](https://img.shields.io/badge/backend-Node.js%20%2B%20Express-339933)
![Database](https://img.shields.io/badge/database-MongoDB-47A248)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## 🚀 Features

- **Google OAuth integration** — secure login via Gmail accounts *(currently bypassed with a mock user for local development)*
- **Personalized dashboard** — subjects and resources auto-filtered by the student's degree and branch
- **Premium UI** — glassmorphism, dark-mode design system, and subtle micro-animations
- **Resource categorization** — clear tagging for Notes, Question Papers, and Syllabus, with year-based sorting for question papers
- **Scalable data model** — new degrees, branches, and subjects can be added in MongoDB without touching the codebase

---

## 🛠️ Tech Stack

| Layer | Stack |
|---|---|
| Frontend | React.js (Vite), React Router, custom CSS (CSS variables, glassmorphism) |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose ODM) |
| Auth | Passport.js (Google OAuth 2.0), JWT |
| File handling | Multipart uploads (`multer` or equivalent) for notes/papers |

---

## 📂 Project Structure

```text
bpsmv-resource-hub/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── components/     # Reusable UI components (e.g. UploadModal)
│   │   ├── pages/          # Full page views (Dashboard, Login, Onboarding)
│   │   ├── App.jsx         # Main routing
│   │   └── index.css       # Global design system & theme variables
│   └── package.json
│
├── server/                 # Node/Express backend
│   ├── src/
│   │   ├── config/         # DB connection & Passport configuration
│   │   ├── models/         # Mongoose schemas (User, Subject, Resource)
│   │   ├── routes/         # API endpoints (auth, resources)
│   │   └── app.js          # Server entry point
│   └── package.json
│
└── README.md
```

---

## 💻 Running Locally

### Prerequisites

- Node.js v16+
- MongoDB (local instance or a MongoDB Atlas URI)
- A Google Cloud Console project with OAuth 2.0 credentials (only needed once auth is re-enabled)

### 1. Backend

```bash
cd bpsmv-resource-hub/server
npm install
```

Create a `.env` file in `server/`:

```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SESSION_SECRET=your_session_secret
CLIENT_URL=http://localhost:5173
```

Start the server:

```bash
node src/app.js
```

The API will run at `http://localhost:5000`.

### 2. Frontend

In a new terminal:

```bash
cd bpsmv-resource-hub/client
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

> **Note:** Google OAuth is currently bypassed in `Dashboard.jsx` — a mock student user is used automatically if `/api/auth/me` fails, so the dashboard is fully testable without configuring Google credentials.

---

## 📡 Core API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/auth/me` | Returns the currently logged-in user |
| `POST` | `/api/auth/logout` | Logs the user out |
| `GET` | `/api/resources/subjects?degree=&branch=` | Lists subjects for a degree/branch, grouped by semester |
| `GET` | `/api/resources/subject/:subjectId` | Lists resources for a given subject |
| `POST` | `/api/resources/add` | Uploads a new resource (multipart form: title, resourceType, year, subjectId, file) |

---

## 🎨 Design System

The UI is driven by CSS custom properties defined in `client/src/index.css` — colors, spacing, radii, and typography are centralized there so the whole app restyles from one place. Key conventions:

- `.glass-panel` — the shared glassmorphism container style used by the sidebar, modal, and resource cards
- `color-scheme: dark` is set on dark-themed containers (e.g. the upload modal) so native form controls like `<select>` popups render correctly instead of defaulting to light-mode browser chrome
- `.btn-primary` / `.btn-secondary` — shared button variants

---

## 🗺️ Roadmap

- [ ] Re-enable Google OAuth for production
- [ ] Admin view for managing subjects/resources without direct DB access
- [ ] Search and filter within a subject's resource list
- [ ] File preview before download (PDF/image inline viewer)
- [ ] Pagination for subjects/resources at scale

---

## 🤝 Contributing

This is currently a solo academic project. Issues and suggestions are welcome via GitHub Issues.

## 📄 License

MIT — free to use and adapt with attribution.
---
*Developed for BPSMV University Students.*
