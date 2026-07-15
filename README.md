```markdown
# ReDi Invoice App (Multi-Tenant SaaS Engine)

A lightweight, production-ready billing application engineered for CA firms and Indian SMEs. It computes multi-slab GST distributions (50/50 CGST/SGST splits) and enforces absolute data isolation across concurrent corporate accounts.

---

## Architecture & Tenancy Model

### Row-Level Logical Isolation (Shared Database, Shared Schema)
For this implementation, I opted for a **shared database, shared schema** architecture, separating accounts at the data layer using a strict structural `tenant_id` column.

* **Why this approach?** For early-stage multi-tenant SaaS platforms targeting SMEs, a schema-per-tenant architecture introduces massive operational friction (running migrations across hundreds of separate database schemas gets messy fast). Keeping it unified ensures efficient DB connection pooling, keeps resource utilization thin over serverless nodes, and makes cross-organization infrastructure metrics incredibly easy to track.
* **Security Layering:** Tenancy is never trusted from the client payload body. Instead, the application layer pulls a custom header (`x-tenant-id`) at the API gateway entry point to inject context directly into our PostgreSQL queries. If Tenant B attempts to read or mutate Tenant A's sequential identifiers, the query simply returns an empty set or a strict scope mismatch block.

---

## Database Schema & Neon Cloud Infrastructure

### Infrastructure Choice: Neon DB Serverless Postgres
The data tier is deployed on **Neon DB**, utilizing their cloud-native serverless connection pooler framework (`ep-...-pooler`). 
* **SSL/TLS Hardening:** Connections are explicitly forced over secure transport channels using `sslmode=verify-full&channel_binding=require` directly within the pooler connection string, backed by application-level `rejectUnauthorized: false` configs to satisfy connection pooling handshake policies safely.
* **Relational Normalization:** The schema breaks down parent invoice metadata cleanly away from line item specifics:
  * **`invoices` (Parent Ledger):** Captures customer identifiers, tenant context, and high-level aggregations (`total_net_amount`, `total_cgst`, `total_sgst`, `total_gross_amount`).
  * **`invoice_items` (Child Line Aggregates):** Tracks granular item rows mapped back through a strict Foreign Key (`invoice_id`). This satisfies 3NF normalization principles.

### 50,000+ Invoice Scale Optimization
To ensure the primary ledger dashboard endpoint (`GET /api/invoices`) stays fast and responsive under load, I implemented two major performance guardrails:

1. **Composite B-Tree Indexing:** A multi-column index is bound directly on `(tenant_id, created_at DESC, id DESC)`. This drops row evaluation down to an $O(\log N)$ binary search scan instead of hitting slow, full-table scans.
2. **Keyset Pagination (Cursor-Based):** Avoided standard offset pagination (`LIMIT 20 OFFSET 50000`), which causes performance to degrade linearly at deeper page depths because the database engine must scan and discard all preceding records. Instead, our endpoint passes `cursorCreatedAt` and `cursorId`. This guarantees identical query performance whether loading the first page or scrolling past row 50,000+, while preventing duplicate records from showing up if an invoice is created live during active client sessions.

---

## Local Setup & Quickstart

### Prerequisites
* **Node.js** (v18+ recommended)
* A terminal interface

### 1. Dependencies Installation
From the root project directory, install your application dependencies for both workspaces:
```bash
# Setup backend API packages
cd backend
npm install

# Setup frontend workspace packages
cd ../frontend
npm install

```

### 2. Schema Migration & Data Seeding

The application talks directly to our managed Neon DB instances via connection string poolers. To create the clean structural tables, assign composite B-Tree tracking performance indexes, and seed records for both organizations (`org_a_legal` and `org_b_retail`), run the migration binary task:

```bash
# Run from within the /backend directory
node bin/migrate-and-seed.js

```

### 3. Running the Microservices

Spin up your application components using separate terminal tabs:

* **Terminal Path 1 (Backend Gateway Core):**
```bash
cd backend
node server.js

```


*Express server will launch on port `5000`.*
* **Terminal Path 2 (Vite Frontend Workspace):**
```bash
cd frontend
npm run dev

```


*The interactive user interface will serve out at `http://localhost:5173`.*

---

## Technical Trade-offs & Future Engineering Roadmaps

With more development runway, I would roll out the following production extensions:

* **Database Enforced Row-Level Security (RLS):** While application-level checks on incoming headers are completely sound, running native PostgreSQL `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` statements adds an extra layer of defense directly at the database engine level.
* **Arbitrary Precision Arithmetic:** JavaScript handles numeric values as floating-point numbers (`Number`), which can pick up minor precision roundoff bugs over heavy accounting loop iterations. In a major production ledger, I'd swap this logic to pull calculations using integer subunits (storing values as paise rather than rupees) or process variables through an immutable precision suite like `decimal.js`.
* **Network Idempotency Keys:** Network drops often trigger users to click "Submit" multiple times out of frustration. Attaching unique idempotency tokens on the frontend form creation avoids double-posting data to the database.

```

```
