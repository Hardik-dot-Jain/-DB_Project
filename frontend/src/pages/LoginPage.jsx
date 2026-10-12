import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import {
  Building2,
  Lock,
  User,
  LogIn,
  AlertCircle,
  CheckCircle,
  ShieldCheck,
  Briefcase,
  Home
} from 'lucide-react';

const PORTAL_CONFIG = {
  admin: {
    id: 'admin',
    name: 'Admin Portal',
    badge: 'System Administrator',
    badgeColor: '#0d6efd',
    defaultUser: 'admin',
    defaultPass: 'password123',
    icon: ShieldCheck,
    description: 'Full database access: agents, categories, reports & transactions.',
    targetRoute: '/admin-dashboard'
  },
  agent: {
    id: 'agent',
    name: 'Agent Portal',
    badge: 'Licensed Broker / Agent',
    badgeColor: '#6f42c1',
    defaultUser: 'agent1',
    defaultPass: 'password123',
    icon: Briefcase,
    description: 'Manage assigned properties, schedule showings & review buyer offers.',
    targetRoute: '/agent-dashboard'
  },
  client: {
    id: 'client',
    name: 'Client Portal',
    badge: 'Registered Buyer / Client',
    badgeColor: '#198754',
    defaultUser: 'client1',
    defaultPass: 'password123',
    icon: Home,
    description: 'Browse available listings, track viewings & monitor purchase offers.',
    targetRoute: '/client-dashboard'
  }
};

