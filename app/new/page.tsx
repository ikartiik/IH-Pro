'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DocuVaultLayout from '@/components/DocuVaultLayout';

interface Company {
  id: string;
  name: string;
  currency?: string;
}

interface DocumentType {
  id: string;
  label: string;
  icon: string;
  sub: string;
}

interface Item {
  desc: string;
  qty: number;
  unit: string;
  rate: number;
  tax: number;
  disc: number;
}

const DOC_TYPES: DocumentType[] = [
  { id: 'Invoice', label: 'Invoice', icon: '🧾', sub: 'Tax / commercial invoice' },
  { id: 'PI', label: 'Proforma Invoice', icon: '📋', sub: 'Pre-sale estimate' },
  { id: 'SO', label: 'Sales Order', icon: '📦', sub: 'Confirm a sale' },
  { id: 'PO', label: 'Purchase Order', icon: '🛒', sub: 'Order from supplier' },
  { id: 'DN', label: 'Delivery Note', icon: '🚚', sub: 'Goods dispatch note' },
  { id: 'Quote', label: 'Quotation', icon: '💬', sub: 'Price quotation' },
  { id: 'Credit Note', label: 'Credit Note', icon: '↩️', sub: 'Refund / correction' },
  { id: 'Receipt', label: 'Receipt', icon: '✅', sub: 'Payment receipt' },
  { id: 'Statement', label: 'Statement', icon: '📊', sub: 'Account statement' },
];

const CURRENCIES = ['USD', 'AED', 'EUR', 'GBP', 'SAR', 'INR', 'SGD', 'AUD', 'CAD', 'JPY'];
const STATUSES = ['draft', 'sent', 'pending', 'paid', 'overdue', 'cancelled'];

