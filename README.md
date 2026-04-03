<div align="center">

# 🏗️ Sree Krishna Steels

### Full-Stack E-Commerce Web Application

[![Live Demo](https://img.shields.io/badge/Live%20Demo-sree--krishna--steels.vercel.app-brightgreen?style=for-the-badge&logo=vercel)](https://sree-krishna-steels.vercel.app)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=for-the-badge&logo=firebase)](https://firebase.google.com)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=for-the-badge&logo=vercel)](https://vercel.com)

A modern, production-ready e-commerce platform for **Sree Krishna Steels** — featuring product listings, customer ordering, admin dashboards, order management, delivery tracking, and AI-powered assistance.

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Database Schema](#-database-schema)
- [Security & Access Control](#-security--access-control)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Available Scripts](#-available-scripts)
- [Deployment](#-deployment)
- [Firebase Setup](#-firebase--firestore-setup)
- [User Roles](#-user-roles)
- [Contributing](#-contributing)

---

## 🌟 Overview

Sree Krishna Steels is a full-featured B2C e-commerce web application built for a steel & furniture retail business. It supports two types of users — **customers** who browse and order products, and **admins** who manage inventory, track orders, assign drivers, and view analytics.

The app is a single-page application (SPA) built with React and TypeScript, powered by Firebase Firestore for real-time data, Supabase for authentication and storage, and deployed globally on Vercel.

---

## ✨ Features

### Customer Portal
- 🛍️ Browse and search products by category
- 🖼️ Product image gallery with Instagram Reel integration
- 🛒 Add to cart and checkout flow
- 📦 Real-time order tracking (Pending → Processing → Shipped → Delivered)
- 🔔 In-app notifications for order updates
- 👤 User profile and order history

### Admin Dashboard
- 📊 Analytics & charts (revenue, orders, product performance via Recharts)
- 📦 Full product management (CRUD) with image upload and stock control
- 📋 Order management with status updates (including driver assignment & delivery days)
- 🚗 Driver assignment and delivery management
- 📌 Pin featured products to the top of the listing
- 🔔 Notification / email log management
- 🤖 AI-powered assistant (Google GenAI)

---

## 🛠️ Tech Stack

| Category | Technology | Version |
|---|---|---|
| **Frontend Framework** | React | 19 |
| **Language** | TypeScript | ~5.8 |
| **Build Tool** | Vite | 6.2 |
| **Styling** | Tailwind CSS | 4.x |
| **Routing** | React Router DOM | 7.x |
| **State Management** | Zustand | 5.x |
| **Animation** | Motion (Framer Motion) | 12.x |
| **Charts** | Recharts | 3.x |
| **Icons** | Lucide React | 0.546 |
| **Notifications** | Sonner | 2.x |
| **Database** | Firebase Firestore | — |
| **Auth & Storage** | Supabase | 2.x |
| **AI Integration** | Google GenAI SDK | 1.x |
| **Image Compression** | browser-image-compression | 2.x |
| **Deployment** | Vercel | — |

---

## 🏛️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Vercel (CDN / Hosting)              │
│                                                         │
│   ┌──────────────────────────────────────────────────┐  │
│   │          React SPA  (Vite + TypeScript)          │  │
│   │                                                  │  │
│   │  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │  │
│   │  │  Pages   │  │Components│  │  Zustand Store│  │  │
│   │  └──────────┘  └──────────┘  └───────────────┘  │  │
│   └────────────────────┬─────────────────────────────┘  │
└────────────────────────┼────────────────────────────────┘
                         │
           ┌─────────────┼──────────────┐
           │             │              │
    ┌──────▼──────┐ ┌────▼─────┐ ┌─────▼──────┐
    │  Firebase   │ │ Supabase │ │ Google AI  │
    │  Firestore  │ │  Auth &  │ │   GenAI    │
    │  (Database) │ │ Storage  │ │ (Assistant)│
    └─────────────┘ └──────────┘ └────────────┘
```

The app uses a **client-side rendered SPA** architecture with Vercel's edge network for global delivery. All routes are rewritten to `index.html` for client-side routing support.

---

## 🗄️ Database Schema

The Firestore database is structured around five core collections:

### `/users/{userId}`
| Field | Type | Description |
|---|---|---|
| `id` | string | Unique user ID |
| `name` | string | Full name |
| `email` | string | Email address |
| `role` | enum | `admin` \| `customer` |
| `created_at` | timestamp | Account creation time |

### `/products/{productId}`
| Field | Type | Description |
|---|---|---|
| `id` | string | Unique product ID |
| `title` | string | Product name |
| `description` | string | Product description |
| `price` | number | Price (₹) |
| `stock` | integer | Available stock count |
| `category` | string | Product category |
| `image_url` | string | Main product image |
| `reel_link` | string | Instagram Reel URL (optional) |
| `is_active` | boolean | Visible to customers |
| `is_pinned` | boolean | Pinned to top of listing |
| `created_at` | timestamp | Creation time |

### `/orders/{orderId}`
| Field | Type | Description |
|---|---|---|
| `id` | string | Unique order ID |
| `user_id` | string | Linked customer ID |
| `total_amount` | number | Total order value (₹) |
| `status` | enum | `pending` \| `processing` \| `shipped` \| `delivered` \| `cancelled` |
| `payment_status` | enum | `pending` \| `paid` \| `failed` |
| `shipping_address` | string | Delivery address |
| `payment_method` | string | Payment method used |
| `customer_name` | string | Customer full name |
| `customer_phone` | string | Contact number |
| `customer_email` | string | Customer email |
| `driver_name` | string | Assigned delivery driver |
| `delivery_days` | integer | Estimated delivery days |
| `created_at` | timestamp | Order placement time |

### `/order_items/{itemId}`
| Field | Type | Description |
|---|---|---|
| `id` | string | Unique item ID |
| `order_id` | string | Parent order reference |
| `product_id` | string | Linked product ID |
| `quantity` | integer | Quantity ordered |
| `price` | number | Price at time of order |
| `title` | string | Product title snapshot |
| `image_url` | string | Product image snapshot |

### `/notifications/{notificationId}`
| Field | Type | Description |
|---|---|---|
| `id` | string | Unique notification ID |
| `user_id` | string | Target user ID |
| `type` | string | e.g., `order_confirmation` |
| `message` | string | Notification content |
| `read` | boolean | Read status |
| `created_at` | timestamp | Creation time |

---

## 🔐 Security & Access Control

Security is enforced at the **Firestore rules level**, not just the UI.

### Role-Based Access
| Collection | Customer | Admin |
|---|---|---|
| `users` | Read/write own profile only | Full access |
| `products` | Read (public) | Full CRUD |
| `orders` | Create own, read own | Full access + status updates |
| `order_items` | Via parent order | Full access |
| `notifications` | Read own | Full access |

### Admin Identity
Admin access is granted to users whose Firestore `role` field is `admin`, **OR** to the following verified email addresses hardcoded as default admins:
- `support@sksfurniture.in`
- `mohanbalu292@gmail.com`

### Validation Rules
All writes are validated against strict schemas:
- String length limits (name < 100 chars, description < 2000 chars)
- Enum enforcement for `role`, `status`, and `payment_status`
- Required field presence checks
- No deletion of orders is ever permitted (`allow delete: if false`)

---

## 📁 Project Structure

```
Sree-Krishna-Steels/
│
├── src/                          # Application source code
│   ├── components/               # Reusable UI components
│   ├── pages/                    # Route-level page components
│   ├── store/                    # Zustand state management
│   ├── hooks/                    # Custom React hooks
│   ├── lib/                      # Firebase, Supabase clients
│   ├── types/                    # TypeScript type definitions
│   └── utils/                    # Helper utilities
│
├── index.html                    # HTML entry point
├── vite.config.ts                # Vite build configuration
├── tsconfig.json                 # TypeScript configuration
│
├── firebase-blueprint.json       # Firestore schema blueprint
├── firestore.rules               # Firestore security rules
│
├── vercel.json                   # Vercel SPA rewrite rules
├── .env.example                  # Environment variable template
├── package.json                  # Dependencies & scripts
└── README.md                     # This file
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- **Node.js** v18 or higher — [Download](https://nodejs.org)
- **npm** v9+ (comes with Node.js)
- A **Firebase** project — [Create one](https://console.firebase.google.com)
- A **Supabase** project — [Create one](https://supabase.com)

### 1. Clone the Repository

```bash
git clone https://github.com/Mohanbalu/Sree-Krishna-Steels.git
cd Sree-Krishna-Steels
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Fill in your credentials in `.env` (see [Environment Variables](#-environment-variables) below).

### 4. Start the Development Server

```bash
npm run dev
```

The app will be available at **http://localhost:3000**

---

## 🔑 Environment Variables

Create a `.env` file at the root of the project with the following variables:

```env
# ── Firebase ──────────────────────────────────────────
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id

# ── Supabase ───────────────────────────────────────────
VITE_SUPABASE_URL=https://your_project_ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# ── Google GenAI (AI Assistant) ────────────────────────
VITE_GOOGLE_GENAI_API_KEY=your_google_genai_api_key
```

> ⚠️ **Never commit your `.env` file.** It is listed in `.gitignore` by default.

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server on `http://localhost:3000` |
| `npm run build` | Build for production into `dist/` |
| `npm run preview` | Locally preview the production build |
| `npm run lint` | Run TypeScript type-checking (`tsc --noEmit`) |
| `npm run clean` | Remove the `dist/` build folder |

---

## 🌐 Deployment

### Vercel (Recommended — Current Setup)

The project is pre-configured for Vercel deployment. The `vercel.json` rewrites all routes to `index.html` to support client-side routing:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

#### Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Deploy (follow prompts)
vercel

# Deploy to production
vercel --prod
```

#### Deploy via GitHub Integration (Recommended)

1. Push your repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) and import your repository
3. Add all environment variables from `.env` in the Vercel dashboard under **Settings → Environment Variables**
4. Every push to `main` will trigger an automatic production deployment

---

## 🔥 Firebase / Firestore Setup

### 1. Create a Firebase Project

1. Visit [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable **Firestore Database** in production mode
4. Enable **Authentication** → Email/Password provider

### 2. Deploy Firestore Security Rules

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in the project
firebase init firestore

# Deploy rules
firebase deploy --only firestore:rules
```

### 3. Seed Initial Data

Use the `firebase-blueprint.json` as a reference schema for seeding your Firestore collections. You can import initial data through the Firebase Console or via the Firebase Admin SDK.

### 4. Set Default Admin

To grant yourself admin access, create a user document in Firestore at `/users/{your_uid}` with `role: "admin"`, or use one of the hardcoded admin emails (`support@sksfurniture.in` / `mohanbalu292@gmail.com`).

---

## 👥 User Roles

### Customer
- Register and log in
- Browse product catalog
- Add to cart and place orders
- Track order status in real time
- View notification history

### Admin
- All customer capabilities
- Manage products (create, edit, delete, pin, toggle visibility)
- View and update all orders (change status, assign driver, set delivery days)
- Access the analytics dashboard with revenue and order charts
- Manage notifications

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Commit** your changes using conventional commits
   ```bash
   git commit -m "feat: add product search filter"
   ```
4. **Push** to your fork
   ```bash
   git push origin feature/your-feature-name
   ```
5. **Open** a Pull Request against `main`

### Commit Convention

| Prefix | Description |
|---|---|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation update |
| `style:` | Code style / formatting |
| `refactor:` | Code refactoring |
| `chore:` | Dependency updates, config changes |

---

## 📄 License

This project is proprietary. All rights reserved © **Sree Krishna Steels**.  
Unauthorized use, reproduction, or distribution is strictly prohibited.

---

<div align="center">

Built with ❤️ by [Mohanbalu](https://github.com/Mohanbalu)

🌐 [sree-krishna-steels.vercel.app](https://sree-krishna-steels.vercel.app)

</div>
