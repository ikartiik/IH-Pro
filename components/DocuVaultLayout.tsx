'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface Company {
  id: string;
  name: string;
  email?: string;
  logo?: string;
  color?: string;
}

interface DocuVaultLayoutProps {
  children: React.ReactNode;
  topbarActions?: React.ReactNode;
}

export default function DocuVaultLayout({ children, topbarActions }: DocuVaultLayoutProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [activeCompany, setActiveCompany] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Load companies from localStorage for now (will be replaced with API calls)
    const savedCompanies = localStorage.getItem('dv2025_companies');
    const savedActive = localStorage.getItem('dv2025_activeCompany');

    if (savedCompanies) {
      const parsed = JSON.parse(savedCompanies);
      setCompanies(parsed);
      if (savedActive && parsed.find((c: Company) => c.id === savedActive)) {
        setActiveCompany(savedActive);
      } else if (parsed.length > 0) {
        setActiveCompany(parsed[0].id);
      }
    }

    // Set current page based on pathname
    if (pathname.includes('/documents')) setCurrentPage('documents');
    else if (pathname.includes('/companies')) setCurrentPage('companies');
    else if (pathname.includes('/contacts')) setCurrentPage('contacts');
    else if (pathname.includes('/items')) setCurrentPage('items');
    else if (pathname.includes('/new')) setCurrentPage('new');
    else setCurrentPage('dashboard');
  }, [pathname]);

  const activeCo = companies.find(c => c.id === activeCompany);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '⊞' },
    { id: 'new', label: 'New Document', icon: '＋' },
    { id: 'documents', label: 'Documents', icon: '📄' },
    { id: 'companies', label: 'Companies', icon: '🏢' },
    { id: 'contacts', label: 'Contacts', icon: '👥' },
    { id: 'items', label: 'Items', icon: '📦' },
  ];

  const docTypes = [
    { id: 'all', label: 'All Documents', filter: '' },
    { id: 'invoices', label: 'Invoices', filter: 'Invoice' },
    { id: 'pi', label: 'Proforma Invoices', filter: 'PI' },
    { id: 'so', label: 'Sales Orders', filter: 'SO' },
    { id: 'po', label: 'Purchase Orders', filter: 'PO' },
    { id: 'dn', label: 'Delivery Notes', filter: 'DN' },
    { id: 'quotes', label: 'Quotations', filter: 'Quote' },
    { id: 'cn', label: 'Credit Notes', filter: 'Credit Note' },
  ];

  const handleNav = (pageId: string, filter?: string) => {
    setCurrentPage(pageId);
    if (pageId === 'dashboard') router.push('/dashboard');
    else if (pageId === 'new') router.push('/new');
    else if (pageId === 'documents') router.push(`/documents${filter ? `?filter=${filter}` : ''}`);
    else if (pageId === 'companies') router.push('/companies');
    else if (pageId === 'contacts') router.push('/contacts');
    else if (pageId === 'items') router.push('/items');
  };

  const handleCompanySwitch = () => {
    setShowCompanyModal(true);
  };

  const selectCompany = (companyId: string) => {
    setActiveCompany(companyId);
    localStorage.setItem('dv2025_activeCompany', companyId);
    setShowCompanyModal(false);
  };

  return (
    <div className="app">
      {/* SIDEBAR */}
      <div className="sidebar">
        <div className="sidebar-logo">
          <h1>DocuVault</h1>
          <p>Document Manager</p>
        </div>

        <div className="co-switcher">
          <button className="co-btn" onClick={handleCompanySwitch}>
            <div
              className="co-avatar"
              style={{ background: activeCo?.color || 'var(--accent)' }}
            >
              {activeCo ? activeCo.name.slice(0, 2).toUpperCase() : '—'}
            </div>
            <div>
              <div className="co-name">{activeCo?.name || 'Select Company'}</div>
              <div className="co-sub">{activeCo ? 'Active' : 'tap to switch'}</div>
            </div>
            <span style={{ color: 'var(--muted2)', fontSize: '12px' }}>↓</span>
          </button>
        </div>

        <nav className="nav">
          <div className="nav-section">Overview</div>
          {navItems.map(item => (
            <div
              key={item.id}
              className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => handleNav(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </div>
          ))}

          <div className="nav-section">Documents</div>
          {docTypes.map(type => (
            <div
              key={type.id}
              className={`nav-item ${currentPage === 'documents' ? 'active' : ''}`}
              onClick={() => handleNav('documents', type.filter)}
            >
              <span className="nav-icon">📄</span>
              {type.label}
            </div>
          ))}

          <div className="nav-section">Setup</div>
        </nav>

        <div className="sidebar-bottom">
          DocuVault v1.0 &nbsp;·&nbsp; Data saved locally
        </div>
      </div>

      {/* MAIN */}
      <div className="main">
        <div className="topbar">
          <div className="topbar-title">
            {currentPage === 'dashboard' ? 'Dashboard' :
             currentPage === 'new' ? 'New Document' :
             currentPage === 'documents' ? 'Documents' :
             currentPage === 'companies' ? 'Companies' :
             currentPage === 'contacts' ? 'Contacts' :
             currentPage === 'items' ? 'Items' : 'Dashboard'}
          </div>
          <div className="topbar-actions">
            {topbarActions}
          </div>
        </div>
        <div className="content">
          {children}
        </div>
      </div>

      {/* Company Switcher Modal */}
      {showCompanyModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowCompanyModal(false)}>
          <div className="modal">
            <div className="modal-title">Switch Company</div>
            <div className="co-picker">
              {companies.length === 0 ? (
                <div className="empty-state">
                  <div className="es-icon">🏢</div>
                  <p>No companies available.</p>
                  <p style={{ fontSize: '12px' }}>Go to Companies page to add one.</p>
                </div>
              ) : (
                companies.map(company => {
                  const isActive = activeCompany === company.id;
                  return (
                    <div
                      key={company.id}
                      className={`co-pick-item ${isActive ? 'active' : ''}`}
                      onClick={() => selectCompany(company.id)}
                    >
                      <div
                        className="co-avatar"
                        style={{ background: company.color || 'var(--accent)' }}
                      >
                        {company.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="co-name">{company.name}</div>
                        <div className="co-sub">{company.email || 'No email'}</div>
                      </div>
                      {isActive && <span className="active-badge">✓</span>}
                    </div>
                  );
                })
              )}
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={() => setShowCompanyModal(false)}>Cancel</button>
              <button
                className="btn btn-primary"
                onClick={() => router.push('/companies')}
                style={{ marginLeft: 'auto' }}
              >
                Manage Companies
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}