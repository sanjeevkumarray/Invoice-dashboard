DROP TABLE IF EXISTS invoice_items;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS tenants;

CREATE TABLE tenants (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    invoice_number VARCHAR(50) NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    total_net_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_cgst NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_sgst NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_gross_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_tenant_invoice UNIQUE (tenant_id, invoice_number)
);

CREATE TABLE invoice_items (
    id SERIAL PRIMARY KEY,
    invoice_id INT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description VARCHAR(255) NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL,
    net_amount NUMERIC(12, 2) NOT NULL,
    gst_rate NUMERIC(5, 2) NOT NULL CHECK (gst_rate IN (0.00, 5.00, 12.00, 18.00, 28.00)),
    cgst_amount NUMERIC(12, 2) NOT NULL,
    sgst_amount NUMERIC(12, 2) NOT NULL,
    gross_amount NUMERIC(12, 2) NOT NULL
);

CREATE INDEX idx_invoices_tenant_pagination ON invoices (tenant_id, created_at DESC, id DESC);