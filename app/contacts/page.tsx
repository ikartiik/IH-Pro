'use client';

import { useState, useEffect } from 'react';
import DocuVaultLayout from '@/components/DocuVaultLayout';

interface Contact {
  id: string;
  name: string;
  company?: string;
  address?: string;
  trn?: string;
  email?: string;
  phone?: string;
  currency?: string;
  paymentTerms?: string;
}

export default function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    address: '',
    trn: '',
    email: '',
    phone: '',
    currency: 'AED',
    paymentTerms: 'Net 30'
  });

  useEffect(() => {
    // Load contacts from localStorage
    const savedContacts = localStorage.getItem('dv2025_contacts');
    if (savedContacts) {
      setContacts(JSON.parse(savedContacts));
    }
  }, []);

  const saveContacts = (newContacts: Contact[]) => {
    setContacts(newContacts);
    localStorage.setItem('dv2025_contacts', JSON.stringify(newContacts));
  };

  const deleteContact = (contactId: string) => {
    if (!confirm('Delete this contact?')) return;

    const updatedContacts = contacts.filter(c => c.id !== contactId);
    saveContacts(updatedContacts);
  };

  const openAddContact = (contact?: Contact) => {
    if (contact) {
      setEditingContact(contact);
      setFormData({
        name: contact.name,
        company: contact.company || '',
        address: contact.address || '',
        trn: contact.trn || '',
        email: contact.email || '',
        phone: contact.phone || '',
        currency: contact.currency || 'AED',
        paymentTerms: contact.paymentTerms || 'Net 30'
      });
    } else {
      setEditingContact(null);
      setFormData({
        name: '',
        company: '',
        address: '',
        trn: '',
        email: '',
        phone: '',
        currency: 'AED',
        paymentTerms: 'Net 30'
      });
    }
    setShowModal(true);
  };

  const saveContact = () => {
    if (!formData.name.trim()) {
      alert('Contact name is required.');
      return;
    }

    const contact: Contact = {
      id: editingContact?.id || 'ct_' + Date.now(),
      ...formData
    };

    let updatedContacts;
    if (editingContact) {
      updatedContacts = contacts.map(c => c.id === editingContact.id ? contact : c);
    } else {
      updatedContacts = [...contacts, contact];
    }

    saveContacts(updatedContacts);
    setShowModal(false);
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (contacts.length === 0) {
    return (
      <DocuVaultLayout
        topbarActions={
          <button className="btn btn-primary" onClick={() => openAddContact()}>
            <span style={{ fontSize: '16px', marginRight: '8px' }}>＋</span>
            Add Contact
          </button>
        }
      >
        <div className="empty-state">
          <div className="es-icon">👥</div>
          <p>No contacts added yet.</p>
          <p style={{ fontSize: '12px' }}>Click "Add Contact" to get started.</p>
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
            <div className="modal">
              <div className="modal-title">Add Contact</div>
              <div className="field">
                <label>Contact Name *</label>
                <input
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  placeholder="e.g. John Smith"
                />
              </div>
              <div className="field">
                <label>Company</label>
                <input
                  value={formData.company}
                  onChange={(e) => updateFormData('company', e.target.value)}
                  placeholder="e.g. ABC Trading LLC"
                />
              </div>
              <div className="field">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  placeholder="john@company.com"
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
                  <label>Currency</label>
                  <select value={formData.currency} onChange={(e) => updateFormData('currency', e.target.value)}>
                    <option value="AED">AED</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
                <div className="field">
                  <label>Payment Terms</label>
                  <select value={formData.paymentTerms} onChange={(e) => updateFormData('paymentTerms', e.target.value)}>
                    <option value="Net 15">Net 15</option>
                    <option value="Net 30">Net 30</option>
                    <option value="Net 45">Net 45</option>
                    <option value="Net 60">Net 60</option>
                    <option value="Cash on Delivery">Cash on Delivery</option>
                  </select>
                </div>
              </div>
              <div className="field">
                <label>Tax Registration Number (TRN)</label>
                <input
                  value={formData.trn}
                  onChange={(e) => updateFormData('trn', e.target.value)}
                  placeholder="e.g. 123456789012345"
                />
              </div>
              <div className="modal-footer">
                <button className="btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={saveContact}>Save Contact</button>
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
        <button className="btn btn-primary" onClick={() => openAddContact()}>
          <span style={{ fontSize: '16px', marginRight: '8px' }}>＋</span>
          Add Contact
        </button>
      }
    >
      <div className="co-grid">
        {contacts.map(contact => (
          <div key={contact.id} className="co-card">
            <div className="co-card-head">
              <div
                className="co-card-avatar"
                style={{ background: 'var(--accent)' }}
              >
                {contact.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="co-card-name">{contact.name}</div>
                <div className="co-card-email">{contact.company || 'No company set'}</div>
              </div>
            </div>
            <div className="co-card-info">
              {contact.address || 'No address set'}
              {contact.phone && <><br />{contact.phone}</>}
              {contact.email && <><br />{contact.email}</>}
              {contact.trn && <><br />TRN: {contact.trn}</>}
            </div>
            <div className="co-card-actions">
              <button className="btn btn-sm" onClick={() => openAddContact(contact)}>Edit</button>
              <button className="btn btn-sm btn-danger" onClick={() => deleteContact(contact.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-title">{editingContact ? 'Edit' : 'Add'} Contact</div>
            <div className="field">
              <label>Contact Name *</label>
              <input
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                placeholder="e.g. John Smith"
              />
            </div>
            <div className="field">
              <label>Company</label>
              <input
                value={formData.company}
                onChange={(e) => updateFormData('company', e.target.value)}
                placeholder="e.g. ABC Trading LLC"
              />
            </div>
            <div className="field">
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData('email', e.target.value)}
                placeholder="john@company.com"
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
                <label>Currency</label>
                <select value={formData.currency} onChange={(e) => updateFormData('currency', e.target.value)}>
                  <option value="AED">AED</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
              <div className="field">
                <label>Payment Terms</label>
                <select value={formData.paymentTerms} onChange={(e) => updateFormData('paymentTerms', e.target.value)}>
                  <option value="Net 15">Net 15</option>
                  <option value="Net 30">Net 30</option>
                  <option value="Net 45">Net 45</option>
                  <option value="Net 60">Net 60</option>
                  <option value="Cash on Delivery">Cash on Delivery</option>
                </select>
              </div>
            </div>
            <div className="field">
              <label>Tax Registration Number (TRN)</label>
              <input
                value={formData.trn}
                onChange={(e) => updateFormData('trn', e.target.value)}
                placeholder="e.g. 123456789012345"
              />
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveContact}>Save Contact</button>
            </div>
          </div>
        </div>
      )}
    </DocuVaultLayout>
  );
}