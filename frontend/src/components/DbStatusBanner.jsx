import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function DbStatusBanner({ dbStatus, onRetry }) {
  if (dbStatus.connected) return null;

  return (
    <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        <AlertTriangle size={18} />
        <div>
          <strong>Oracle Database Connection Inactive: </strong>
          <span>{dbStatus.error || 'Ensure Oracle XE service is running and configure DB_PASSWORD in backend/.env.'}</span>
        </div>
      </div>

      <button
        className="btn btn-secondary btn-sm"
        onClick={onRetry}
        style={{ borderColor: '#f5c2c7', backgroundColor: '#ffffff' }}
      >
        <RefreshCw size={13} /> Retry Connection
      </button>
    </div>
  );
}
