import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export default function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => {
        let icon = <Info size={16} />;
        let toastClass = '';

        if (toast.type === 'success') {
          icon = <CheckCircle2 size={16} />;
          toastClass = 'success';
        } else if (toast.type === 'error') {
          icon = <AlertTriangle size={16} />;
          toastClass = 'error';
        }

        return (
          <div key={toast.id} className={`alert-toast ${toastClass}`}>
            <span>{icon}</span>
            <div style={{ flex: 1 }}>{toast.message}</div>
            <button
              onClick={() => onDismiss(toast.id)}
              style={{
                background: 'none',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer',
                padding: '0.1rem',
                display: 'flex',
                opacity: 0.8
              }}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
