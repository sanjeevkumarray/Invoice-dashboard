import React, { useState, useEffect } from 'react';
import './App.css';

const API_ENDPOINT = 'http://localhost:5000/api/invoices';

function App() {
  const [activeTenant, setActiveTenant] = useState('org_a_legal');
  const [invoices, setInvoices] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [items, setItems] = useState([{ description: '', quantity: 1, unitPrice: 0, gstRate: 18 }]);
  
  // State for printable modal sheet preview
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const loadLedger = async () => {
    try {
      const res = await fetch(API_ENDPOINT, {
        headers: { 'x-tenant-id': activeTenant }
      });
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setInvoices(data);
      } else if (data && data.invoices) {
        setInvoices(data.invoices);
      } else {
        setInvoices([]);
      }
    } catch (err) {
      console.error("Error executing system fetch path", err);
    }
  };

  useEffect(() => {
    loadLedger();
  }, [activeTenant]);

  const handleRowMutation = (idx, property, updatedValue) => {
    const freshRows = [...items];
    freshRows[idx][property] = updatedValue;
    setItems(freshRows);
  };

  const appendBlankRow = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0, gstRate: 18 }]);
  };

  const processFormSubmit = async (e) => {
    e.preventDefault();
    try {
      // Maps exactly to backend schema parameters
      const formattedItems = items.map(item => ({
        description: item.description,
        quantity: parseInt(item.quantity, 10) || 1,
        unit_price: parseFloat(item.unitPrice) || 0,
        gst_rate: parseInt(item.gstRate, 10) || 0 
      }));

      const res = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': activeTenant
        },
        body: JSON.stringify({ 
          invoiceNumber, 
          customerName, 
          items: formattedItems 
        })
      });

      if (res.ok) {
        setInvoiceNumber('');
        setCustomerName('');
        setItems([{ description: '', quantity: 1, unitPrice: 0, gstRate: 18 }]);
        loadLedger();
        alert('Transaction committed successfully.');
      } else {
        const errorBody = await res.json();
        alert(`Validation Error: ${errorBody.error || 'Check server logs.'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to connect to the backend server.');
    }
  };

  const triggerPrint = () => {
    window.print();
  };

  return (
    <div className="dashboard-layout">
      {/* Structural Left Navigation Sidebar Panel */}
      <aside className="sidebar no-print">
        <div className="brand">
          <h2>ClearBooks Engine</h2>
          <span>Enterprise Accounting</span>
        </div>
        
        <div className="tenant-selector-box">
          <label>Active Organization</label>
          <select className="modern-select" value={activeTenant} onChange={(e) => setActiveTenant(e.target.value)}>
            <option value="org_a_legal">Alpha Corp Services</option>
            <option value="org_b_retail">Beta Retail Ventures</option>
          </select>
        </div>
      </aside>

      {/* Main Execution Workspace Panel */}
      <main className="main-content">
        <header className="page-header no-print">
          <h1>Invoicing Core Matrix</h1>
          <p>Create, manage, and calculate transactional cross-tenant outward ledger files.</p>
        </header>

        {/* Invoice Creation Form Component */}
        <section className="premium-card no-print">
          <h3>Draft New Inbound Entry</h3>
          <form onSubmit={processFormSubmit}>
            <div className="meta-grid">
              <div className="input-container">
                <label>Invoice Token String</label>
                <input type="text" className="modern-input" placeholder="e.g., INV-026" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} required />
              </div>
              <div className="input-container">
                <label>Debtor Customer Legal Name</label>
                <input type="text" className="modern-input" placeholder="Legal Entity Name" value={customerName} onChange={e => setCustomerName(e.target.value)} required />
              </div>
            </div>

            <h4>Line Items Configuration Matrix</h4>
            <div className="matrix-headers">
              <div>Particulars / Specifications</div>
              <div>Qty</div>
              <div>Rate (INR)</div>
              <div>Tax Bracket</div>
            </div>

            <div className="matrix-rows-container">
              {items.map((row, index) => (
                <div key={index} className="matrix-row">
                  <input type="text" className="modern-input" placeholder="Item description" value={row.description} onChange={e => handleRowMutation(index, 'description', e.target.value)} required />
                  
                  <input type="number" className="modern-input" placeholder="1" value={row.quantity} 
                    onChange={e => handleRowMutation(index, 'quantity', parseInt(e.target.value, 10) || '')} required />
                  
                  <input type="number" className="modern-input" placeholder="0.00" value={row.unitPrice} 
                    onChange={e => handleRowMutation(index, 'unitPrice', parseFloat(e.target.value) || '')} required />
                  
                  <select className="modern-input" value={row.gstRate} 
                    onChange={e => handleRowMutation(index, 'gstRate', parseInt(e.target.value, 10) || 0)}>
                    <option value={0}>0% Rate Category</option>
                    <option value={5}>5% Standard Low</option>
                    <option value={12}>12% Intermediate</option>
                    <option value={18}>18% Standard Tier</option>
                    <option value={28}>28% Luxury Bracket</option>
                  </select>
                </div>
              ))}
            </div>

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={appendBlankRow}>+ Append Line Element</button>
              <button type="submit" className="btn-submit">Execute Post Transaction</button>
            </div>
          </form>
        </section>

        {/* Dynamic Ledger Table Area */}
        <section className="premium-card">
          <h3 className="no-print">Isolated General Ledger Matrix</h3>
          <div className="table-wrapper no-print">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Invoice Identifier</th>
                  <th>Customer Client</th>
                  <th>Net Base Valuation</th>
                  <th>CGST (50%)</th>
                  <th>SGST (50%)</th>
                  <th>Gross Value (Total)</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No historical operations mapped for this tenant index.</td></tr>
                ) : (
                  invoices.map((dataRow) => (
                    <tr key={dataRow.id}>
                      <td><span className="badge">{dataRow.invoice_number}</span></td>
                      <td>{dataRow.customer_name}</td>
                      <td>₹{parseFloat(dataRow.total_net_amount).toFixed(2)}</td>
                      <td>₹{parseFloat(dataRow.total_cgst).toFixed(2)}</td>
                      <td>₹{parseFloat(dataRow.total_sgst).toFixed(2)}</td>
                      <td className="valuation-highlight">₹{parseFloat(dataRow.total_gross_amount).toFixed(2)}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button 
                          type="button" 
                          className="action-pdf-btn"
                          onClick={() => setSelectedInvoice(dataRow)}
                        >
                          📄 View PDF
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Printable Print Preview Document Backdrop */}
      {selectedInvoice && (
        <div className="invoice-modal-backdrop">
          <div className="invoice-modal-container">
            <div className="modal-header-actions no-print">
              <button className="btn-secondary" onClick={() => setSelectedInvoice(null)}>✕ Close Preview</button>
              <button className="btn-submit" onClick={triggerPrint}>🖨️ Print / Save PDF</button>
            </div>
            
            <div id="printable-invoice-document" className="invoice-document-sheet">
              <div className="doc-header">
                <div className="company-details">
                  <h1 className="logo-text">TAX INVOICE</h1>
                  <p className="org-title">
                    <strong>Vendor:</strong> {activeTenant === 'org_a_legal' ? 'Alpha Corporate Services Ltd.' : 'Beta Retail Ventures Pvt. Ltd.'}
                  </p>
                  <p className="meta-text">Corporate ID Reference: {activeTenant.toUpperCase()}</p>
                </div>
                <div className="invoice-meta-block">
                  <p><strong>INVOICE NO:</strong> {selectedInvoice.invoice_number}</p>
                  <p><strong>DATE:</strong> {new Date(selectedInvoice.created_at || Date.now()).toLocaleDateString('en-IN')}</p>
                </div>
              </div>

              <hr className="doc-divider" />

              <div className="billing-address-section">
                <h3>BILLED TO:</h3>
                <p className="client-name">{selectedInvoice.customer_name}</p>
              </div>

              <table className="doc-items-table">
                <thead>
                  <tr>
                    <th>Description of Service</th>
                    <th style={{ textAlign: 'right' }}>Base Amount</th>
                    <th style={{ textAlign: 'right' }}>CGST</th>
                    <th style={{ textAlign: 'right' }}>SGST</th>
                    <th style={{ textAlign: 'right' }}>Gross Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Consolidated Account Deliverables & Software Operations</td>
                    <td style={{ textAlign: 'right' }}>₹{parseFloat(selectedInvoice.total_net_amount).toFixed(2)}</td>
                    <td style={{ textAlign: 'right' }}>₹{parseFloat(selectedInvoice.total_cgst).toFixed(2)}</td>
                    <td style={{ textAlign: 'right' }}>₹{parseFloat(selectedInvoice.total_sgst).toFixed(2)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold' }}>₹{parseFloat(selectedInvoice.total_gross_amount).toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>

              <div className="doc-totals-summary">
                <div className="empty-spacing"></div>
                <div className="totals-key-value">
                  <div className="total-row">
                    <span>Taxable Net Value:</span>
                    <span>₹{parseFloat(selectedInvoice.total_net_amount).toFixed(2)}</span>
                  </div>
                  <div className="total-row">
                    <span>Central GST (CGST):</span>
                    <span>₹{parseFloat(selectedInvoice.total_cgst).toFixed(2)}</span>
                  </div>
                  <div className="total-row">
                    <span>State GST (SGST):</span>
                    <span>₹{parseFloat(selectedInvoice.total_sgst).toFixed(2)}</span>
                  </div>
                  <hr className="subtotal-divider" />
                  <div className="total-row grand-total">
                    <span>Grand Total (INR):</span>
                    <span>₹{parseFloat(selectedInvoice.total_gross_amount).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="doc-footer-declaration">
                <p><strong>Declarations:</strong> This is a computer-generated digital tax receipt requiring no physical signature. Isolated secure over Neon structures.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;