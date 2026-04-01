'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import DocuVaultLayout from '@/components/DocuVaultLayout';

interface Document {
  id: string;
  type: string;
  number: string;
  date: string;
  dueDate?: string;
  clientName?: string;
  total: number;
  currency: string;
  status: string;
  created: number;
  companyId?: string;
}

interface Company {
  id: string;
  name: string;
  currency?: string;
}

const STATUSES = ['draft', 'sent', 'pending', 'paid', 'overdue', 'cancelled'];

export default function Documents() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [activeCompany, setActiveCompany] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const searchParams = useSearchParams();
  const filter = searchParams.get('filter') || '';

  useEffect(() => {
    // Load data from localStorage
    const savedCompanies = localStorage.getItem('dv2025_companies');
    const savedActive = localStorage.getItem('dv2025_activeCompany');
    const savedDocuments = localStorage.getItem('dv2025_documents');

    if (savedCompanies) {
      const parsed = JSON.parse(savedCompanies);
      setCompanies(parsed);
      if (savedActive && parsed.find((c: Company) => c.id === savedActive)) {
        setActiveCompany(savedActive);
      }
    }

    if (savedDocuments) {
      setDocuments(JSON.parse(savedDocuments));
    }
  }, []);

  // Filter documents
  const filteredDocs = documents
    .filter(doc => !activeCompany || doc.companyId === activeCompany)
    .filter(doc => !filter || doc.type === filter)
    .filter(doc => !searchQuery ||
      [doc.number, doc.clientName, doc.type].some(field =>
        field?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    )
    .sort((a, b) => b.created - a.created);

  const formatCurrency = (amount: number, curr: string = 'USD') => {
    return `${curr} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr + 'T00:00:00');
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: string) => {
    const classes = {
      paid: 'badge-paid',
      pending: 'badge-pending',
      sent: 'badge-sent',
      draft: 'badge-draft',
      overdue: 'badge-overdue',
      cancelled: 'badge-cancelled'
    };
    return `badge ${classes[status as keyof typeof classes] || 'badge-draft'}`;
  };

  const getTypePill = (type: string) => {
    return `<span style="font-size:10px;padding:2px 8px;border-radius:20px;background:var(--surface2);color:var(--muted);font-weight:500">${type}</span>`;
  };

  const cycleStatus = (docId: string) => {
    const doc = documents.find(d => d.id === docId);
    if (!doc) return;

    const currentIndex = STATUSES.indexOf(doc.status);
    const nextStatus = STATUSES[(currentIndex + 1) % STATUSES.length];

    const updatedDocs = documents.map(d =>
      d.id === docId ? { ...d, status: nextStatus } : d
    );
    setDocuments(updatedDocs);
    localStorage.setItem('dv2025_documents', JSON.stringify(updatedDocs));
  };

  const deleteDocument = (docId: string) => {
    if (!confirm('Delete this document permanently?')) return;

    const updatedDocs = documents.filter(d => d.id !== docId);
    setDocuments(updatedDocs);
    localStorage.setItem('dv2025_documents', JSON.stringify(updatedDocs));
  };

  const viewDocument = (docId: string) => {
    window.location.href = `/documents/${docId}`;
  };

  return (
    <DocuVaultLayout>
      <div className="table-card">
        <div className="table-card-header">
          <h3>{filteredDocs.length} {filter || 'Documents'}</h3>
          <input
            style={{
              padding: '6px 10px',
              border: '1px solid var(--border2)',
              borderRadius: 'var(--radius)',
              fontSize: '12px',
              fontFamily: 'var(--font-body)',
              width: '200px'
            }}
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {filteredDocs.length === 0 ? (
          <div className="empty-state">
            <div className="es-icon">🔍</div>
            <p>No documents found.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Number</th>
                <th>Type</th>
                <th>Client</th>
                <th>Date</th>
                <th>Due Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.map(doc => (
                <tr key={doc.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: '600' }}>
                    {doc.number}
                  </td>
                  <td dangerouslySetInnerHTML={{ __html: getTypePill(doc.type) }}></td>
                  <td>{doc.clientName || '—'}</td>
                  <td style={{ fontSize: '12px', color: 'var(--muted)' }}>
                    {formatDate(doc.date)}
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--muted)' }}>
                    {doc.dueDate ? formatDate(doc.dueDate) : '—'}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                    {formatCurrency(doc.total, doc.currency)}
                  </td>
                  <td>
                    <span className={getStatusBadge(doc.status)}>{doc.status}</span>
                  </td>
                  <td style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    <button className="btn btn-sm" onClick={() => viewDocument(doc.id)}>View</button>
                    <button className="btn btn-sm" onClick={() => cycleStatus(doc.id)}>Status</button>
                    <button className="btn btn-sm btn-danger" onClick={() => deleteDocument(doc.id)}>Del</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </DocuVaultLayout>
  );
}