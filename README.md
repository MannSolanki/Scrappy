# Scrappy 🌿 — Eco-Friendly Scrap Marketplace

> **Turn Waste into Wealth.** A full-stack platform where sellers list recyclable scrap materials and buyers discover them — promoting sustainability and a circular economy.

[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-purple?logo=vite)](https://vitejs.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3-cyan?logo=tailwindcss)](https://tailwindcss.com)
[![Node.js](https://img.shields.io/badge/Node.js-20-green?logo=nodedotjs)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb)](https://mongodb.com)

---

## ✨ Features

| Feature | Details |
|---|---|
| 🔐 **JWT Authentication** | Signup/Login with role-based access (buyer/seller) |
| 🏪 **Scrap Listings** | Full CRUD with image upload (up to 5 photos/listing) |
| 💡 **AI Price Suggestion** | Market-data + lookup table suggests optimal prices |
| 🛒 **Buyer Dashboard** | Search, filter by category, price, sort, pagination |
| 📦 **Seller Dashboard** | Manage listings, track views, toggle sold status |
| 📱 **Responsive UI** | Mobile-first design with Tailwind CSS |
| 🛡️ **Secure API** | Helmet, CORS, role middleware, bcrypt password hashing |

---

## 🏗️ Tech Stack

### Frontend (`/` — Root)
- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS 3** for styling
- **React Router v6** for routing
- **Axios** with JWT interceptors
- **React Hot Toast** for notifications
- **Lucide React** for icons

### Backend (`/backend`)
- **Node.js + Express** REST API
- **MongoDB** via **Mongoose** ODM
- **JWT** authentication
- **bcryptjs** password hashing
- **Multer** for image uploads
- **Helmet + CORS** for security

---

## 📁 Project Structure

```
Scrap_project/
├── src/                        # Frontend (React + Vite)
│   ├── api/axios.ts            # Axios instance + JWT interceptors
│   ├── context/AuthContext.tsx # Auth state management
│   ├── components/
│   │   ├── Navbar.tsx          # Auth-aware navigation
│   │   ├── Footer.tsx
│   │   ├── ListingCard.tsx     # Reusable scrap card
│   │   └── ProtectedRoute.tsx  # Role-based route guard
│   └── pages/
│       ├── Home.tsx            # Landing page
│       ├── Login.tsx / Signup.tsx
│       ├── SellerDashboard.tsx # CRUD + image upload + price AI
│       └── BuyerDashboard.tsx  # Search, filter, pagination
│
├── backend/                    # Node.js Backend
│   └── src/
│       ├── config/db.js        # MongoDB connection
│       ├── models/             # User.js, ScrapItem.js
│       ├── middleware/         # auth.js, upload.js, errorHandler.js
│       ├── controllers/        # authController, scrapController
│       ├── routes/             # auth, scraps, users, upload
│       └── server.js           # Express entry point
└── uploads/                    # Local image storage
```

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local) or MongoDB Atlas account

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd Scrap_project

# Install frontend deps
npm install

# Install backend deps
cd backend
npm install
```

### 2. Configure Environment Variables

**Backend** — Create `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/scrappydb
JWT_SECRET=your_super_secret_key_at_least_32_chars
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

**Frontend** — Already created as `.env`:
```env
VITE_API_URL=http://localhost:5000
```

### 3. Run Both Servers

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# → http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
# From root
npm run dev
# → http://localhost:5173
```

---

## 🔌 API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register user (buyer/seller) |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/auth/me` | JWT | Current user info |
| GET | `/api/scraps` | Public | List all scraps (filters, pagination) |
| GET | `/api/scraps/:id` | Public | Single listing |
| GET | `/api/scraps/my/listings` | Seller | Seller's own listings + stats |
| POST | `/api/scraps` | Seller | Create listing (multipart) |
| PUT | `/api/scraps/:id` | Seller | Update listing |
| DELETE | `/api/scraps/:id` | Seller | Delete listing |
| GET | `/api/scraps/price-suggest` | Public | AI price suggestion |
| POST | `/api/upload` | JWT | Upload images |
| GET | `/api/users/dashboard` | JWT | Dashboard stats |
| GET | `/api/users/stats` | Public | Platform statistics |
| GET | `/api/health` | Public | API health check |

---

## ☁️ Deployment Guide

### Frontend → Netlify

1. Push to GitHub
2. Go to [netlify.com](https://netlify.com) → "New site from Git"
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add environment variable: `VITE_API_URL=https://your-backend.onrender.com`

### Backend → Render

1. Go to [render.com](https://render.com) → "New Web Service"
2. Connect GitHub → select your repo, set root directory to `backend`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables (MONGODB_URI, JWT_SECRET, NODE_ENV=production, CLIENT_URL)

### Database → MongoDB Atlas

1. Create free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create database user and get connection string
3. Whitelist `0.0.0.0/0` for Render (or add Render's IPs)
4. Paste connection string as `MONGODB_URI` in Render

---

## 📦 Scrap Categories & Price Guide

| Category | Price Range |
|---|---|
| 🔩 Metal | ₹25–60/kg |
| 💻 E-Waste | ₹50–150/kg |
| ♻️ Plastic | ₹8–25/kg |
| 📄 Paper | ₹5–18/kg |
| 🫙 Glass | ₹2–10/kg |
| ⚙️ Rubber | ₹10–30/kg |
| 🌲 Wood | ₹3–12/kg |

---

## 👨‍💻 Author

**Mann Solanki** — Frontend Developer | UI/UX | AI Web Apps  
📧 mannsolanki@example.com | 🌐 [Portfolio](#)

---

*Made with ❤️ for a greener India 🇮🇳*
