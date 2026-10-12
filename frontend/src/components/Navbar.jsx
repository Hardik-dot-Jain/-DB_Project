import React from 'react';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Building2,
  UserCheck,
  CalendarCheck,
  Handshake,
  ReceiptText,
  BarChart3,
  Database,
  RefreshCw,
  LogOut,
  User,
  ShieldCheck,
  Briefcase,
  Home
} from 'lucide-react';

export default function Navbar({ currentPage, onNavigate, dbStatus, onRefreshDb, user, onLogout }) {
  const displayUser = user || (typeof localStorage !== 'undefined' && JSON.parse(localStorage.getItem('estateflow_user') || 'null'));
  const role = String(displayUser?.role || 'admin').toLowerCase();

  // Define role-specific navigation menus
  let navItems = [];

  if (role === 'client') {
    navItems = [
      { id: 'client-dashboard', label: 'My Portal', icon: LayoutDashboard },
      { id: 'properties', label: 'Browse Properties', icon: Building2 },
      { id: 'showings', label: 'My Viewings', icon: CalendarCheck },
      { id: 'offers', label: 'My Offers', icon: Handshake }
    ];
  } else if (role === 'agent') {
    navItems = [
      { id: 'agent-dashboard', label: 'Agent Dashboard', icon: LayoutDashboard },
      { id: 'properties', label: 'My Properties', icon: Building2 },
      { id: 'showings', label: 'Showings', icon: CalendarCheck },
      { id: 'offers', label: 'Offers', icon: Handshake },
      { id: 'transactions', label: 'Transactions', icon: ReceiptText },
      { id: 'clients', label: 'Clients', icon: UserCheck }
    ];
  } else {
    // Admin (Full System Navigation)
    navItems = [
      { id: 'admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'agents', label: 'Agents', icon: Users },
      { id: 'categories', label: 'Categories', icon: FolderKanban },
      { id: 'properties', label: 'Properties', icon: Building2 },
      { id: 'clients', label: 'Clients', icon: UserCheck },
      { id: 'showings', label: 'Showings', icon: CalendarCheck },
      { id: 'offers', label: 'Offers', icon: Handshake },
      { id: 'transactions', label: 'Transactions', icon: ReceiptText },
      { id: 'reports', label: 'Reports', icon: BarChart3 }
    ];
  }

  // Determine active item matching
  function isItemActive(itemId) {
    if (currentPage === itemId) return true;
    if (itemId === 'admin-dashboard' && (currentPage === 'dashboard' || currentPage === 'admin-dashboard')) return true;
    if (itemId === 'agent-dashboard' && (currentPage === 'dashboard' || currentPage === 'agent-dashboard')) return true;
    if (itemId === 'client-dashboard' && (currentPage === 'dashboard' || currentPage === 'client-dashboard')) return true;
    return false;
  }

  // Get Role Icon and Display Label
  function getRoleBadgeInfo() {
    if (role === 'agent') {
      return {
        label: displayUser?.referenceId ? `Agent #${displayUser.referenceId}` : 'Agent',
        color: '#6f42c1',
        bgColor: '#3c246b',
        icon: Briefcase
      };
    }
    if (role === 'client') {
      return {
        label: displayUser?.referenceId ? `Client #${displayUser.referenceId}` : 'Client',
        color: '#198754',
        bgColor: '#13472c',
        icon: Home
      };
    }
    return {
      label: 'Admin',
      color: '#0d6efd',
      bgColor: '#173b75',
      icon: ShieldCheck
    };
  }

  const roleBadge = getRoleBadgeInfo();
  const RoleIcon = roleBadge.icon;

  return (
    <header className="top-navbar">
      <div className="navbar-brand">
        <Database size={16} color="#0d6efd" />
        <span>Real Estate Sales System</span>
        <span className="navbar-brand-badge">Oracle 11g</span>
      </div>

      <nav className="navbar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = isItemActive(item.id);
          return (
            <button
              key={item.id}
              className={`nav-link ${isActive ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
              title={item.label}
            >
              <Icon size={14} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="navbar-status">
        <span
          className={`db-status-badge ${dbStatus.connected ? 'connected' : 'disconnected'}`}
          title={dbStatus.connectString ? `Connected to ${dbStatus.connectString} (${dbStatus.schema || 'SYSTEM'})` : 'Database offline'}
        >
          <span style={{ fontSize: '9px' }}>●</span>
          {dbStatus.connected ? 'Oracle DB' : 'DB Offline'}
        </span>

        <button
          className="btn btn-secondary btn-sm"
          onClick={onRefreshDb}
          title="Refresh database connection status"
          style={{ padding: '0.18rem 0.45rem' }}
        >
          <RefreshCw size={12} />
        </button>

        {/* User Info & Logout Button */}
        {displayUser && (
          <div className="navbar-user-box">
            <span
              className="navbar-user-badge"
              style={{
                borderColor: roleBadge.color,
                backgroundColor: roleBadge.bgColor
              }}
              title={displayUser.linkedName ? `${displayUser.linkedName} (${roleBadge.label})` : roleBadge.label}
            >
              <RoleIcon size={12} color={roleBadge.color} />
              <span style={{ fontWeight: 600 }}>{displayUser.username}</span>
              <span className="navbar-user-role" style={{ color: '#ced4da', fontSize: '0.675rem' }}>
                ({roleBadge.label})
              </span>
            </span>

            <button
              className="btn-logout"
              onClick={onLogout}
              title="Sign out of system"
            >
              <LogOut size={12} /> Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