export default function LoginPage({ onLoginSuccess }) {
  const [activePortal, setActivePortal] = useState('admin');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function handleSelectPortal(portalId) {
    setActivePortal(portalId);
    setError('');
    const config = PORTAL_CONFIG[portalId];
    setUsername(config.defaultUser);
    setPassword(config.defaultPass);
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', {
        username: username.trim(),
        password
      });

      if (res.success && res.token) {
        localStorage.setItem('estateflow_token', res.token);
        localStorage.setItem('estateflow_user', JSON.stringify(res.user));

        if (onLoginSuccess) {
          onLoginSuccess(res.user);
        }

        const role = String(res.user.role || 'admin').toLowerCase();
        if (role === 'agent') {
          navigate('/agent-dashboard');
        } else if (role === 'client') {
          navigate('/client-dashboard');
        } else {
          navigate('/admin-dashboard');
        }
      } else {
        setError(res.error || 'Login failed. Please check credentials.');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  }

  const currentPortal = PORTAL_CONFIG[activePortal];
  const PortalIcon = currentPortal.icon;

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f4f6f9',
      padding: '1.5rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
        backgroundColor: '#ffffff',
        border: '1px solid #dee2e6',
        borderRadius: '6px',
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.08)',
        overflow: 'hidden'
      }}>
        {/* Card Header */}
        <div style={{
          backgroundColor: '#212529',
          color: '#ffffff',
          padding: '1.25rem 1.5rem',
          textAlign: 'center',
          borderBottom: '3px solid #0d6efd'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '46px',
            height: '46px',
            backgroundColor: '#0d6efd',
            borderRadius: '4px',
            marginBottom: '0.65rem'
          }}>
            <Building2 size={26} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>
            EstateFlow Management System
          </h1>
          <p style={{ fontSize: '0.775rem', color: '#adb5bd', margin: '0.25rem 0 0' }}>
            Oracle 11g Database • Role-Based Authentication
          </p>
        </div>

        {/* Portal Selection Tabs (Bootstrap nav-tabs style) */}
        <div style={{
          display: 'flex',
          backgroundColor: '#e9ecef',
          borderBottom: '1px solid #dee2e6',
          padding: '0.4rem 0.5rem 0'
        }}>
          {Object.values(PORTAL_CONFIG).map((p) => {
            const isActive = activePortal === p.id;
            const TabIcon = p.icon;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPortal(p.id)}
                style={{
                  flex: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                  padding: '0.6rem 0.5rem',
                  fontSize: '0.825rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#212529' : '#6c757d',
                  backgroundColor: isActive ? '#ffffff' : 'transparent',
                  border: isActive ? '1px solid #dee2e6' : '1px solid transparent',
                  borderBottom: isActive ? '1px solid #ffffff' : '1px solid transparent',
                  borderRadius: '4px 4px 0 0',
                  marginBottom: isActive ? '-1px' : '0',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <TabIcon size={14} color={isActive ? p.badgeColor : '#6c757d'} />
                <span>{p.name}</span>
              </button>
            );
          })}
        </div>

        {/* Card Body */}
        <div style={{ padding: '1.5rem' }}>
          {/* Active Portal Info Banner */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            padding: '0.65rem 0.85rem',
            marginBottom: '1.25rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PortalIcon size={18} color={currentPortal.badgeColor} />
              <div>
                <strong style={{ fontSize: '0.85rem', color: '#212529' }}>{currentPortal.name}</strong>
                <div style={{ fontSize: '0.725rem', color: '#6c757d' }}>{currentPortal.description}</div>
              </div>
            </div>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              color: currentPortal.badgeColor,
              backgroundColor: '#ffffff',
              border: `1px solid ${currentPortal.badgeColor}40`,
              padding: '0.2rem 0.45rem',
              borderRadius: '3px'
            }}>
              {currentPortal.badge}
            </span>
          </div>

          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#f8d7da',
              color: '#842029',
              border: '1px solid #f5c2c7',
              borderRadius: '4px',
              padding: '0.65rem 0.85rem',
              fontSize: '0.825rem',
              marginBottom: '1.15rem'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.825rem', fontWeight: 600 }}>
                <User size={13} color="#495057" /> Username:
              </label>
              <input
                type="text"
                className="form-control"
                required
                placeholder="Enter database username..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.825rem', fontWeight: 600 }}>
                <Lock size={13} color="#495057" /> Password:
              </label>
              <input
                type="password"
                className="form-control"
                required
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.55rem 1rem',
                fontWeight: 600,
                fontSize: '0.9rem'
              }}
              disabled={loading}
            >
              <LogIn size={15} />
              {loading ? 'Authenticating with Oracle...' : `Sign In to ${currentPortal.name}`}
            </button>
          </form>

          {/* Quick Demo Fill Credentials Box */}
          <div style={{
            marginTop: '1.25rem',
            padding: '0.75rem',
            backgroundColor: '#f8f9fa',
            border: '1px solid #e9ecef',
            borderRadius: '4px',
            fontSize: '0.75rem',
            color: '#495057'
          }}>
            <div style={{ fontWeight: 600, color: '#0d6efd', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <CheckCircle size={13} /> Quick-Fill Demo Credentials (Click to load):
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.35rem', marginTop: '0.4rem' }}>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                style={{ fontSize: '0.7rem', padding: '0.2rem 0.35rem' }}
                onClick={() => handleSelectPortal('admin')}
              >
                admin
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                style={{ fontSize: '0.7rem', padding: '0.2rem 0.35rem' }}
                onClick={() => handleSelectPortal('agent')}
              >
                agent1
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                style={{ fontSize: '0.7rem', padding: '0.2rem 0.35rem' }}
                onClick={() => handleSelectPortal('client')}
              >
                client1
              </button>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#6c757d', marginTop: '0.35rem', textAlign: 'center' }}>
              All accounts default to password: <code>password123</code>
            </div>
          </div>
        </div>

        {/* Card Footer */}
        <div style={{
          backgroundColor: '#f8f9fa',
          borderTop: '1px solid #dee2e6',
          padding: '0.65rem 1rem',
          textAlign: 'center',
          fontSize: '0.7rem',
          color: '#6c757d'
        }}>
          Real Estate Sales Management System — University DBMS Project (Oracle 11g XE)
        </div>
      </div>
    </div>
  );
}
