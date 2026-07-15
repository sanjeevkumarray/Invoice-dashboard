# ReDi Invoice App

## Multi-Tenant SaaS Billing Engine for CA Firms & Indian SMEs

ReDi Invoice App is a lightweight, production-oriented billing platform designed for Chartered Accountant firms and small-to-medium businesses in India. The system provides reliable invoice management, GST-compliant calculations, and secure multi-tenant data isolation for organizations operating on a shared SaaS infrastructure.

The application is built with scalability, security, and operational efficiency in mind, enabling multiple businesses to securely manage their financial records while maintaining strict separation of organizational data.

---

# Architecture & Multi-Tenancy Model

## Shared Database, Shared Schema Architecture

ReDi follows a **shared database and shared schema multi-tenant architecture**. Each record is securely associated with an organization through a dedicated `tenant_id` column.

### Why This Architecture?

For growing SaaS platforms serving SMEs, this approach provides an excellent balance between scalability, maintainability, and infrastructure efficiency.

Benefits include:

* Simplified database management and migrations
* Efficient resource utilization
* Better connection pooling performance
* Easier monitoring and operational visibility
* Lower infrastructure complexity compared to schema-per-tenant solutions

This model allows the platform to support multiple organizations while maintaining a clean and scalable data structure.

---

# Security & Tenant Data Isolation

Tenant security is enforced at the application data layer.

The system does not rely on tenant information received directly from client requests. Instead:

1. The API gateway validates the incoming organization context.
2. A trusted `x-tenant-id` header is used to establish tenant scope.
3. Database queries automatically apply tenant filtering.
4. Unauthorized cross-organization access attempts return empty results or are blocked.

This ensures that each organization can only access and manage its own invoices, customers, and financial records.

---

# Database Design & Neon PostgreSQL Infrastructure

## Cloud Database Infrastructure

The application uses **Neon Serverless PostgreSQL** as the primary database platform, providing a scalable and developer-friendly relational database environment.

Key infrastructure advantages:

* Serverless PostgreSQL deployment
* Efficient connection pooling
* Secure encrypted database communication
* Flexible scaling for growing workloads

Database connections are secured using SSL/TLS encryption with strict transport requirements to maintain data integrity and confidentiality.

---

# Relational Database Structure

The database follows normalized relational design principles to maintain consistency and scalability.

## `invoices` — Main Invoice Ledger

Stores invoice-level information including:

* Tenant ownership
* Customer details
* Invoice metadata
* Financial summaries

Important fields include:

* `total_net_amount`
* `total_cgst`
* `total_sgst`
* `total_gross_amount`

---

## `invoice_items` — Invoice Line Details

Stores individual invoice products and services.

Features:

* Linked through a strict foreign key relationship
* Maintains detailed item-level tracking
* Supports GST calculations per item
* Follows normalization principles for efficient data management

This structure follows a clean **Third Normal Form (3NF)** approach.

---

# GST Calculation Engine

The application supports Indian GST billing workflows, including:

* Multi-slab GST calculations
* Item-level tax computation
* Automatic CGST/SGST distribution
* Accurate invoice-level aggregation

For intra-state transactions, GST values are automatically distributed using the standard:

```
CGST = 50%
SGST = 50%
```

This simplifies compliance workflows for Indian businesses and accounting professionals.

---

# Performance Optimization for 50,000+ Invoices

The invoice dashboard is optimized to remain fast even with large datasets.

## 1. Composite Database Indexing

A composite B-Tree index is created on:

```
(tenant_id, created_at DESC, id DESC)
```

Benefits:

* Faster tenant-specific searches
* Optimized sorting
* Reduced database scanning
* Improved dashboard response time

The index enables efficient query execution without unnecessary full-table scans.

---

## 2. Cursor-Based Keyset Pagination

Instead of traditional offset pagination:

```
LIMIT 20 OFFSET 50000
```

the application uses cursor-based pagination.

The API uses:

* `cursorCreatedAt`
* `cursorId`

Advantages:

* Consistent performance at any page depth
* Faster loading for large datasets
* Prevents duplicate records during live invoice creation
* Provides smoother infinite scrolling experiences

---

# Local Development Setup

## Prerequisites

Ensure the following are installed:

* Node.js v18 or higher
* npm package manager
* Terminal application

---

# Installation

## Backend Setup

```bash
cd backend
npm install
```

## Frontend Setup

```bash
cd frontend
npm install
```

---

# Database Migration & Initial Setup

To create database tables, indexes, and sample organization data, run:

```bash
cd backend

node bin/migrate-and-seed.js
```

This process will:

* Create required database structures
* Configure performance indexes
* Insert initial tenant data
* Prepare the application environment

---

# Running the Application

Open two terminal windows.

## Backend API Server

```bash
cd backend

node server.js
```

Backend service:

```
http://localhost:5000
```

---

## Frontend Development Server

```bash
cd frontend

npm run dev
```

Frontend application:

```
http://localhost:5173
```

---

# Production Improvement Roadmap

The current architecture provides a strong foundation for a scalable SaaS billing platform. Future enhancements may include:

## Database-Level Row Level Security (RLS)

PostgreSQL native Row Level Security can provide an additional protection layer by enforcing tenant isolation directly inside the database engine.

Example:

```sql
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
```

Benefits:

* Stronger defense-in-depth security
* Reduced dependency on application filters
* Database-enforced access control

---

## High Precision Financial Calculations

For enterprise-grade accounting accuracy, financial calculations can be migrated from JavaScript floating-point numbers to precision-based arithmetic.

Possible improvements:

* Store currency values as integer paise
* Use decimal arithmetic libraries
* Prevent rounding inconsistencies in large calculations

---

## API Idempotency Protection

To prevent duplicate invoice creation during network interruptions, future versions can introduce idempotency keys.

Benefits:

* Prevent duplicate submissions
* Improve API reliability
* Provide safer payment and invoice workflows

---

# Technology Highlights

✅ Multi-tenant SaaS architecture
✅ Secure organization-level data isolation
✅ GST-compliant invoice calculations
✅ Neon Serverless PostgreSQL infrastructure
✅ Optimized large-scale invoice queries
✅ Cursor-based pagination
✅ Normalized relational database design
✅ Scalable foundation for Indian accounting workflows

---

# Project Vision

ReDi Invoice App aims to simplify digital billing for Indian businesses by combining modern SaaS architecture with practical accounting requirements.

The platform is designed to grow from small business deployments into a reliable, secure, and scalable financial management solution.