export default function NewDocument() {
  const [step, setStep] = useState(1);
  const [docType, setDocType] = useState('Invoice');
  const [template, setTemplate] = useState('classic');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [activeCompany, setActiveCompany] = useState<string | null>(null);
  const [items, setItems] = useState<Item[]>([{ desc: '', qty: 1, unit: 'pcs', rate: 0, tax: 0, disc: 0 }]);
  const [formData, setFormData] = useState({
    number: '',
    date: '',
    dueDate: '',
    currency: 'USD',
    clientName: '',
    clientAddress: '',
    clientEmail: '',
    clientPhone: '',
    clientTax: '',
    ref: '',
    notes: '',
    terms: 'Payment due within 30 days.',
    discount: 0,
    status: 'draft',
    bank: '',
    iban: '',
    swift: ''
  });
  const router = useRouter();

  useEffect(() => {
    // Load companies and set initial data
    const savedCompanies = localStorage.getItem('dv2025_companies');
    const savedActive = localStorage.getItem('dv2025_activeCompany');

    if (savedCompanies) {
      const parsed = JSON.parse(savedCompanies);
      setCompanies(parsed);
      if (savedActive && parsed.find((c: Company) => c.id === savedActive)) {
        setActiveCompany(savedActive);
      }
    }

    // Set initial form data
    const today = new Date().toISOString().split('T')[0];
    const activeCo = companies.find(c => c.id === activeCompany);
    const number = generateDocNumber(docType);

    setFormData(prev => ({
      ...prev,
      number,
      date: today,
      currency: activeCo?.currency || 'USD'
    }));
  }, [companies, activeCompany, docType]);

  const generateDocNumber = (type: string) => {
    const prefix = { Invoice: 'INV', PI: 'PI', SO: 'SO', PO: 'PO', DN: 'DN', Quote: 'QT', 'Credit Note': 'CN', Receipt: 'RCP', Statement: 'STM' }[type] || 'DOC';
    const year = new Date().getFullYear();
    // For now, just use a simple counter. In real app, this would check existing documents
    const count = Math.floor(Math.random() * 1000) + 1;
    return `${prefix}-${year}-${String(count).padStart(4, '0')}`;
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const selectDocType = (type: string) => {
    setDocType(type);
    updateFormData('number', generateDocNumber(type));
  };

  const addItem = () => {
    setItems([...items, { desc: '', qty: 1, unit: 'pcs', rate: 0, tax: 0, disc: 0 }]);
  };

  const updateItem = (index: number, field: keyof Item, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let totalTax = 0;
    let totalDisc = 0;

    items.forEach(item => {
      const qty = Number(item.qty) || 0;
      const rate = Number(item.rate) || 0;
      const tax = Number(item.tax) || 0;
      const disc = Number(item.disc) || 0;

      const gross = qty * rate;
      const itemDisc = gross * (disc / 100);
      const afterItemDisc = gross - itemDisc;
      subtotal += afterItemDisc;
      totalTax += afterItemDisc * (tax / 100);
    });

    const globalDisc = subtotal * (Number(formData.discount) || 0) / 100;
    totalDisc += globalDisc;

    const afterGlobalDisc = subtotal - globalDisc;
    const finalTax = totalTax * (afterGlobalDisc / (subtotal || 1));
    const total = afterGlobalDisc + finalTax;

    return { subtotal, totalDisc, totalTax: finalTax, total };
  };

  const saveDocument = () => {
    if (!formData.clientName.trim()) {
      alert('Please enter a client name.');
      return;
    }

    const totals = calculateTotals();
    const doc = {
      id: 'doc_' + Date.now() + Math.random().toString(36).slice(2, 6),
      companyId: activeCompany,
      type: docType,
      template,
      ...formData,
      items,
      subtotal: totals.subtotal,
      discountAmt: totals.totalDisc,
      taxAmt: totals.totalTax,
      total: totals.total,
      created: Date.now()
    };

    // Save to localStorage (will be replaced with API call)
    const existing = JSON.parse(localStorage.getItem('dv2025_documents') || '[]');
    existing.push(doc);
    localStorage.setItem('dv2025_documents', JSON.stringify(existing));

    router.push(`/documents/${doc.id}`);
  };

  const renderStepIndicator = () => {
    const steps = [
      { num: 1, label: 'Select Type' },
      { num: 2, label: 'Details & Items' },
      { num: 3, label: 'Preview' }
    ];

    return (
      <div className="steps-bar">
        {steps.map((s, i) => (
          <div key={s.num} className="step-item">
            <div className={`step-circle ${step === s.num ? 'current' : step > s.num ? 'done' : 'todo'}`}>
              {s.num}
            </div>
            <span className={`step-label ${step === s.num ? 'current' : step > s.num ? 'done' : 'todo'}`}>
              {s.label}
            </span>
            {i < 2 && <div className={`step-connector ${step > s.num ? 'done' : ''}`}></div>}
          </div>
        ))}
      </div>
    );
  };

  const renderStep1 = () => (
    <div>
      <div className="form-section" style={{ marginBottom: '20px' }}>
        <div className="form-section-title">Document Type</div>
        <div className="doc-type-grid">
          {DOC_TYPES.map(type => (
            <div
              key={type.id}
              className={`doc-type-card ${docType === type.id ? 'selected' : ''}`}
              onClick={() => selectDocType(type.id)}
            >
              <div className="dtc-icon">{type.icon}</div>
              <div className="dtc-label">{type.label}</div>
              <div className="dtc-sub">{type.sub}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="form-section" style={{ marginBottom: '20px' }}>
        <div className="form-section-title">Template Style</div>
        <div className="template-grid">
          <div
            className={`tmpl-card ${template === 'classic' ? 'selected' : ''}`}
            onClick={() => setTemplate('classic')}
          >
            <div className="tmpl-thumb">
              <div style={{ padding: '8px' }}>
                <div style={{ height: '8px', background: '#1e3a2f', borderRadius: '2px', marginBottom: '5px' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ height: '4px', width: '35%', background: '#ccc', borderRadius: '2px' }}></div>
                  <div style={{ height: '4px', width: '25%', background: '#1e3a2f', borderRadius: '2px', opacity: 0.5 }}></div>
                </div>
                <div style={{ marginTop: '6px', height: '3px', background: '#eee', borderRadius: '2px' }}></div>
                <div style={{ marginTop: '3px', height: '3px', background: '#eee', borderRadius: '2px', width: '80%' }}></div>
              </div>
            </div>
            <div className="tmpl-name">Classic</div>
          </div>

          <div
            className={`tmpl-card ${template === 'minimal' ? 'selected' : ''}`}
            onClick={() => setTemplate('minimal')}
          >
            <div className="tmpl-thumb">
              <div style={{ padding: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ height: '4px', width: '30%', background: '#ccc', borderRadius: '2px', marginTop: '4px' }}></div>
                  <div>
                    <div style={{ height: '3px', width: '40px', background: '#aaa', borderRadius: '1px', marginBottom: '3px' }}></div>
                    <div style={{ height: '6px', width: '60px', background: '#1e3a2f', borderRadius: '2px', opacity: 0.7 }}></div>
                  </div>
                </div>
                <div style={{ marginTop: '7px', height: '1.5px', background: '#1e3a2f', borderRadius: '1px', width: '100%' }}></div>
                <div style={{ marginTop: '5px', height: '2.5px', background: '#eee', borderRadius: '1px' }}></div>
                <div style={{ marginTop: '3px', height: '2.5px', background: '#eee', borderRadius: '1px', width: '70%' }}></div>
              </div>
            </div>
            <div className="tmpl-name">Minimal</div>
          </div>

          <div
            className={`tmpl-card ${template === 'sidebar' ? 'selected' : ''}`}
            onClick={() => setTemplate('sidebar')}
          >
            <div className="tmpl-thumb">
              <div style={{ display: 'flex', height: '100%' }}>
                <div style={{ width: '32%', background: '#1e3a2f', borderRadius: '3px 0 0 3px', padding: '6px' }}>
                  <div style={{ height: '3px', background: 'rgba(255,255,255,.3)', borderRadius: '1px', marginBottom: '4px' }}></div>
                  <div style={{ height: '5px', background: 'rgba(255,255,255,.6)', borderRadius: '1px', marginBottom: '8px', width: '70%' }}></div>
                  <div style={{ height: '2px', background: 'rgba(255,255,255,.2)', borderRadius: '1px', marginBottom: '3px' }}></div>
                  <div style={{ height: '2px', background: 'rgba(255,255,255,.2)', borderRadius: '1px', width: '80%' }}></div>
                </div>
                <div style={{ flex: 1, padding: '6px' }}>
                  <div style={{ height: '2.5px', background: '#eee', borderRadius: '1px', marginBottom: '3px' }}></div>
                  <div style={{ height: '2.5px', background: '#eee', borderRadius: '1px', width: '75%', marginBottom: '3px' }}></div>
                  <div style={{ height: '2.5px', background: '#eee', borderRadius: '1px', marginBottom: '3px' }}></div>
                </div>
              </div>
            </div>
            <div className="tmpl-name">Bold Sidebar</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" onClick={() => setStep(2)}>Continue →</button>
      </div>
    </div>
  );

  const renderStep2 = () => {
    const totals = calculateTotals();
    const showDue = ['Invoice', 'PI', 'Quote', 'Credit Note', 'Statement', 'Receipt'].includes(docType);

    return (
      <div>
        <div className="form-grid">
          <div className="form-section">
            <div className="form-section-title">Document Details</div>
            <div className="field">
              <label>Document Number</label>
              <input value={formData.number} onChange={(e) => updateFormData('number', e.target.value)} />
            </div>
            <div className="field">
              <label>Date</label>
              <input type="date" value={formData.date} onChange={(e) => updateFormData('date', e.target.value)} />
            </div>
            {showDue && (
              <div className="field">
                <label>Due Date</label>
                <input type="date" value={formData.dueDate} onChange={(e) => updateFormData('dueDate', e.target.value)} />
              </div>
            )}
            <div className="field">
              <label>Currency</label>
              <select value={formData.currency} onChange={(e) => updateFormData('currency', e.target.value)}>
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Status</label>
              <select value={formData.status} onChange={(e) => updateFormData('status', e.target.value)}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Reference / PO Number</label>
              <input value={formData.ref} onChange={(e) => updateFormData('ref', e.target.value)} placeholder="Optional reference" />
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-title">Bill To / Client</div>
            <div className="field">
              <label>Company / Name *</label>
              <input placeholder="Client company name" value={formData.clientName} onChange={(e) => updateFormData('clientName', e.target.value)} />
            </div>
            <div className="field">
              <label>Address</label>
              <textarea placeholder="Street, City, Country" value={formData.clientAddress} onChange={(e) => updateFormData('clientAddress', e.target.value)} />
            </div>
            <div className="field">
              <label>Email</label>
              <input type="email" placeholder="client@email.com" value={formData.clientEmail} onChange={(e) => updateFormData('clientEmail', e.target.value)} />
            </div>
            <div className="field">
              <label>Phone</label>
              <input placeholder="+971 4 000 0000" value={formData.clientPhone} onChange={(e) => updateFormData('clientPhone', e.target.value)} />
            </div>
            <div className="field">
              <label>Tax / VAT Number</label>
              <input placeholder="Tax registration number" value={formData.clientTax} onChange={(e) => updateFormData('clientTax', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="items-card">
          <div className="items-card-header">
            <span>Line Items</span>
            <button className="btn btn-sm" onClick={addItem}>＋ Add Row</button>
          </div>
          <table className="items-tbl">
            <thead>
              <tr>
                <th style={{ width: '32%' }}>Description</th>
                <th style={{ width: '9%', textAlign: 'center' }}>Qty</th>
                <th style={{ width: '11%' }}>Unit</th>
                <th style={{ width: '14%', textAlign: 'right' }}>Unit Price</th>
                <th style={{ width: '10%', textAlign: 'center' }}>Tax %</th>
                <th style={{ width: '13%', textAlign: 'right' }}>Amount</th>
                <th style={{ width: '11%' }}>Discount%</th>
                <th style={{ width: '5%' }}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => {
                const qty = Number(item.qty) || 0;
                const rate = Number(item.rate) || 0;
                const disc = Number(item.disc) || 0;
                const gross = qty * rate;
                const itemDisc = gross * (disc / 100);
                const amount = gross - itemDisc;
                return (
                  <tr key={i}>
                    <td><input value={item.desc} placeholder="Item / service description" onChange={(e) => updateItem(i, 'desc', e.target.value)} /></td>
                    <td><input type="number" value={item.qty} style={{ textAlign: 'center' }} onChange={(e) => updateItem(i, 'qty', Number(e.target.value))} /></td>
                    <td><input value={item.unit} placeholder="pcs" onChange={(e) => updateItem(i, 'unit', e.target.value)} /></td>
                    <td><input type="number" value={item.rate} placeholder="0.00" style={{ textAlign: 'right' }} onChange={(e) => updateItem(i, 'rate', Number(e.target.value))} /></td>
                    <td><input type="number" value={item.tax} placeholder="0" style={{ textAlign: 'center' }} onChange={(e) => updateItem(i, 'tax', Number(e.target.value))} /></td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '12px', paddingRight: '10px' }}>
                      {amount.toFixed(2)}
                    </td>
                    <td><input type="number" value={item.disc} placeholder="0" style={{ textAlign: 'center' }} onChange={(e) => updateItem(i, 'disc', Number(e.target.value))} /></td>
                    <td><button className="item-del" onClick={() => removeItem(i)} title="Remove">×</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="totals-wrap">
          <div className="totals-inner">
            <div className="field" style={{ marginBottom: '14px' }}>
              <label>Global Discount (%)</label>
              <input type="number" min="0" max="100" value={formData.discount} onChange={(e) => updateFormData('discount', Number(e.target.value))} />
            </div>
            <div className="total-row">
              <span className="tlabel">Subtotal</span>
              <span className="tval">{totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="total-row">
              <span className="tlabel">Discount</span>
              <span className="tval">{totals.totalDisc > 0 ? '-' + totals.totalDisc.toFixed(2) : '—'}</span>
            </div>
            <div className="total-row">
              <span className="tlabel">Tax</span>
              <span className="tval">{totals.totalTax > 0 ? totals.totalTax.toFixed(2) : '—'}</span>
            </div>
            <div className="total-row grand">
              <span>Total</span>
              <span className="tval">{totals.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="form-grid" style={{ marginBottom: '20px' }}>
          <div className="form-section">
            <div className="form-section-title">Notes for Client</div>
            <div className="field">
              <textarea placeholder="Additional notes, payment instructions..." value={formData.notes} onChange={(e) => updateFormData('notes', e.target.value)} style={{ minHeight: '80px' }} />
            </div>
          </div>
          <div className="form-section">
            <div className="form-section-title">Terms & Conditions</div>
            <div className="field">
              <textarea value={formData.terms} onChange={(e) => updateFormData('terms', e.target.value)} style={{ minHeight: '80px' }} />
            </div>
          </div>
        </div>

        <div className="form-section" style={{ marginBottom: '20px' }}>
          <div className="form-section-title">Banking Details (optional — shown in footer)</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div className="field">
              <label>Bank Name</label>
              <input value={formData.bank} onChange={(e) => updateFormData('bank', e.target.value)} placeholder="Bank name" />
            </div>
            <div className="field">
              <label>Account / IBAN</label>
              <input value={formData.iban} onChange={(e) => updateFormData('iban', e.target.value)} placeholder="IBAN / Account No." />
            </div>
            <div className="field">
              <label>SWIFT / BIC</label>
              <input value={formData.swift} onChange={(e) => updateFormData('swift', e.target.value)} placeholder="SWIFT code" />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
          <button className="btn" onClick={() => setStep(1)}>← Back</button>
          <button className="btn btn-primary" onClick={saveDocument}>Save & Preview →</button>
        </div>
      </div>
    );
  };

  const renderStep3 = () => (
    <div>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '18px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        <button className="btn" onClick={() => setStep(2)}>← Edit</button>
        <select className="btn" value={formData.status} onChange={(e) => updateFormData('status', e.target.value)}>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button className="btn btn-primary" onClick={() => window.print()}>🖨 Print / PDF</button>
        <button className="btn" onClick={() => router.push('/documents')}>Done ✓</button>
      </div>
      <div className="preview-bg">
        <div className="invoice-paper" style={{ fontFamily: 'DM Sans, sans-serif', color: '#1a1917' }}>
          {/* Invoice preview will be implemented */}
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>
            Invoice preview will be rendered here
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <DocuVaultLayout>
      <div style={{ maxWidth: '840px', margin: '0 auto' }}>
        {renderStepIndicator()}
        <div style={{ padding: '20px 0' }}>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>
      </div>
    </DocuVaultLayout>
  );
}