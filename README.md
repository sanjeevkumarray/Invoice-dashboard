# ReDi Invoice App

## Multi-Tenant Billing Platform for CA Firms & Indian SMEs

ReDi Invoice App is a modern SaaS billing platform designed for Chartered Accountant firms and Indian small businesses.

The purpose of this project is simple — provide businesses with an easy way to create and manage invoices while maintaining strong data security, GST compliance, and a scalable architecture that can support multiple organizations.

The platform is built around three core principles:

* Accurate GST invoice calculations
* Complete organization-level data isolation
* Reliable performance at scale

ReDi follows a multi-tenant SaaS model where multiple businesses can use the same platform while keeping their financial records completely separated.

---

# Key Features

✅ Multi-tenant organization support
✅ Secure tenant-level data isolation
✅ GST invoice calculations with CGST/SGST split
✅ Invoice and line-item management
✅ Optimized invoice listing for large datasets
✅ Cursor-based pagination
✅ PostgreSQL relational database design
✅ Cloud-ready SaaS architecture

---

# Live Preview

### Dashboard View

<img width="1912" height="882" alt="Dashboard Preview" src="https://github.com/user-attachments/assets/b988dd9e-3b9d-4bba-9add-34c070145816" />

### Invoice Management

<img width="1651" height="857" alt="Invoice Management Preview" src="https://github.com/user-attachments/assets/809d42f6-2494-4e37-b41c-380380d115fe" />

### Billing Interface

<img width="1911" height="862" alt="Billing Interface Preview" src="https://github.com/user-attachments/assets/3e036117-b32e-4201-89e6-77d10294901d" />

---

# Architecture & Multi-Tenant Design

## Shared Database, Shared Schema Model

ReDi uses a shared database and shared schema architecture with a dedicated `tenant_id` column to maintain organization-level separation.

This approach provides a practical balance between scalability, maintainability, and infrastructure simplicity.

Instead of maintaining separate databases or schemas for every customer, all organizations use the same infrastructure while their data remains logically isolated.

## Why This Architecture?

For an early-stage SaaS product, this model provides several advantages:

* Easier database management
* Faster deployment and migrations
* Efficient resource utilization
* Simplified monitoring
* Lower infrastructure complexity

This architecture allows the platform to grow without introducing unnecessary operational overhead.

---

# Security & Tenant Isolation

Data isolation is a critical requirement for any multi-tenant platform.

ReDi does not rely on tenant information provided directly from frontend requests.

Tenant context is established at the API entry layer using the trusted:

```
x-tenant-id
```

header.

Request flow:

1. API receives the request.
2. Tenant identity is validated.
3. Tenant context is attached to the request lifecycle.
4. Database queries execute within the correct tenant scope.

Every database operation is tenant-aware, ensuring one organization cannot access another organization's invoices or business records.

---

# Database Infrastructure

## Neon PostgreSQL

ReDi uses Neon Serverless PostgreSQL as the primary database platform.

Neon provides a flexible cloud-native PostgreSQL environment with efficient connection handling, making it suitable for modern SaaS applications.

Database communication is secured using SSL/TLS encryption to ensure safe data transfer between application services and the database layer.

---

# Database Design

The database follows a normalized relational structure to maintain consistency and scalability.

## invoices

The `invoices` table stores invoice-level information:

* Tenant ownership
* Customer details
* Invoice metadata
* Financial totals
* GST summaries

Stored values include:

* Total taxable amount
* Total CGST
* Total SGST
* Final invoice amount

---

## invoice_items

The `invoice_items` table stores individual products and services inside an invoice.

Each item is connected to the parent invoice using:

```
invoice_id
```

This structure provides:

* Better data organization
* Easier reporting
* Flexible invoice item management
* Clean relational design

---

# GST Calculation Engine

ReDi supports Indian GST billing workflows with:

* Multiple GST slabs
* Item-level tax calculation
* Invoice-level tax summaries
* Automatic CGST and SGST distribution

For applicable intra-state transactions:

```
CGST = 50%
SGST = 50%
```

This reduces manual calculations and helps CA professionals generate accurate invoices efficiently.

---

# Performance Optimization

The invoice dashboard is designed to handle large datasets efficiently, including 50,000+ invoice records.

## Composite Database Indexing

A composite B-Tree index is created on:

```
(tenant_id, created_at DESC, id DESC)
```

This improves:

* Tenant-specific invoice lookup
* Sorting performance
* Dashboard response time
* Database query efficiency

---

## Cursor-Based Pagination

Traditional offset pagination:

```
LIMIT 20 OFFSET 50000
```

becomes slower as datasets grow because the database must scan and skip previous records.

ReDi uses cursor-based pagination with:

* `cursorCreatedAt`
* `cursorId`

Benefits:

* Stable performance on large datasets
* Faster scrolling
* Reduced duplicate records
* Better handling of live data updates

---

# Local Development Setup

## Requirements

Before starting the project:

* Node.js v18+
* npm
* Terminal access

---

# Installation

## Backend

```bash
cd backend
npm install
```

## Frontend

```bash
cd frontend
npm install
```

---

# Database Setup

Run migrations and seed initial data:

```bash
cd backend

node bin/migrate-and-seed.js
```

This will:

* Create database tables
* Configure indexes
* Insert sample organizations
* Prepare the development database

---

# Running the Application

## Backend API

```bash
cd backend

node server.js
```

Runs on:

```
http://localhost:5000
```

---

## Frontend

```bash
cd frontend

npm run dev
```

Runs on:

```
http://localhost:5173
```

---

# Future Improvements

## PostgreSQL Row Level Security (RLS)

Future versions can introduce PostgreSQL Row Level Security to enforce tenant isolation directly at the database level.

This provides an additional security layer where both the application and database protect customer data.

---

## Financial Precision Improvements

JavaScript floating-point calculations can introduce small rounding differences.

For a production accounting system, future improvements include:

* Storing amounts as paise
* Using decimal arithmetic libraries
* Implementing stricter rounding rules

---

## API Idempotency

Adding idempotency keys for invoice creation will help prevent duplicate invoices caused by:

* Network interruptions
* Accidental multiple submissions
* Client retries

This improves reliability for business-critical workflows.

---

# Technology Stack

* Node.js
* Express.js
* React
* Vite
* PostgreSQL
* Neon Serverless Database
* REST APIs

---

# Project Vision

ReDi Invoice App is built to simplify billing workflows for Indian businesses and accounting professionals.

The focus is not only on generating invoices, but on creating a secure and scalable SaaS foundation that can grow with real-world business requirements.
