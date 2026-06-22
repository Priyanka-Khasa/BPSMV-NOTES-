# BPSMV Resource Hub 🎓

A professional, responsive university resource hub for BPSMV students. Upload, discover, and discuss subject-wise PDFs, notes, links, and previous year question papers.

## 🚀 Features

- **Dual Authentication**: Secure login via Google OAuth OR email/password.
- **Personalized Dashboard**: Automatically filters subjects by your degree and branch.
- **Resource Explorer**: Search and filter all resources by degree, branch, semester, year, and type.
- **Upload System**: Upload PDF notes, question papers, external links, and syllabi.
- **PDF Viewer**: Clean, responsive PDF preview with download capability.
- **Subject Discussion Board**: Public chat/comments for every subject.
- **Admin Panel**: Moderate resources (admin role).
- **Fully Responsive**: Works on mobile, tablet, laptop, and desktop.
- **Modern Light Theme**: Professional UI with Tailwind CSS.

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS, React Router, Lucide React
- **Backend**: Node.js, Express.js, Passport.js (Google OAuth 2.0), JWT, bcryptjs
- **Database**: MongoDB (Mongoose ODM)
- **File Storage**: Cloudinary (PDFs & images)

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
│   │   ├── config/          # DB, Passport, Cloudinary
│   │   ├── models/          # User, Resource, Subject, Comment
│   │   ├── routes/          # Auth, Resources, Comments
│   │   └── app.js           # Server entry point
│   ├── .env
│   ├── package.json
│   └── seedSubjects.js      # Seed database with subjects
```

## ⚙️ Environment Setup

Create a `.env` file inside `server/` (if not already present):

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/bpsmv-resource-hub
JWT_SECRET=your_jwt_secret_here
CLIENT_URL=http://localhost:5173
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SESSION_SECRET=your_session_secret_here

# Cloudinary Storage Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

> **Note**: Replace all placeholder values with your actual credentials. `CLOUDINARY_CLOUD_NAME` should not contain spaces.

## 💻 How to Run Locally

### Prerequisites
- Node.js (v18+)
- MongoDB running locally or MongoDB Atlas URI
- Google Cloud Console Project (for OAuth Credentials)
- Cloudinary Account (for file uploads)

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

### 2. Seed Subjects (First Time Only)
```bash
node seedSubjects.js
```

### 3. Frontend Setup
```bash
cd bpsmv-resource-hub/client
npm install
npm run dev
```

Frontend will run on `http://localhost:5173`.

### 4. Create an Admin User (Optional)
After signing up via email, manually update the user's role in MongoDB:
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

## 📄 API Endpoints

### Auth
- `GET /api/auth/google` — Initiate Google Login
- `GET /api/auth/google/callback` — Google Callback
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

## 📝 License

Developed for BPSMV University Students.
