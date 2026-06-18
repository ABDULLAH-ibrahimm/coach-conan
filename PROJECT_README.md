# Coach Conan - Online Coaching Platform

A complete online coaching platform built with Next.js 16, featuring a coach dashboard, client portal, workout/nutrition management, progress tracking, session scheduling, and payment management.

## 🔐 Login Credentials

### Coach Dashboard (`/?view=dashboard`)
- **Email:** `coach@connan.com`
- **Password:** `Coach2024!`

### Client Portal (`/?view=client-portal`)
- **Phone:** `01021304688` (Abdullah)
- Or register a new client account

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16 (App Router), TypeScript 5, Tailwind CSS 4, shadcn/ui |
| **Backend API** | Bun + Express-style server (mini-service on port 3003) |
| **Database** | Prisma ORM + SQLite |
| **Auth** | JWT tokens (coach + client), bcrypt password hashing |
| **Icons** | Lucide React |
| **i18n** | Arabic (RTL) + English (LTR) |

---

## 🚀 Setup Instructions

### Prerequisites
- **Node.js** 18+ 
- **Bun** (for the mini-service)
- **npm** or **bun** (for the Next.js app)

### 1. Install Dependencies

```bash
# Main Next.js app
cd /path/to/project
npm install
# or
bun install

# Mini-service (coach API)
cd mini-services/coach-api
npm install
# or
bun install
```

### 2. Database Setup

The project uses **two SQLite databases**:

| Database | Location | Purpose |
|---|---|---|
| Main DB | `db/custom.db` | Admin, Client (Next.js), Session, Testimonial, ContactSubmission |
| Coach API DB | `mini-services/coach-api/prisma/coach.db` | Coach, Client (with passwords), WorkoutProgram, NutritionPlan, Progress, Payment, etc. |

Both databases are included in this ZIP with seed data already loaded.

To re-seed from scratch:
```bash
# Main DB
npx prisma db push
bun run seed.ts

# Coach API DB (auto-seeds on first start)
cd mini-services/coach-api
npx prisma db push
```

### 3. Environment Variables

Create a `.env` file in the project root:
```env
DATABASE_URL="file:./db/custom.db"
JWT_SECRET="your-secret-key-here"
```

### 4. Start the Services

#### Option A: Using the included scripts
```bash
# Start all services (Next.js + coach-api)
./start-services.sh
```

#### Option B: Manual start
```bash
# Terminal 1 - Start the coach API mini-service (port 3003)
cd mini-services/coach-api
bun run dev

# Terminal 2 - Start the Next.js app (port 3000)
cd /path/to/project
npm run dev
# or
bun run dev
```

### 5. Access the Application

- **Website:** http://localhost:3000
- **Coach Dashboard:** http://localhost:3000/?view=dashboard
- **Client Portal:** http://localhost:3000/?view=client-portal

---

## 📁 Project Structure

```
project/
├── src/                          # Next.js application
│   ├── app/                      # App Router pages & API routes
│   │   ├── page.tsx              # Main page (handles all views)
│   │   ├── layout.tsx            # Root layout
│   │   ├── globals.css           # Global styles + design tokens
│   │   └── api/                  # API routes
│   │       ├── coach/[...path]/  # Proxy to mini-service
│   │       ├── health/           # Health check endpoint
│   │       ├── admin/            # Admin auth routes
│   │       ├── client-portal/    # Client portal routes
│   │       ├── testimonials/     # Public testimonials
│   │       └── feedback/         # Contact form
│   ├── components/               # React components
│   │   ├── ui/                   # shadcn/ui components
│   │   ├── sections/             # Landing page sections (Hero, About, Services, etc.)
│   │   ├── dashboard/            # Coach dashboard components
│   │   └── client-portal/        # Client portal components
│   ├── lib/                      # Utilities
│   │   ├── i18n.tsx              # Arabic/English translations
│   │   ├── coach-api.ts          # Coach API client
│   │   ├── client-api.ts         # Client API client
│   │   └── auth.ts               # Admin auth utilities
│   └── contexts/                 # React contexts
│       └── LanguageContext.tsx   # Language state management
├── mini-services/
│   └── coach-api/                # Backend API service (port 3003)
│       ├── index.ts              # Server entry point
│       ├── src/
│       │   ├── db.ts             # Prisma client
│       │   ├── routes/           # API route handlers
│       │   ├── middleware/       # Auth middleware
│       │   └── utils/            # JWT, validation utilities
│       └── prisma/
│           ├── schema.prisma     # Database schema
│           └── coach.db          # SQLite database (with seed data)
├── prisma/
│   └── schema.prisma             # Main DB schema
├── db/
│   └── custom.db                 # Main SQLite database
├── public/                       # Static assets (images, icons)
├── package.json                  # Main app dependencies
├── tailwind.config.ts            # Tailwind configuration
├── next.config.ts                # Next.js configuration
├── tsconfig.json                 # TypeScript configuration
├── Caddyfile                     # Gateway configuration
├── seed.ts                       # Database seed script
└── .env                          # Environment variables
```

---

## 🎨 Design System

### Colors
- **Primary:** Red 600 (`#dc2626`) - brand color
- **Background:** Dark theme (zinc-950 base)
- **Surface:** Glassmorphism cards (`bg-white/5`)
- **Accent:** Orange (for "CONAN" branding)

### Fonts
- System font stack with Arabic support
- Headings: Bold weights
- Body: Regular weight

