# ReDi Invoice App

## Multi-Tenant Billing Platform for CA Firms & Indian SMEs

ReDi Invoice App is a modern billing and invoicing platform built for Chartered Accountant firms and Indian small businesses. The goal behind this project is simple: make invoice management easier, keep business data secure, and provide a reliable foundation that can scale as more organizations join the platform.

The application focuses on three important areas:

* Accurate GST invoice calculations
* Secure separation of business data
* Fast performance even with large invoice volumes

The system is designed as a multi-tenant SaaS platform where multiple organizations can use the same application while keeping their financial data completely isolated.

---

# Architecture & Multi-Tenant Design

## Shared Database, Shared Schema Approach

ReDi uses a shared database and shared schema architecture with a dedicated `tenant_id` column to separate organizations at the data level.

This approach was selected because it provides a good balance between simplicity and scalability.

Instead of maintaining a separate database or schema for every customer, all organizations share the same infrastructure while their data remains logically separated.

### Why this approach?

For an early and growing SaaS product, a shared schema model offers several practical advantages:

* Easier database maintenance
* Faster feature rollouts
* Simple migration management
* Better use of database resources
* Lower infrastructure overhead

As the platform grows, this architecture can continue to scale while keeping operational complexity under control.

---

# Data Security & Tenant Isolation

Security is one of the most important parts of a multi-tenant application.

ReDi does not trust tenant information coming directly from frontend requests.

The tenant context is established at the API entry point using the trusted `x-tenant-id` header.

The request flow works like this:

1. API receives the request.
2. Tenant identity is validated.
3. Tenant context is attached to the request.
4. Database queries automatically run within that tenant scope.

Because every database operation is tenant-aware, one organization cannot access another organization's invoices or records.

For example, if one company tries to request another company's invoice ID, the system will either return no data or reject the operation based on tenant validation.

---

# Database Design

## Neon PostgreSQL Infrastructure

The application uses Neon Serverless PostgreSQL as the primary database solution.

Neon provides a flexible cloud database environment with efficient connection management, making it a strong fit for modern SaaS applications.

Database connections are configured with secure SSL/TLS communication to ensure data is transferred safely between the application and database layer.

---

# Database Structure

The database follows a clean relational structure to keep data organized and maintainable.

## invoices

The `invoices` table stores the main invoice information:

* Organization ownership (`tenant_id`)
* Customer details
* Invoice dates
* Invoice totals
* GST summary values

Stored calculations include:

* Total taxable amount
* Total CGST
* Total SGST
* Final invoice amount

---

## invoice_items

The `invoice_items` table stores individual products or services included in an invoice.

Each item is connected to its parent invoice using `invoice_id`.

This separation keeps the database normalized and makes it easier to:

* Add multiple items per invoice
* Maintain detailed invoice history
* Perform reporting and analysis efficiently

---

# GST Calculation System

The application supports Indian GST billing requirements.

The calculation engine handles:

* Multiple GST slabs
* Item-level GST calculations
* Invoice-level tax summaries
* CGST and SGST distribution

For applicable intra-state transactions, GST is automatically divided equally:

```
CGST = 50%
SGST = 50%
```

This helps businesses and CA professionals generate accurate tax invoices with minimal manual calculation.

---

# Performance Optimization

The invoice dashboard is designed to handle large datasets efficiently.

The system includes optimization strategies for handling 50,000+ invoices.

---

## Composite Database Index

A composite B-Tree index is created on:

```
(tenant_id, created_at DESC, id DESC)
```

This helps the database quickly find invoices belonging to a specific organization and return them in the required order.

Benefits:

* Faster invoice listing
* Reduced database workload
* Better dashboard performance

---

## Cursor-Based Pagination

Traditional pagination using:

```
LIMIT 20 OFFSET 50000
```

becomes slower as the dataset grows because the database still needs to scan previous records.

ReDi uses cursor-based pagination instead.

The API uses:

* `cursorCreatedAt`
* `cursorId`

This provides:

* Consistent loading speed
* Better performance on large datasets
* Smooth scrolling experience
* Fewer duplicate records during live updates

---

# Local Development Setup

## Requirements

Before running the project, make sure you have:

* Node.js v18+
* npm installed
* Terminal access

---

## Install Dependencies

### Backend

```bash
cd backend
npm install
```

### Frontend

```bash
cd frontend
npm install
```

---

# Database Setup

Run the migration and seed script from the backend directory:

```bash
node bin/migrate-and-seed.js
```

This will:

* Create required database tables
* Add performance indexes
* Insert initial organization data
* Prepare the application database

---

# Start the Application

## Backend Server

```bash
cd backend
node server.js
```

Backend runs on:

```
http://localhost:5000
```

---

## Frontend Application

```bash
cd frontend
npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

---

# Future Improvements

The current system provides a strong foundation, but there are several improvements planned for future versions.

## PostgreSQL Row Level Security

Adding PostgreSQL Row Level Security (RLS) would provide another layer of protection by allowing the database itself to enforce tenant boundaries.

This creates a stronger defense model where both the application and database protect customer data.

---

## Better Financial Precision

JavaScript numbers use floating-point representation, which can sometimes create small rounding differences in financial calculations.

For a larger accounting system, future improvements would include:

* Storing currency values in paise
* Using decimal-based calculations
* Adding stricter financial rounding rules

---

## API Idempotency

To handle accidental duplicate submissions caused by network issues, invoice creation APIs can support idempotency keys.

This will help:

* Prevent duplicate invoices
* Improve API reliability
* Create safer user experiences

---

# Built With

* Node.js
* Express.js
* PostgreSQL
* Neon Serverless Database
* React + Vite
* REST APIs

---

# Project Goal

ReDi Invoice App is built with a practical goal: provide Indian businesses and accounting professionals with a simple, secure, and scalable billing solution.

The focus is not only on creating invoices, but on building a reliable SaaS foundation that can support real businesses as they grow.
