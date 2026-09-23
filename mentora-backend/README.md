# Mentora Backend

Node.js + Express + MongoDB (Mongoose) backend for Mentora — connecting students with freelance professionals for skill mentorship.

## Setup & Testing

```bash
npm install
npm run dev             # Starts dev server with nodemon
npm test                # Runs Jest integration test suite
```

## Environment Variables

Create a `.env` file with:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/mentora
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173,http://localhost:5174
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

## API Endpoint Specs

| Method | Route | Description | Auth Required |
|---|---|---|---|
| GET | `/api/health` | Service health check | No |
| POST | `/api/auth/register` | Register student or mentor account | No |
| POST | `/api/auth/login` | Log in and receive JWT token | No |
| GET | `/api/mentors` | Search & sort verified mentors | No |
| POST | `/api/mentors` | Create mentor profile | Yes (Mentor) |
| GET | `/api/mentors/:id` | Get single mentor profile | No |
| GET | `/api/mentors/admin/pending` | Fetch pending mentor applications | Yes (Admin) |
| PATCH | `/api/mentors/:id/verify` | Approve or reject mentor application | Yes (Admin) |
| POST | `/api/sessions` | Request/book mentorship session | Yes |
| GET | `/api/sessions/mine` | Fetch logged-in user sessions | Yes |
| PATCH | `/api/sessions/:id/status` | Confirm, complete, or cancel session | Yes |
| POST | `/api/reviews` | Leave rating & review for completed session | Yes |
| GET | `/api/reviews/mentor/:mentorId` | Fetch reviews for a mentor | No |
| POST | `/api/payments/create-checkout-session` | Generate Stripe Checkout session URL | Yes |
| POST | `/api/payments/confirm-payment` | Confirm payment & update session status | Yes |
| POST | `/api/payments/webhook` | Handle Stripe payment webhooks | No |

---

## 🚀 Deployment Instructions

### Deploying to Render
1. Push your code to GitHub.
2. Log in to [Render Dashboard](https://dashboard.render.com/) -> Select **New Web Service**.
3. Connect your GitHub repository and select the `mentora-backend` directory.
4. Set Build Command: `npm install`
5. Set Start Command: `npm start`
6. Add Environment Variables (`MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, `STRIPE_SECRET_KEY`).
7. Click **Deploy**. Use the generated Render URL (e.g. `https://mentora-backend.onrender.com`) as `VITE_API_URL` on the frontend.

### Deploying to Railway
1. Go to [Railway Dashboard](https://railway.app/) -> Create **New Project** -> **Deploy from GitHub repo**.
2. Set Working Directory to `mentora-backend`.
3. Add Environment Variables (`MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, `PORT=5000`).
4. Railway will automatically detect Node.js and run `npm start`.
