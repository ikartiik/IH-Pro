'use client';

import { useState, useEffect } from 'react';
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

export default function Dashboard() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [activeCompany, setActiveCompany] = useState<string | null>(null);

  useEffect(() => {
    // Load data from localStorage (will be replaced with API calls)
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

  // Filter documents by active company
  const filteredDocs = documents.filter(doc =>
    !activeCompany || doc.companyId === activeCompany
  );

  // Calculate stats
  const totalDocs = filteredDocs.length;
  const totalInvoiced = filteredDocs
    .filter(doc => doc.type === 'Invoice')
    .reduce((sum, doc) => sum + (doc.total || 0), 0);

  const paidAmount = filteredDocs
    .filter(doc => doc.status === 'paid')
    .reduce((sum, doc) => sum + (doc.total || 0), 0);

  const pendingCount = filteredDocs
    .filter(doc => ['pending', 'sent'].includes(doc.status))
    .length;

  const activeCo = companies.find(c => c.id === activeCompany);
  const currency = activeCo?.currency || 'USD';

  // Get recent documents
  const recentDocs = [...filteredDocs]
    .sort((a, b) => b.created - a.created)
    .slice(0, 10);

  const formatCurrency = (amount: number, curr: string = currency) => {
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

  return (
    <DocuVaultLayout>
      {/* STATS GRID */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Total Documents</div>
          <div className="stat-value">{totalDocs}</div>
          <div className="stat-sub">{activeCo ? activeCo.name : 'All companies'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Invoiced</div>
          <div className="stat-value">{formatCurrency(totalInvoiced)}</div>
          <div className="stat-sub">{filteredDocs.filter(d => d.type === 'Invoice').length} invoices</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Paid</div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>{formatCurrency(paidAmount)}</div>
          <div className="stat-sub">{filteredDocs.filter(d => d.status === 'paid').length} paid</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Outstanding</div>
          <div className="stat-value" style={{ color: 'var(--warn)' }}>{formatCurrency(totalInvoiced - paidAmount)}</div>
          <div className="stat-sub">{pendingCount} pending</div>
        </div>
      </div>

      {/* RECENT DOCUMENTS */}
      <div className="table-card">
        <div className="table-card-header">
          <h3>Recent Documents</h3>
          <button className="btn btn-sm" onClick={() => window.location.href = '/documents'}>View all →</button>
        </div>
        {recentDocs.length === 0 ? (
          <div className="empty-state">
            <div className="es-icon">📄</div>
            <p>No documents yet.</p>
            <p style={{ fontSize: '12px' }}>Create your first document to get started.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Number</th>
                <th>Type</th>
                <th>Client</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {recentDocs.map(doc => (
                <tr key={doc.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: '600' }}>
                    {doc.number}
                  </td>
                  <td dangerouslySetInnerHTML={{ __html: getTypePill(doc.type) }}></td>
                  <td>{doc.clientName || '—'}</td>
                  <td style={{ fontSize: '12px', color: 'var(--muted)' }}>
                    {formatDate(doc.date)}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                    {formatCurrency(doc.total, doc.currency)}
                  </td>
                  <td>
                    <span className={getStatusBadge(doc.status)}>{doc.status}</span>
                  </td>
                  <td>
                    <button className="btn btn-sm" onClick={() => window.location.href = `/documents/${doc.id}`}>View</button>
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