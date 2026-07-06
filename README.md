# Mini ERP — Inventory & Sales Management System

A production-grade, full-stack ERP application with JWT authentication, role-based access control, product management with Cloudinary image upload, a transactional sales workflow with automatic stock deduction, and a real-time statistics dashboard.

## Tech Stack

| Layer | Technologies |
|---|---|
| **Backend** | Node.js, Express, TypeScript, MongoDB (Mongoose), JWT, Cloudinary, Zod, Swagger |
| **Frontend** | React (Vite), TypeScript, Tailwind CSS, Shadcn UI, Redux Toolkit (RTK Query), React Hook Form, Framer Motion, Socket.IO |
| **Validation** | Zod (shared schemas — backend + frontend form validation) |
| **Real-time** | Socket.IO (low-stock alerts on Dashboard) |

## Prerequisites

- **Node.js** >= 18
- **Yarn**
- **MongoDB** — local instance or [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (Atlas required for the transactional sales feature, as MongoDB transactions need a replica set)
- **Cloudinary** account ([free tier](https://cloudinary.com/)) — for product image uploads

## Project Structure

```
├── erp-BE/          # Backend (Express + TypeScript + MongoDB)
└── erp-FE/          # Frontend (React + TypeScript + Tailwind)
```

## Quick Start

### 1. Backend Setup

```bash
cd erp-BE

# Install dependencies
yarn install

# Copy environment variables
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, and Cloudinary credentials

# Seed the database (creates admin user, roles, permissions, sample products)
yarn seed

# Start development server
yarn dev
```

Backend runs on `http://localhost:5000`.

### 2. Frontend Setup

```bash
cd erp-FE

# Install dependencies
yarn install

# Create env file
echo VITE_API_URL=http://localhost:5000/api/v1 > .env

# Start development server
yarn dev
```

Frontend runs on `http://localhost:5173`.

### 3. Login

| Email | Password |
|---|---|
| `admin@erp.com` | `Admin@123` |

## Environment Variables

### Backend (`erp-BE/.env`)

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port (default: 5000) |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret key for JWT signing |
| `JWT_EXPIRES_IN` | No | Token expiry (default: 1d) |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret |
| `CLIENT_URL` | No | Frontend URL for CORS (default: http://localhost:5173) |
| `NODE_ENV` | No | Environment (development/production) |

### Frontend (`erp-FE/.env`)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | No | Backend API base URL (default: http://localhost:5000/api/v1) |

## Seed Script

```bash
cd erp-BE
yarn seed
```

Creates:
- **9 permissions** (product:create, product:update, product:delete, product:view, sale:create, sale:view, user:manage, role:manage, dashboard:view)
- **3 roles** (Admin, Manager, Employee) with appropriate permissions
- **1 admin user** (`admin@erp.com` / `Admin@123`)
- **10 sample products** across 5 categories

## API Documentation

**Swagger UI**: `http://localhost:5000/api-docs` (available when backend is running)

All endpoints are versioned under `/api/v1/` and documented with:
- Request/response schemas
- Authentication requirements
- Role/permission requirements
- Example success and error responses

## Available Scripts

### Backend

| Script | Description |
|---|---|
| `yarn dev` | Start development server with hot reload |
| `yarn build` | Compile TypeScript to JavaScript |
| `yarn start` | Run compiled production build |
| `yarn seed` | Seed database with initial data |
| `yarn lint` | Run ESLint |
| `yarn format` | Format code with Prettier |
| `yarn typecheck` | TypeScript type checking |
| `yarn test` | Run Jest tests |

### Frontend

| Script | Description |
|---|---|
| `yarn dev` | Start Vite development server |
| `yarn build` | Production build |
| `yarn preview` | Preview production build |
| `yarn lint` | Run ESLint |

## Roles & Permissions

| Action | Admin | Manager | Employee |
|---|---|---|---|
| Manage Users & Roles | ✓ | ✗ | ✗ |
| Create/Update/Delete Products | ✓ | ✓ | ✗ |
| View Products | ✓ | ✓ | ✓ |
| Create Sales | ✓ | ✓ | ✓ |
| View Sales History | ✓ | ✓ | ✓ |
| View Dashboard | ✓ | ✓ | ✓ |

The system implements **dynamic RBAC** — roles and permissions are stored in the database and can be managed via the API. The middleware resolves permissions from the database with an in-memory cache (60s TTL) to avoid DB hits on every request.

## Deployment

### Backend (Render / Railway)

1. Create a new web service
2. Build command: `cd erp-BE && yarn install && yarn build`
3. Start command: `cd erp-BE && yarn start`
4. Set all environment variables from `.env.example`
5. Health check path: `/api/v1/health`

### Frontend (Vercel / Netlify)

1. Connect the `erp-FE/` directory as the project root
2. Build command: `yarn build`
3. Publish directory: `dist`
4. Set environment variable: `VITE_API_URL` = your deployed backend URL + `/api/v1`
5. Enable SPA fallback (all routes → `index.html`)

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed design decisions.
