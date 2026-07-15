import { Router } from 'express';
import pool from '../config/db.js';

const router = Router();
const VALID_GST_RATES = [0, 5, 12, 18, 28];

router.get('/', async (req, res) => {
  const tenantId = req.headers['x-tenant-id'];
  if (!tenantId) return res.status(400).json({ error: 'Missing x-tenant-id context header' });

  const { limit = 20, cursorCreatedAt, cursorId } = req.query;
  
  try {
    let queryText = `SELECT * FROM invoices WHERE tenant_id = $1`;
    const params = [tenantId];

    if (cursorCreatedAt && cursorId) {
      queryText += ` AND (created_at < $2 OR (created_at = $2 AND id < $3))`;
      params.push(cursorCreatedAt, cursorId);
    }

    queryText += ` ORDER BY created_at DESC, id DESC LIMIT $${params.length + 1}`;
    params.push(parseInt(limit));

    const { rows } = await pool.query(queryText, params);
    return res.json({ invoices: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Database fetch failure' });
  }
});

router.post('/', async (req, res) => {
  const tenantId = req.headers['x-tenant-id'];
  if (!tenantId) return res.status(400).json({ error: 'Missing x-tenant-id context header' });

  const { invoiceNumber, customerName, items } = req.body;
  if (!invoiceNumber || !customerName || !items || !items.length) {
    return res.status(400).json({ error: 'Invalid or missing fields' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    let totalNet = 0;
    let totalCgst = 0;
    let totalSgst = 0;
    let totalGross = 0;
    const processedItems = [];

    for (const item of items) {
      // FIXED: Reading clean properties mapped directly from the incoming payload keys
      const rate = parseFloat(item.gst_rate);
      if (!VALID_GST_RATES.includes(rate)) {
        throw new Error(`Unsupported GST rate: ${rate}%`);
      }

      const qty = parseFloat(item.quantity || 0);
      const price = parseFloat(item.unit_price || 0); 
      
      const netAmount = Number((qty * price).toFixed(2));
      const taxFactor = rate / 100;
      
      const cgstAmount = Number(((netAmount * taxFactor) / 2).toFixed(2));
      const sgstAmount = Number(((netAmount * taxFactor) / 2).toFixed(2));
      const grossAmount = Number((netAmount + cgstAmount + sgstAmount).toFixed(2));

      totalNet += netAmount;
      totalCgst += cgstAmount;
      totalSgst += sgstAmount;
      totalGross += grossAmount;

      processedItems.push({
        description: item.description,
        quantity: qty,
        unitPrice: price,
        netAmount,
        gstRate: rate,
        cgstAmount,
        sgstAmount,
        grossAmount
      });
    }

    const parentInsert = `
      INSERT INTO invoices (tenant_id, invoice_number, customer_name, total_net_amount, total_cgst, total_sgst, total_gross_amount)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id;
    `;
    const parentRes = await client.query(parentInsert, [
      tenantId, invoiceNumber, customerName, totalNet, totalCgst, totalSgst, totalGross
    ]);
    const newInvoiceId = parentRes.rows[0].id;

    const itemInsert = `
      INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, net_amount, gst_rate, cgst_amount, sgst_amount, gross_amount)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
    `;
    for (const pItem of processedItems) {
      await client.query(itemInsert, [
        newInvoiceId, pItem.description, pItem.quantity, pItem.unitPrice,
        pItem.netAmount, pItem.gstRate, pItem.cgstAmount, pItem.sgstAmount, pItem.grossAmount
      ]);
    }

    await client.query('COMMIT');
    return res.status(201).json({ message: 'Invoice generated successfully', id: newInvoiceId });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    return res.status(400).json({ error: err.message || 'Transaction rolled back' });
  } finally {
    client.release();
  }
});

export default router;