'use client';

import { useState, useEffect } from 'react';
import DocuVaultLayout from '@/components/DocuVaultLayout';

interface Company {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  currency?: string;
  color?: string;
  logo?: string;
  taxId?: string;
  bank?: string;
  iban?: string;
  swift?: string;
}

export default function Companies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [activeCompany, setActiveCompany] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    currency: 'AED',
    color: '#1e3a2f',
    taxId: '',
    bank: '',
    iban: '',
    swift: ''
  });

  useEffect(() => {
    // Load companies from localStorage
    const savedCompanies = localStorage.getItem('dv2025_companies');
    const savedActive = localStorage.getItem('dv2025_activeCompany');

    if (savedCompanies) {
      const parsed = JSON.parse(savedCompanies);
      setCompanies(parsed);
      if (savedActive && parsed.find((c: Company) => c.id === savedActive)) {
        setActiveCompany(savedActive);
      }
    }
  }, []);

  const saveCompanies = (newCompanies: Company[]) => {
    setCompanies(newCompanies);
    localStorage.setItem('dv2025_companies', JSON.stringify(newCompanies));
  };

  const setActiveCo = (companyId: string) => {
    setActiveCompany(companyId);
    localStorage.setItem('dv2025_activeCompany', companyId);
    // Close modal if open
    setShowModal(false);
  };

  const deleteCompany = (companyId: string) => {
    if (!confirm('Delete this company and its documents?')) return;

    const updatedCompanies = companies.filter(c => c.id !== companyId);
    saveCompanies(updatedCompanies);

    // If deleting active company, set another as active or null
    if (activeCompany === companyId) {
      const newActive = updatedCompanies.length > 0 ? updatedCompanies[0].id : null;
      setActiveCompany(newActive);
      if (newActive) {
        localStorage.setItem('dv2025_activeCompany', newActive);
      } else {
        localStorage.removeItem('dv2025_activeCompany');
      }
    }
  };

  const openAddCompany = (company?: Company) => {
    if (company) {
      setEditingCompany(company);
      setFormData({
        name: company.name,
        email: company.email || '',
        phone: company.phone || '',
        address: company.address || '',
        currency: company.currency || 'AED',
        color: company.color || '#1e3a2f',
        taxId: company.taxId || '',
        bank: company.bank || '',
        iban: company.iban || '',
        swift: company.swift || ''
      });
    } else {
      setEditingCompany(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        currency: 'AED',
        color: '#1e3a2f',
        taxId: '',
        bank: '',
        iban: '',
        swift: ''
      });
    }
    setShowModal(true);
  };

  const saveCompany = () => {
    if (!formData.name.trim()) {
      alert('Company name is required.');
      return;
    }

    const company: Company = {
      id: editingCompany?.id || 'co_' + Date.now(),
      ...formData
    };

    let updatedCompanies;
    if (editingCompany) {
      updatedCompanies = companies.map(c => c.id === editingCompany.id ? company : c);
    } else {
      updatedCompanies = [...companies, company];
    }

    saveCompanies(updatedCompanies);

    // If this is the first company, set it as active
    if (updatedCompanies.length === 1) {
      setActiveCo(company.id);
    }

    setShowModal(false);
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (companies.length === 0) {
    return (
      <DocuVaultLayout
        topbarActions={
          <button className="btn btn-primary" onClick={() => openAddCompany()}>
            <span style={{ fontSize: '16px', marginRight: '8px' }}>＋</span>
            Add Company
          </button>
        }
      >
        <div className="empty-state">
          <div className="es-icon">🏢</div>
          <p>No companies added yet.</p>
          <p style={{ fontSize: '12px' }}>Click "Add Company" to get started.</p>
        </div>
        {showModal && (
          <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
            <div className="modal">
              <div className="modal-title">Add Company</div>
              <div className="field">
                <label>Company Name *</label>
                <input
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  placeholder="e.g. Acme Trading LLC"
                />
              </div>
              <div className="field">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  placeholder="info@company.com"
                />
              </div>
              <div className="field">
                <label>Phone</label>
                <input
                  value={formData.phone}
                  onChange={(e) => updateFormData('phone', e.target.value)}
                  placeholder="+971 4 000 0000"
                />
              </div>
              <div className="field">
                <label>Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => updateFormData('address', e.target.value)}
                  placeholder="Street, City, Country, ZIP"
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="field">
                  <label>Default Currency</label>
                  <select value={formData.currency} onChange={(e) => updateFormData('currency', e.target.value)}>
                    <option value="AED">AED</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
                <div className="field">
                  <label>Brand Color</label>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => updateFormData('color', e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={saveCompany}>Save Company</button>
              </div>
            </div>
          </div>
        )}
      </DocuVaultLayout>
    );
  }

  return (
    <DocuVaultLayout
      topbarActions={
        <button className="btn btn-primary" onClick={() => openAddCompany()}>
          <span style={{ fontSize: '16px', marginRight: '8px' }}>＋</span>
          Add Company
        </button>
      }
    >
      <div className="co-grid">
        {companies.map(company => {
          const isActive = activeCompany === company.id;
          return (
            <div key={company.id} className={`co-card ${isActive ? 'active-co' : ''}`}>
              <div className="co-card-head">
                {company.logo ? (
                  <img src={company.logo} className="co-card-logo" alt="logo" />
                ) : (
                  <div
                    className="co-card-avatar"
                    style={{ background: company.color || '#1e3a2f' }}
                  >
                    {company.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="co-card-name">{company.name}</div>
                  <div className="co-card-email">{company.email || 'No email set'}</div>
                  {isActive && (
                    <div style={{ marginTop: '5px' }}>
                      <span className="active-badge">✓ Active</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="co-card-info">
                {company.address || 'No address set'}
                {company.phone && <><br />{company.phone}</>}
                {company.taxId && <><br />Tax: {company.taxId}</>}
              </div>
              <div className="co-card-actions">
                {!isActive && (
                  <button className="btn btn-sm btn-primary" onClick={() => setActiveCo(company.id)}>
                    Set Active
                  </button>
                )}
                <button className="btn btn-sm" onClick={() => openAddCompany(company)}>Edit</button>
                <button className="btn btn-sm btn-danger" onClick={() => deleteCompany(company.id)}>Delete</button>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-title">{editingCompany ? 'Edit' : 'Add'} Company</div>
            <div className="field">
              <label>Company Name *</label>
              <input
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                placeholder="e.g. Acme Trading LLC"
              />
            </div>
            <div className="field">
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData('email', e.target.value)}
                placeholder="info@company.com"
              />
            </div>
            <div className="field">
              <label>Phone</label>
              <input
                value={formData.phone}
                onChange={(e) => updateFormData('phone', e.target.value)}
                placeholder="+971 4 000 0000"
              />
            </div>
            <div className="field">
              <label>Address</label>
              <textarea
                value={formData.address}
                onChange={(e) => updateFormData('address', e.target.value)}
                placeholder="Street, City, Country, ZIP"
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="field">
                <label>Default Currency</label>
                <select value={formData.currency} onChange={(e) => updateFormData('currency', e.target.value)}>
                  <option value="AED">AED</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
              <div className="field">
                <label>Brand Color</label>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => updateFormData('color', e.target.value)}
                />
              </div>
            </div>
            <div className="field">
              <label>Tax / VAT Number</label>
              <input
                value={formData.taxId}
                onChange={(e) => updateFormData('taxId', e.target.value)}
                placeholder="e.g. TRN100234567890003"
              />
            </div>
            <div className="field">
              <label>Bank Name</label>
              <input
                value={formData.bank}
                onChange={(e) => updateFormData('bank', e.target.value)}
                placeholder="e.g. Emirates NBD"
              />
            </div>
            <div className="field">
              <label>Account Number / IBAN</label>
              <input
                value={formData.iban}
                onChange={(e) => updateFormData('iban', e.target.value)}
                placeholder="AE12 3456 7890 1234 5678 90"
              />
            </div>
            <div className="field">
              <label>SWIFT / BIC</label>
              <input
                value={formData.swift}
                onChange={(e) => updateFormData('swift', e.target.value)}
                placeholder="EBILAEAD"
              />
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveCompany}>Save Company</button>
            </div>
          </div>
        </div>
      )}
    </DocuVaultLayout>
  );
}