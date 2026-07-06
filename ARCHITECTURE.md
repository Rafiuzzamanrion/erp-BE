# Architecture — Mini ERP

## High-Level Architecture

Monorepo with two self-contained applications communicating via REST API (JSON) over HTTP:

```
┌─────────────────────────────────────────────────────────┐
│  erp-FE (React + Vite + Tailwind + Shadcn UI)          │
│  Port 5173                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐ │
│  │ Auth     │ │ Products │ │ Sales    │ │ Dashboard │ │
│  │ Feature  │ │ Feature  │ │ Feature  │ │ Feature   │ │
│  └──────────┘ └──────────┘ └──────────┘ └───────────┘ │
│       │             │             │             │        │
│       └─────────────┴──────┬──────┴─────────────┘       │
│                            │                            │
│                   RTK Query (fetchBaseQuery)            │
└────────────────────────────┼────────────────────────────┘
                             │ HTTP + JSON
                             │ JWT Bearer Token
┌────────────────────────────┼────────────────────────────┐
│  erp-BE (Express + TypeScript + MongoDB)                │
│  Port 5000                                              │
│                            │                            │
│  ┌─────────┐ ┌─────────┐ ┌─┴───────┐ ┌───────────┐    │
│  │ Auth    │ │ Products│ │ Sales   │ │ Dashboard │    │
│  │ Module  │ │ Module  │ │ Module  │ │ Module    │    │
│  └─────────┘ └─────────┘ └─────────┘ └───────────┘    │
│       │             │             │             │        │
│       └─────────────┴──────┬──────┴─────────────┘       │
│                            │                            │
│                   Mongoose (ODM)                        │
│                            │                            │
│                      MongoDB                            │
└─────────────────────────────────────────────────────────┘
```

## Backend — Modular Monolith

The backend is organized as **independent feature modules** rather than layer-by-type folders. Each module owns:

```
auth/
├── auth.route.ts       # Express Router — defines endpoints
├── auth.schema.ts      # Zod schemas — request validation rules
├── auth.types.ts       # TypeScript types inferred from Zod schemas
├── auth.controller.ts  # Thin req/res layer — parses input, calls service, returns response
└── auth.service.ts     # Business logic + database access
```

**Key design rules:**
- No module reaches into another module's internals
- Cross-module interaction happens through **exported service functions** only
- Every module follows the same file naming convention (consistency)
- Modules that own a Mongoose model add `*.model.ts`

**Request flow:**
```
Request → Route → Middleware Chain (auth → rbac → validate → upload) → Controller → Service → Model/External API
```

**Common layer** (`src/common/`):
- `ApiResponse` / `ApiError` — consistent response envelope for all endpoints
- `asyncHandler` — wraps controllers, forwarding thrown errors to `next()`
- `QueryBuilder` — reusable class for search/filter/sort/paginate (used by Products and Sales)
- `cloudinaryUpload` — helper for server-side Cloudinary image upload/disposal via upload_stream

**Middleware chain** (`src/middlewares/`):
1. `authenticate` — extracts Bearer token, verifies JWT, attaches `req.user`
2. `authorize(roles)` / `requirePermission(permKey)` — RBAC enforcement
3. `validate(schema)` — runs Zod schema against body/params/query
4. `upload.single('image')` — Multer memory storage for product image upload

## RBAC Design

The system implements **dynamic, database-driven role-based access control**:

```
User ──belongs to──▶ Role ──has many──▶ Permission
                       │
              ┌────────┼────────┐
              │        │        │
           Admin    Manager  Employee
           (all)   (product  (view products,
                    CRUD +    create sales,
                    sales +   view dashboard)
                    dashboard)
```

**Permission model:** `{ key: "product:create", description: "..." }`

**Role model:** `{ name: "Admin", permissions: [...ObjectId] }`

**Middleware resolution:**
1. `requirePermission("product:create")` reads `req.user.role` (ObjectId → Role)
2. Looks up the role's permissions from an **in-memory cache** (Map with 60s TTL)
3. If the cache is cold, fetches from MongoDB (`.populate('permissions')`)
4. Returns 403 if the required permission key is not found

