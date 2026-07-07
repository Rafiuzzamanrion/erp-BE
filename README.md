# ERP Backend

Express + TypeScript + MongoDB API server. Modular monolith architecture with JWT auth, dynamic RBAC, file uploads to Cloudinary, and a reusable query builder for paginated list endpoints.

## Architecture

Every domain (products, sales, categories, users, roles, dashboard) is a self-contained module:

```
module/
  model.ts        — Mongoose schema, indexes, middleware hooks
  schema.ts       — Zod validation schemas (body, params, query)
  types.ts        — TypeScript types inferred from Zod
  service.ts      — business logic, database operations
  controller.ts   — request/response handling
  route.ts        — route definitions, middleware composition, Swagger docs
```

Shared code lives under `common/` — the query builder, API response and error utilities, Cloudinary upload helper, HTTP status constants, and the async handler wrapper. Middleware under `middlewares/` covers auth, RBAC, Zod validation, and file uploads via multer.

## Database

MongoDB with Mongoose. Every collection has targeted indexes — the ones that matter most are on `stockQuantity` (product model, for the dashboard low-stock aggregation), `category` (product model, for filter dropdowns), `soldBy` (sale model, for populate joins), and `items.product` (sale model, for the dashboard's `$lookup` aggregation). Text indexes on product and category models support the regex search in the query builder.

Transactions are used for sale creation — stock validation and deduction happen atomically. If a product doesn't exist or has insufficient stock, everything rolls back.

## Query Builder

Located at `common/utils/queryBuilder.ts`. A chainable class that wraps Mongoose queries:

```ts
new QueryBuilder<Product>(Product, query)
  .search(["name", "sku", "category"])   // $regex across fields
  .filter(["category"])                   // exact match on reserved keys
  .sort("-createdAt")                     // default sort direction
  .select("name sku price stock")         // field projection
  .paginate(page, limit)                  // skip/limit + countDocuments
  .execute()                              // returns { data, meta }
```

The search method escapes special regex characters and builds a case-insensitive `$or` across the specified fields. The filter method strips reserved keys (`search`, `sort`, `page`, `limit`) from the filter object so they don't leak into the database query. The paginate response includes `page`, `limit`, `total`, and `totalPages` in the meta object.

## Caching

Dashboard stats have a 30-second in-memory TTL — the most-hit endpoint avoids running 6+ aggregation pipelines on every request. The RBAC middleware caches role permissions for 60 seconds, avoiding a `Role.findById().populate()` on every authenticated request. The cache is invalidated when roles are updated or deleted through the role service.

## Setup

```bash
yarn install
cp .env.example .env
yarn seed
yarn dev
```

Runs on port 5000. Swagger at `/api-docs`. All endpoints are versioned under `/api/v1`.

**Required env vars:** `MONGODB_URI`, `JWT_SECRET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`. See `.env.example` for optional ones.

**Scripts:** `yarn dev` (hot reload), `yarn build` (compile), `yarn seed` (populate DB), `yarn test`, `yarn typecheck`, `yarn lint`.

## Vercel

`vercel.json` builds the project as a serverless function under `api/index.js`. Required env vars in the Vercel dashboard: `MONGODB_URI`, `JWT_SECRET`, `NODE_ENV=production`, and Cloudinary keys. `CLIENT_URL` supports multiple comma-separated origins so preview deployments don't get CORS errors. After deploying, run `yarn seed` against the same `MONGODB_URI` to create the admin user, then confirm `GET /api/v1/health` returns `adminSeeded: true`.
