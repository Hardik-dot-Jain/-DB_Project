import React from 'react';

export default function LoadingSkeleton({ text = 'Loading data from Oracle Database...' }) {
  return (
    <div className="loading-box">
      <div className="spinner"></div>
      <span>{text}</span>
    </div>
  );
}
