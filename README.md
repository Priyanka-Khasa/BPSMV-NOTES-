# BPSMV Resource Hub 🎓

A professional, responsive university resource hub for BPSMV students. Upload, discover, and discuss subject-wise PDFs, notes, links, and previous year question papers.

![Status](https://img.shields.io/badge/status-in%20development-yellow)
![Frontend](https://img.shields.io/badge/frontend-React%2019%20%2B%20Tailwind-61DAFB)
![Backend](https://img.shields.io/badge/backend-Node.js%20%2B%20Express-339933)
![Database](https://img.shields.io/badge/database-MongoDB-47A248)
![License](https://img.shields.io/badge/license-MIT-blue)

## 🚀 Features

- **Dual Authentication**: Google OAuth OR email/password login.
- **Guest Mode**: One-click "Enter as Guest" — no registration needed.
- **Personalized Dashboard**: Filters subjects by your degree and branch.
- **Resource Explorer**: Search & filter by degree, branch, semester, year, type, and subject.
- **Upload System**: Upload PDF notes, question papers, external links, and syllabi.
- **PDF Viewer**: Clean, responsive iframe preview with download capability.
- **Subject Discussion Board**: Public chat/comments for every subject.
- **Admin Panel**: Moderate resources (admin role).
- **Fully Responsive**: Mobile, tablet, laptop, and desktop.
- **Modern Light Theme**: Professional UI with Tailwind CSS.

## 🛠️ Tech Stack

| Layer | Stack |
|---|---|
| Frontend | React.js 19 (Vite), React Router, Tailwind CSS, Lucide React |
| Backend | Node.js, Express.js, Passport.js, JWT, bcryptjs |
| Database | MongoDB (Mongoose ODM) |
| File Storage | Local disk (`server/uploads/`) — no Cloudinary required |

## 📂 Project Structure

```text
bpsmv-resource-hub/
├── client/                  # React Frontend (Vite)
│   ├── src/
│   │   ├── components/      # Navbar, Layout, ProtectedRoute
│   │   ├── context/         # AuthContext (global auth state)
│   │   ├── pages/           # All pages
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Onboarding.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Resources.jsx
│   │   │   ├── UploadPage.jsx
│   │   │   ├── PDFViewer.jsx
│   │   │   ├── Chat.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── Admin.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css        # Tailwind + custom theme
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── server/                  # Node/Express Backend
│   ├── src/
│   │   ├── config/          # DB, Passport, Local Storage
│   │   ├── models/          # User, Resource, Subject, Comment
│   │   ├── routes/          # Auth, Resources, Comments
│   │   └── app.js           # Server entry point
│   ├── uploads/             # Local file storage
│   ├── .env
│   ├── package.json
│   ├── seedSubjects.js      # Seed database with subjects
│   └── fixDB.js             # Fix MongoDB index issues
```

## ⚙️ Environment Setup

Create a `.env` file inside `server/` (if not already present):

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/bpsmv-resource-hub
JWT_SECRET=your_jwt_secret_here
CLIENT_URL=http://localhost:5173

# Optional — only if you have valid Google OAuth credentials
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SESSION_SECRET=your_session_secret_here
```

> **Note**: Google OAuth is **optional**. The app works fully with email/password, guest mode, and local file storage.

## 💻 How to Run Locally

### Prerequisites
- Node.js (v18+)
- MongoDB running locally or MongoDB Atlas URI

### 1. Backend Setup
```bash
cd bpsmv-resource-hub/server
npm install
```

Ensure MongoDB is running, then start the server:
```bash
node src/app.js
```

Server will run on `http://localhost:5000`.

### 2. Fix MongoDB Indexes (If registration fails)
If you see "Server error during registration", run:
```bash
node fixDB.js
```
Then restart the server.

### 3. Seed Subjects (First Time Only)
```bash
node seedSubjects.js
```

### 4. Frontend Setup
```bash
cd bpsmv-resource-hub/client
npm install
npm run dev
```

Frontend will run on `http://localhost:5173`.

### 5. Create an Admin User (Optional)
After signing up via email or guest mode, manually update the user's role in MongoDB:
```js
db.users.updateOne({ email: "your@email.com" }, { $set: { role: "admin" } })
```

## 🎨 Design System

- **Background**: `#f8fafc` (slate-50)
- **Headings/Text**: `#111827` (slate-900) / `#1e293b` (slate-800)
- **Primary Accent**: `#2563eb` (brand-600)
- **Cards**: White with subtle border and shadow
- **Font**: Inter (body) + Outfit (headings)

## 🔐 Auth & Security

- JWT tokens stored in HTTP-only cookies
- Passwords hashed with bcryptjs
- All upload/delete/comment routes protected
- Ownership checks before delete operations
- Only uploader or admin can delete a resource
- Only comment owner or admin can delete a comment
- Guest accounts are real users with auto-generated credentials

## 📄 API Endpoints

### Auth
- `GET /api/auth/google` — Initiate Google Login (optional)
- `GET /api/auth/google/callback` — Google Callback (optional)
- `POST /api/auth/register` — Email Register
- `POST /api/auth/login` — Email Login
- `POST /api/auth/logout` — Logout
- `GET /api/auth/me` — Get current user
- `POST /api/auth/onboard` — Complete onboarding
- `PUT /api/auth/profile` — Update profile

### Resources
- `GET /api/resources/all` — List all resources (with search/filter)
- `GET /api/resources/subjects` — List subjects
- `GET /api/resources/filter-options` — Get degrees/branches for filters
- `GET /api/resources/subject/:id` — Get resources for a subject
- `GET /api/resources/:id` — Get single resource
- `POST /api/resources/add` — Upload resource (auth + file upload)
- `DELETE /api/resources/:id` — Delete resource (auth + ownership check)

### Comments
- `GET /api/comments/:subjectId` — Get comments for a subject
- `POST /api/comments/:subjectId` — Add comment (auth)
- `DELETE /api/comments/:id` — Delete comment (auth + ownership check)

## 🗺️ Roadmap

- [ ] Re-enable Google OAuth for production
- [ ] Admin view for managing subjects/resources without direct DB access
- [ ] Pagination for subjects/resources at scale
- [ ] File preview before download (PDF/image inline viewer)

## 🤝 Contributing

This is currently an academic project. Issues and suggestions are welcome.

## 📄 License

MIT — free to use and adapt with attribution.

*Developed for BPSMV University Students.*
