import React from 'react';
import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Deletion',
  message = 'Are you sure you want to delete this record? This action cannot be undone.',
  confirmText = 'Delete Record',
  isDeleting = false
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="450px">
      <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
        <div style={{
          width: 36,
          height: 36,
          backgroundColor: '#f8d7da',
          color: '#842029',
          border: '1px solid #f5c2c7',
          borderRadius: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <AlertTriangle size={20} />
        </div>
        <div>
          <p style={{ fontSize: '0.875rem', color: '#212529', lineHeight: 1.5 }}>
            {message}
          </p>
        </div>
      </div>

      <div className="modal-footer" style={{ marginTop: '1.25rem', margin: '1.25rem -1.15rem -1.15rem' }}>
        <button className="btn btn-secondary" onClick={onClose} disabled={isDeleting}>
          Cancel
        </button>
        <button className="btn btn-danger" onClick={onConfirm} disabled={isDeleting}>
          {isDeleting ? 'Deleting...' : confirmText}
        </button>
      </div>
    </Modal>
  );
}
