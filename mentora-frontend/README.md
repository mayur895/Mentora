# Mentora Frontend

React 18 + Vite SPA for Mentora — connecting students with freelance professionals for skill mentorship.

## Setup & Development

```bash
npm install
npm run dev      # Runs dev server at http://localhost:5173
npm run build    # Compiles production bundle in dist/
```

## Features

- **Authentication**: Register (Student/Mentor) & Login with JWT session persistence.
- **Mentor Discovery (`/mentors`)**: Search by skill, sort by rating and price.
- **Mentor Profiles (`/mentors/:id`)**: Detailed profile view, skill tags, ratings, reviews list, and session booking form.
- **Stripe Payment Redirect**: Integrated Stripe Checkout session flow for session bookings.
- **Session Management (`/sessions`)**: View active and past bookings, confirm/cancel/complete sessions, and submit reviews for completed sessions.
- **Admin Dashboard (`/admin`)**: Role-protected dashboard for reviewing and approving/rejecting mentor verification applications.

---

## 🚀 Deployment Instructions (Vercel)

1. Push your project to GitHub.
2. Go to [Vercel Dashboard](https://vercel.com/new) -> **Import Git Repository**.
3. Select `mentora-frontend` as the Root Directory.
4. Framework Preset: **Vite**.
5. Build Command: `npm run build`
6. Output Directory: `dist`
7. Environment Variables:
   - Add `VITE_API_URL` pointing to your deployed backend (e.g. `https://mentora-backend.onrender.com/api`).
8. Click **Deploy**. Vercel will build and host your frontend on HTTPS.
