# 🎓 Mentora — Connect Students with Expert Mentors

> **Mentora** is a full-stack web platform that bridges the gap between learners and seasoned professionals. Students can discover mentors by skill, view profiles and reviews, book 1-on-1 sessions, and manage their learning journey — all in one place.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Environment Variables](#-environment-variables)
- [Getting Started](#-getting-started)
- [API Reference](#-api-reference)
- [Data Models](#-data-models)
- [Frontend Pages & Components](#-frontend-pages--components)
- [Authentication Flow](#-authentication-flow)
- [Security](#-security)
- [Running Tests](#-running-tests)
- [Roadmap](#-roadmap)
- [License](#-license)

---

## 🌟 Overview

Mentora is a **mentor-student matching platform** built with a modern MERN-like stack (MongoDB · Express · React · Node.js). It enables:

- **Students** to search for mentors by skill set, read reviews, and book paid or free sessions.
- **Mentors** to list their expertise, set hourly rates, and manage incoming session requests.
- **Admins** to oversee all users, sessions, and platform activity via a dedicated dashboard.

The application is split into two independent services:

| Service | Technology | Port |
|---|---|---|
| `mentora-backend` | Node.js + Express REST API | `5000` |
| `mentora-frontend` | React 18 + Vite SPA | `5174` |

---

## ✨ Features

### For Students
- 🔍 **Search & Filter Mentors** — Filter by skill/technology, sort by rating or price
- 👤 **View Mentor Profiles** — Detailed profiles with bio, hourly rate, expertise & star ratings
- ⭐ **Read & Write Reviews** — Community-driven mentor rating system
- 📅 **Book Sessions** — Request sessions with preferred date/time and agenda notes
- 📊 **Session Dashboard** — Track all upcoming and past sessions in one view
- ✅ **Confirm Sessions** — Accept or mark sessions as completed

### For Mentors
- 🧑‍🏫 **Create a Profile** — Add skills, bio, and set your hourly rate
- 📥 **Manage Requests** — Accept or reject incoming session bookings
- 💬 **Session Notes** — Add notes to sessions for better communication

### For Admins
- 🛡️ **Admin Dashboard** — Full visibility into platform users and sessions
- 👥 **User Management** — View all registered users with their roles
- 📋 **Session Overview** — Monitor all sessions across all users

### Platform-wide
- 🔐 **JWT Authentication** — Secure token-based login & registration
- 🛡️ **Role-Based Access** — Separate permissions for `student`, `mentor`, and `admin`
- 💳 **Stripe Integration** — Payment infrastructure ready for session billing
- 🚦 **Rate Limiting** — Protection against abuse (200 req/15 min per IP)

---

## 🛠 Tech Stack

### Backend
| Package | Version | Purpose |
|---|---|---|
| `express` | ^4.19.2 | HTTP server & REST API routing |
| `mongoose` | ^8.5.0 | MongoDB ODM & schema validation |
| `jsonwebtoken` | ^9.0.2 | JWT generation & verification |
| `bcryptjs` | ^2.4.3 | Password hashing |
| `cors` | ^2.8.5 | Cross-Origin Resource Sharing |
| `helmet` | ^8.3.0 | HTTP security headers |
| `express-rate-limit` | ^8.7.0 | API rate limiting |
| `express-validator` | ^7.3.2 | Request input validation |
| `stripe` | ^22.6.2 | Payment processing |
| `morgan` | ^1.10.0 | HTTP request logging |
| `dotenv` | ^16.4.5 | Environment variable management |
| `nodemon` | ^3.1.4 | Dev auto-reload |

### Frontend
| Package | Version | Purpose |
|---|---|---|
| `react` | ^18.3.1 | UI component library |
| `react-dom` | ^18.3.1 | DOM rendering |
| `react-router-dom` | ^6.24.1 | Client-side routing |
| `axios` | ^1.7.2 | HTTP client with interceptors |
| `vite` | ^5.3.3 | Dev server & build toolchain |
| `@vitejs/plugin-react` | ^4.3.1 | React + Fast Refresh support |

### Database
| Service | Provider |
|---|---|
| MongoDB Atlas | Cloud-hosted cluster (free tier) |

---

## 📁 Project Structure

```
Mentora_Project/
├── README.md                          # ← You are here
│
├── mentora-backend/                   # Express REST API
│   ├── server.js                      # Entry point — connects DB & starts server
│   ├── app.js                         # Express app setup (CORS, middleware, routes)
│   ├── .env                           # Environment variables (NOT committed)
│   ├── package.json
│   │
│   ├── config/
│   │   └── db.js                      # Mongoose connection setup
│   │
│   ├── models/                        # Mongoose schemas
│   │   ├── User.js                    # User (student/mentor/admin)
│   │   ├── MentorProfile.js           # Extended mentor info & skills
│   │   ├── Session.js                 # Booking sessions
│   │   ├── Review.js                  # Mentor reviews & ratings
│   │   ├── Message.js                 # (Blueprint) Chat messages
│   │   ├── Payment.js                 # (Blueprint) Payment records
│   │   └── LearningPath.js            # (Blueprint) Structured learning tracks
│   │
│   ├── controllers/                   # Route handler logic
│   │   ├── authController.js          # Register, login
│   │   ├── mentorController.js        # Mentor CRUD, search, profile mgmt
│   │   ├── sessionController.js       # Book, update, list sessions
│   │   ├── reviewController.js        # Create & fetch mentor reviews
│   │   └── paymentController.js       # Stripe payment intent & webhooks
│   │
│   ├── routes/                        # Express route definitions
│   │   ├── authRoutes.js              # POST /api/auth/register|login
│   │   ├── mentorRoutes.js            # GET|POST|PUT /api/mentors
│   │   ├── sessionRoutes.js           # GET|POST|PATCH /api/sessions
│   │   ├── reviewRoutes.js            # GET|POST /api/reviews
│   │   └── paymentRoutes.js           # POST /api/payments
│   │
│   ├── middleware/
│   │   └── authMiddleware.js          # JWT verification guard
│   │
│   └── tests/                         # Jest + Supertest unit/integration tests
│
└── mentora-frontend/                  # React 18 SPA (Vite)
    ├── index.html                     # App shell
    ├── vite.config.js                 # Vite config (port 5174, proxy)
    ├── .env                           # VITE_API_URL variable
    ├── package.json
    │
    └── src/
        ├── main.jsx                   # ReactDOM.createRoot entry point
        ├── App.jsx                    # Router setup & route declarations
        ├── index.css                  # Global styles & CSS variables
        │
        ├── api/
        │   └── axios.js               # Axios instance with base URL & auth interceptor
        │
        ├── context/
        │   └── AuthContext.jsx        # Global auth state (user, token, login/logout)
        │
        ├── components/                # Reusable UI components
        │   ├── Navbar.jsx             # Top navigation bar
        │   ├── MentorCard.jsx         # Mentor listing card widget
        │   └── ProtectedRoute.jsx     # Route guard (redirects if unauthenticated)
        │
        └── pages/                     # Full page components
            ├── Login.jsx              # /login — Auth form
            ├── Register.jsx           # /register — Registration form
            ├── MentorSearch.jsx       # /mentors — Browse & filter mentors
            ├── MentorProfile.jsx      # /mentors/:id — Full mentor details & booking
            ├── MySessions.jsx         # /sessions — Student/mentor session management
            └── AdminDashboard.jsx     # /admin — Admin control panel
```

---

## ✅ Prerequisites

Before you begin, make sure you have the following installed:

| Requirement | Minimum Version | Download |
|---|---|---|
| Node.js | 18.x or higher | https://nodejs.org |
| npm | 9.x or higher | Bundled with Node.js |
| Git | Any recent version | https://git-scm.com |
| MongoDB Atlas account | — | https://www.mongodb.com/cloud/atlas |

---

## 🔐 Environment Variables

### Backend — `mentora-backend/.env`

Create this file in the `mentora-backend/` directory:

```env
# Server
PORT=5000

# MongoDB Atlas
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/<dbname>?retryWrites=true&w=majority

# JSON Web Token
JWT_SECRET=your_super_secret_random_string_here
JWT_EXPIRES_IN=7d

# Stripe (use test keys for development)
STRIPE_SECRET_KEY=your_stripe_secret_key_here

# Allowed frontend origins (comma-separated)
CLIENT_URL=http://localhost:5173,http://localhost:5174
```

> ⚠️ **Never commit `.env` to version control.** Add it to `.gitignore`.

### Frontend — `mentora-frontend/.env`

```env
VITE_API_URL=http://localhost:5000
```

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/mentora.git
cd mentora
```

### 2. Setup the Backend

```bash
cd mentora-backend

# Install dependencies
npm install

# Create your .env file (see Environment Variables above)
cp .env.example .env
# → Edit .env with your MongoDB URI, JWT secret, Stripe key

# Start backend in development mode (auto-reloads on file changes)
npm run dev
```

You should see:
```
MongoDB Connected: cluster0.minc2rm.mongodb.net
Server running on port 5000
```

### 3. Setup the Frontend

Open a **new terminal** in the project root:

```bash
cd mentora-frontend

# Install dependencies
npm install

# Start frontend dev server
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5174/
  ➜  Network: use --host to expose
```

### 4. Open in Browser

Navigate to **http://localhost:5174** — the app will load and redirect to `/mentors`.

---

## 📡 API Reference

All endpoints are prefixed with `/api`. The backend runs on **port 5000**.

### 🔐 Authentication — `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | ❌ Public | Register a new user |
| `POST` | `/api/auth/login` | ❌ Public | Login and receive a JWT |

**Register body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "securePassword123",
  "role": "student"
}
```

**Login body:**
```json
{
  "email": "jane@example.com",
  "password": "securePassword123"
}
```

**Login response:**
```json
{
  "token": "eyJhbGci...",
  "user": { "_id": "...", "name": "Jane Smith", "role": "student" }
}
```

---

### 👨‍🏫 Mentors — `/api/mentors`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/mentors` | ❌ Public | List all mentors (filterable) |
| `GET` | `/api/mentors/:id` | ❌ Public | Get single mentor profile |
| `POST` | `/api/mentors/profile` | ✅ Mentor | Create mentor profile |
| `PUT` | `/api/mentors/profile` | ✅ Mentor | Update mentor profile |

**Query Parameters for `GET /api/mentors`:**
| Parameter | Type | Example | Description |
|---|---|---|---|
| `skill` | string | `?skill=React` | Filter by skill |
| `sort` | string | `?sort=rating` | Sort by `rating` or `price` |

---

### 📅 Sessions — `/api/sessions`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/sessions` | ✅ Student | Book a new session |
| `GET` | `/api/sessions` | ✅ Any | Get my sessions |
| `PATCH` | `/api/sessions/:id` | ✅ Any | Update session status |

**Book Session body:**
```json
{
  "mentorId": "60d0fe4f5311236168a109ca",
  "scheduledAt": "2025-10-15T10:00:00Z",
  "duration": 60,
  "notes": "I want to learn React hooks"
}
```

**Session statuses:** `pending` → `confirmed` → `completed` | `cancelled`

---

### ⭐ Reviews — `/api/reviews`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/reviews/mentor/:mentorId` | ❌ Public | Get all reviews for a mentor |
| `POST` | `/api/reviews` | ✅ Student | Submit a review |

**Review body:**
```json
{
  "mentorId": "60d0fe4f5311236168a109ca",
  "rating": 5,
  "comment": "Excellent session, very helpful!"
}
```

---

### 💳 Payments — `/api/payments`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/payments/create-intent` | ✅ Any | Create Stripe payment intent |
| `POST` | `/api/payments/webhook` | ❌ Public | Stripe webhook handler |

---

### 🏥 Health Check

```
GET /api/health
```
Returns `{ "status": "OK", "timestamp": "..." }` — useful for uptime monitoring.

---

## 🗃 Data Models

### User
```javascript
{
  name:      String (required),
  email:     String (unique, required),
  password:  String (hashed, required),
  role:      Enum ["student", "mentor", "admin"]  // default: "student"
}
```

### MentorProfile
```javascript
{
  user:        ObjectId → User,
  bio:         String,
  skills:      [String],
  hourlyRate:  Number,
  rating:      Number,        // auto-calculated from reviews
  reviewCount: Number
}
```

### Session
```javascript
{
  student:     ObjectId → User,
  mentor:      ObjectId → User,
  scheduledAt: Date,
  duration:    Number (minutes),
  status:      Enum ["pending","confirmed","completed","cancelled"],
  notes:       String
}
```

### Review
```javascript
{
  reviewer:  ObjectId → User,
  mentor:    ObjectId → User,
  rating:    Number (1–5),
  comment:   String,
  createdAt: Date
}
```

### Payment *(blueprint)*
```javascript
{
  session:         ObjectId → Session,
  payer:           ObjectId → User,
  amount:          Number,
  currency:        String,
  stripePaymentId: String,
  status:          Enum ["pending","completed","refunded"]
}
```

### Message *(blueprint)*
```javascript
{
  sender:    ObjectId → User,
  receiver:  ObjectId → User,
  content:   String,
  read:      Boolean,
  createdAt: Date
}
```

### LearningPath *(blueprint)*
```javascript
{
  mentor:      ObjectId → User,
  title:       String,
  description: String,
  skills:      [String],
  sessions:    [ObjectId → Session]
}
```

---

## 🖥 Frontend Pages & Components

### Pages

| Route | Component | Auth Required | Description |
|---|---|---|---|
| `/` | — | ❌ | Redirects to `/mentors` |
| `/login` | `Login.jsx` | ❌ | Email & password login form |
| `/register` | `Register.jsx` | ❌ | New user registration |
| `/mentors` | `MentorSearch.jsx` | ❌ | Browse & search all mentors |
| `/mentors/:id` | `MentorProfile.jsx` | ❌ (booking requires auth) | Full mentor profile & booking |
| `/sessions` | `MySessions.jsx` | ✅ | Manage your sessions |
| `/admin` | `AdminDashboard.jsx` | ✅ Admin only | Platform admin panel |

### Components

| Component | Description |
|---|---|
| `Navbar.jsx` | Responsive nav bar with auth-aware links and logout |
| `MentorCard.jsx` | Card widget displaying mentor name, skills, rate & rating |
| `ProtectedRoute.jsx` | HOC that redirects unauthenticated users to `/login` |

### Global State — `AuthContext`

The app uses React Context for auth state management:

```javascript
const { user, token, login, logout } = useAuth();
```

- `user` — The logged-in user object `{ _id, name, email, role }`
- `token` — The stored JWT token (persisted in `localStorage`)
- `login(data)` — Sets user + token in state and localStorage
- `logout()` — Clears state and localStorage, redirects to `/login`

### API Client — `axios.js`

A pre-configured Axios instance that:
- Sets `baseURL` from `VITE_API_URL` environment variable
- Automatically attaches `Authorization: Bearer <token>` to every request via a request interceptor

---

## 🔒 Authentication Flow

```
1. User submits login form
        ↓
2. POST /api/auth/login
        ↓
3. Backend verifies email + bcrypt password hash
        ↓
4. Returns JWT (expires in 7 days)
        ↓
5. Frontend stores token in localStorage via AuthContext
        ↓
6. Axios interceptor attaches token to all future requests
        ↓
7. Protected backend routes validate token via authMiddleware.js
        ↓
8. Decoded userId/role is attached to req.user for controllers
```

---

## 🛡 Security

| Measure | Implementation |
|---|---|
| **Password Hashing** | `bcryptjs` with salt rounds = 10 |
| **JWT Signing** | HS256 algorithm, 7-day expiry |
| **CORS** | Restricted to allowed origins in `CLIENT_URL` env var |
| **HTTP Headers** | `helmet` middleware (removes fingerprinting headers) |
| **Rate Limiting** | 200 requests per 15 minutes per IP |
| **Input Validation** | `express-validator` on all POST/PUT routes |
| **Env Secrets** | All secrets stored in `.env`, never committed |

---

## 🧪 Running Tests

The backend uses **Jest** + **Supertest** for automated testing.

```bash
cd mentora-backend

# Run all tests
npm test

# Watch mode (re-runs on file changes)
npx jest --watch
```

Tests are located in `mentora-backend/tests/`.

---

## 🛣 Roadmap

The following features are planned or in progress:

- [ ] **Real-time Messaging** — WebSocket chat between students and mentors (Message model ready)
- [ ] **Stripe Payments** — Complete payment flow for session billing (Payment model ready)
- [ ] **Learning Paths** — Mentor-curated structured learning tracks (LearningPath model ready)
- [ ] **Email Notifications** — Session confirmation and reminder emails (Nodemailer)
- [ ] **Mentor Availability Calendar** — Slot-based scheduling system
- [ ] **File Uploads** — Profile pictures via Cloudinary or AWS S3
- [ ] **Mobile Responsive UI** — Full responsive design improvements
- [ ] **OAuth Login** — Google / GitHub single sign-on

---

## 📜 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ by the Mentora team
</p>
