import React from 'react';

export default function StatusBadge({ status }) {
  const s = String(status || '').toLowerCase();

  let bg = '#f8f9fa';
  let color = '#212529';
  let border = '#dee2e6';

  if (s === 'active' || s === 'accepted') {
    bg = '#d1e7dd';
    color = '#0f5132';
    border = '#badbcc';
  } else if (s === 'pending') {
    bg = '#fff3cd';
    color = '#664d03';
    border = '#ffecb5';
  } else if (s === 'sold') {
    bg = '#cff4fc';
    color = '#055160';
    border = '#b6effb';
  } else if (s === 'rejected') {
    bg = '#f8d7da';
    color = '#842029';
    border = '#f5c2c7';
  }

  return (
    <span style={{
      display: 'inline-block',
      padding: '0.18rem 0.5rem',
      fontSize: '0.725rem',
      fontWeight: 600,
      backgroundColor: bg,
      color: color,
      border: `1px solid ${border}`,
      borderRadius: '3px',
      textTransform: 'capitalize',
      whiteSpace: 'nowrap'
    }}>
      {status || 'Unknown'}
    </span>
  );
}