### Layout
- **Sticky footer** at bottom of viewport
- **Responsive:** Mobile-first design
- **RTL Support:** Full Arabic right-to-left layout
- **Glassmorphism:** Frosted glass effect on cards

---

## 🔧 API Endpoints

### Coach API (port 3003, proxied via `/api/coach/`)

#### Authentication
- `POST /api/coach/auth/login` - Coach login
- `POST /api/coach/auth/register` - Coach registration
- `GET /api/coach/auth/me` - Get current coach
- `PUT /api/coach/auth/change-password` - Change password
- `PUT /api/coach/auth/profile` - Update profile

#### Clients
- `GET /api/coach/clients` - List clients
- `POST /api/coach/clients` - Create client
- `GET /api/coach/clients/:id` - Get client
- `PUT /api/coach/clients/:id` - Update client
- `DELETE /api/coach/clients/:id` - Delete client
- `PUT /api/coach/clients/:id/approve` - Approve client
- `PUT /api/coach/clients/:id/reject` - Reject client
- `GET /api/coach/clients/export` - Export CSV

#### Workouts
- `GET /api/coach/workouts` - List workouts
- `POST /api/coach/workouts` - Create workout program
- `GET /api/coach/workouts/:id` - Get workout
- `PUT /api/coach/workouts/:id` - Update
- `DELETE /api/coach/workouts/:id` - Delete
- `POST /api/coach/workouts/:id/duplicate` - Duplicate

#### Nutrition
- `GET /api/coach/nutrition` - List nutrition plans
- `POST /api/coach/nutrition` - Create plan
- `GET /api/coach/nutrition/:id` - Get plan
- `PUT /api/coach/nutrition/:id` - Update
- `DELETE /api/coach/nutrition/:id` - Delete

#### Progress
- `GET /api/coach/progress/client/:clientId` - Get progress
- `POST /api/coach/progress` - Add entry
- `PUT /api/coach/progress/:id` - Update
- `DELETE /api/coach/progress/:id` - Delete

#### Sessions
- `GET /api/coach/sessions` - List sessions
- `POST /api/coach/sessions` - Create session
- `PUT /api/coach/sessions/:id` - Update
- `DELETE /api/coach/sessions/:id` - Delete

#### Payments
- `GET /api/coach/payments` - List payments
- `POST /api/coach/payments` - Create payment
- `PUT /api/coach/payments/:id` - Update
- `PUT /api/coach/payments/:id/mark-paid` - Mark as paid
- `DELETE /api/coach/payments/:id` - Delete

#### Client Auth (for client portal)
- `POST /api/coach/client-auth/register` - Client registration
- `POST /api/coach/client-auth/login` - Email + password login
- `POST /api/coach/client-auth/phone-login` - Phone-only login
- `GET /api/coach/client-auth/me` - Get current client

#### Client Portal (read-only access)
- `GET /api/coach/client/dashboard` - Client dashboard data
- `GET /api/coach/client/workouts` - Client's workouts
- `GET /api/coach/client/nutrition` - Client's nutrition plans
- `GET /api/coach/client/progress` - Client's progress
- `POST /api/coach/client/progress` - Add progress entry
- `GET /api/coach/client/sessions` - Client's sessions
- `GET /api/coach/client/payments` - Client's payments

---

## 🌐 Gateway Configuration

The project uses Caddy as a reverse proxy gateway. The `Caddyfile` routes:
- `/` → Next.js (port 3000)
- `/api/coach/*?XTransformPort=3003` → Coach API (port 3003)

**Important:** All API requests use relative paths with `?XTransformPort=3003` query parameter for routing.

---

## 📝 Features

### Coach Dashboard
- ✅ Dashboard overview with stats and revenue
- ✅ Client management (CRUD, approve/reject, export CSV)
- ✅ Workout program builder (weeks → days → exercises)
- ✅ Nutrition plan builder (meals → food items with macros)
- ✅ Progress tracking (weight, body fat, measurements)
- ✅ Session scheduling
- ✅ Payment management (invoices, mark paid)
- ✅ Profile settings & password change
- ✅ Bilingual (Arabic/English) with RTL support

### Client Portal
- ✅ Phone-based login (no password needed)
- ✅ Email + password registration/login
- ✅ Dashboard with overview
- ✅ View assigned workout programs
- ✅ View assigned nutrition plans
- ✅ Track progress (add entries)
- ✅ View upcoming sessions
- ✅ View payment history

### Public Website
- ✅ Landing page with hero, about, services, pricing
- ✅ Testimonials section
- ✅ Contact form
- ✅ FAQ section
- ✅ Social media links
- ✅ Responsive design

---

## 🛠️ Development Commands

```bash
# Install dependencies
npm install        # or bun install

# Start dev server
npm run dev        # or bun run dev

# Build for production
npm run build

# Run linter
npm run lint

# Push Prisma schema to database
npm run db:push    # or npx prisma db push

# Seed main database
bun run seed.ts
```

---

## ⚠️ Important Notes

1. **Two databases:** The main app and coach-api use separate SQLite databases. Make sure both are running.
2. **Mini-service:** The coach-api must be running on port 3003 for the dashboard and client portal to work.
3. **JWT Secrets:** Change the default JWT secrets in production:
   - Coach API: `mini-services/coach-api/src/utils/jwt.ts`
   - Admin auth: `src/lib/auth.ts`
4. **Images:** Client/coach profile images are stored as base64 in the database.
5. **Caddy Gateway:** If not using Caddy, the Next.js app has a fallback proxy at `/api/coach/[...path]`.

---

## 📞 Support

For questions about this project, refer to the code comments and this README.
