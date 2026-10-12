import React from 'react';

export default function StatCard({ label, value, subtext, icon: Icon, color = '#0d6efd', variant = 'widget-blue' }) {
  return (
    <div className={`stat-widget ${variant}`}>
      <div>
        <div className="stat-widget-title">{label}</div>
        <div className="stat-widget-number">{value}</div>
        {subtext && <div className="stat-widget-sub">{subtext}</div>}
      </div>
      <div className="stat-widget-icon" style={{ color }}>
        <Icon size={20} />
      </div>
    </div>
  );
}
