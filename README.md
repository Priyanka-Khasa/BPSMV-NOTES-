# BPSMV Resource Hub 🎓

A professional, real-time web application tailored for students of BPSMV (Bhagat Phool Singh Mahila Vishwavidyalaya) University. This platform serves as a centralized hub for students to access previous years' question papers, subject notes, and other academic resources based on their specific degree and branch.

## 🚀 Features

- **Google OAuth Integration**: Secure, seamless login using university/personal Gmail accounts. *(Currently bypassed for local development testing).*
- **Personalized Dashboard**: Automatically filters and displays subjects and resources relevant to the student's selected Degree and Branch.
- **Premium UI/UX**: Built with a sleek, modern glassmorphism design, dark mode aesthetics, and micro-animations for a highly engaging user experience.
- **Resource Categorization**: Easily distinguish between "Notes" and "Question Papers" with clear tagging and year-based sorting.
- **Scalable Architecture**: Designed with MongoDB to dynamically support an expanding list of degrees, branches, and subjects without changing the core codebase.

## 🛠️ Technology Stack

- **Frontend**: React.js (Vite), React Router, Custom Vanilla CSS (Glassmorphism & CSS Modules approach)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: Passport.js (Google OAuth 2.0), JSON Web Tokens (JWT)

## 📂 Project Structure

```text
bpsmv-resource-hub/
├── client/                 # React Frontend (Vite)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Full page views (Dashboard, Login, Onboarding)
│   │   ├── App.jsx         # Main routing file
│   │   └── index.css       # Global design system & theme variables
│   └── package.json
│
├── server/                 # Node/Express Backend
│   ├── src/
│   │   ├── config/         # DB connection & Passport configuration
│   │   ├── models/         # Mongoose schemas (User, Subject, Resource)
│   │   ├── routes/         # API endpoints (Auth, Resources)
│   │   └── app.js          # Main server entry point
│   └── package.json
```

## 💻 How to Run Locally

### Prerequisites
- Node.js (v16+)
- MongoDB running locally or a MongoDB Atlas URI
- Google Cloud Console Project (for OAuth Credentials)

### 1. Backend Setup
1. Open a terminal and navigate to the server folder:
   ```bash
   cd bpsmv-resource-hub/server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Ensure your `.env` file is properly configured with your MongoDB URI and Google Client Keys.
4. Start the server:
   ```bash
   node src/app.js
   ```

### 2. Frontend Setup
1. Open a new terminal and navigate to the client folder:
   ```bash
   cd bpsmv-resource-hub/client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and go to `http://localhost:5173`.

---
*Developed for BPSMV University Students.*
