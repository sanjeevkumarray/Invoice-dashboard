INSERT INTO tenants (id, name) VALUES 
('org_a_legal', 'Alpha Corporate Services'),
('org_b_retail', 'Beta Retail Ventures')
ON CONFLICT (id) DO NOTHING;

INSERT INTO invoices (id, tenant_id, invoice_number, customer_name, total_net_amount, total_cgst, total_sgst, total_gross_amount, created_at)
VALUES (1001, 'org_a_legal', 'INV-2026-001', 'Acme Corporation', 1000.00, 90.00, 90.00, 1180.00, '2026-07-15 10:00:00+00')
ON CONFLICT DO NOTHING;

INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, net_amount, gst_rate, cgst_amount, sgst_amount, gross_amount)
VALUES (1001, 'Premium Consulting Services', 1, 1000.00, 1000.00, 18.00, 90.00, 90.00, 1180.00)
ON CONFLICT DO NOTHING;