**Static fallback:** `authorize('admin', 'manager')` checks against the role name string — useful as a simpler alternative; documented in the code but not used by default.

## Redux Toolkit Organization

All state management uses **Redux Toolkit only** — no React Query, Zustand, or other state libraries.

### RTK Query (Server Data)

```typescript
// Each feature has its own API injection into a single root API slice:

authApi.ts     → login, getMe
productApi.ts  → getProducts, getProduct, createProduct, updateProduct, deleteProduct
saleApi.ts     → createSale, getSales, getSale
dashboardApi.ts → getStats
```

**Cache invalidation:** Uses `tagTypes` + `providesTags`/`invalidatesTags`:
- Creating/updating/deleting a Product invalidates `["Product"]` → the product list auto-refetches
- Creating a Sale invalidates `["Sale", "Product", "Dashboard"]` → sales history, product stock counts, and dashboard stats all refresh

### Plain Redux Slices (Client-Only State)

```typescript
authSlice   → { token, user, isAuthenticated }  // persisted to localStorage
uiSlice     → { sidebarCollapsed, theme }        // theme persisted to localStorage
```

### HTTP Layer

`lib/baseQuery.ts` is the single HTTP configuration point:
- Sets base URL from `VITE_API_URL` env var
- Attaches `Authorization: Bearer <token>` header from Redux auth state
- On 401 response: dispatches `logout()`, redirects to `/login`

## Validation Strategy

**Zod as single source of truth:**
1. Backend defines Zod schemas in each module's `*.schema.ts`
2. TypeScript types are inferred from schemas in `*.types.ts` (`z.output<typeof schema>`)
3. Frontend mirrors critical schemas (login, product form, sale form) for React Hook Form + Zod form validation
4. Backend validates all inputs via `validate(schema)` middleware before controller execution
5. Validation never drifts apart — schemas drive both validation and types

## Image Upload Flow

```
Client (multipart/form-data)
    │
    ▼
Express /products endpoint
    │
    ▼
Multer middleware (memoryStorage)
    │
    ▼
product.service.ts → cloudinaryUpload.ts
    │
    ▼
Cloudinary SDK (upload_stream)
    │
    ▼
{ secure_url, public_id } → stored on Product document
```

**Key rules:**
- Frontend never talks to Cloudinary directly
- Cloudinary API credentials never leave the server
- Old Cloudinary assets are deleted when a product image is replaced or the product is deleted (Mongoose pre-hook)

## Sales Atomicity

The sale creation flow runs inside a **MongoDB transaction** (`mongoose.startSession()` + `session.withTransaction()`):

1. For each item: fetch product, verify it exists and has sufficient stock
2. Snapshot `unitPrice` = product's current `sellingPrice`
3. Atomically decrement `product.stockQuantity`
4. Compute `grandTotal` from all subtotals
5. Persist the Sale document

**If any item fails validation, the entire transaction aborts — no partial stock deduction ever occurs.** This requires MongoDB running as a replica set (Atlas provides this by default).

## Real-Time (Socket.IO)

```
Sale created → product.stockQuantity < 5
    │
    ▼
Server emits: io.emit('stock:low', { productId, name, sku, stockQuantity })
    │
    ▼
Dashboard page (subscribed) → invalidates RTK Query cache → low-stock list updates live
```

Socket.IO authentication: the client passes the JWT token in the handshake (`auth.token`), which the server verifies before allowing the connection.

## Frontend Component Architecture

Every page has three designed states:
1. **Loading** — page-matched Skeleton component (e.g., `DashboardSkeleton`, `ProductTableSkeleton`)
2. **Empty** — shared animated `NoDataFound` component (Framer Motion) with icon, title, description, optional CTA
3. **Error** — inline message + retry action

All UI primitives (buttons, inputs, dialogs, tables, badges, etc.) are built with Shadcn UI + Tailwind CSS. All animations use Framer Motion with shared variant definitions from `lib/motion.ts`.
