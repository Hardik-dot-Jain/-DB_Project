import React from 'react';

export default function Header({ title, subtitle, dbStatus }) {
  return (
    <div className="page-header-bar">
      <div>
        <h1 className="page-header-title">{title}</h1>
        {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#6c757d' }}>
        <span>Database: <strong>Oracle 11g XE</strong></span>
        <span>|</span>
        <span>Schema: <strong>{dbStatus.schema || 'SYSTEM'}</strong></span>
      </div>
    </div>
  );
}
