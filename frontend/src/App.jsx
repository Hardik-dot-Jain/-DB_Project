import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import api from './api/client';
import Navbar from './components/Navbar';
import Header from './components/Header';
import Toast from './components/Toast';
import DbStatusBanner from './components/DbStatusBanner';

// Pages
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import AgentDashboard from './pages/AgentDashboard';
import ClientDashboard from './pages/ClientDashboard';
import DashboardPage from './pages/DashboardPage';
import AgentsPage from './pages/AgentsPage';
import CategoriesPage from './pages/CategoriesPage';
import PropertiesPage from './pages/PropertiesPage';
import ClientsPage from './pages/ClientsPage';
import ShowingsPage from './pages/ShowingsPage';
import OffersPage from './pages/OffersPage';
import TransactionsPage from './pages/TransactionsPage';
import ReportsPage from './pages/ReportsPage';

const PAGE_METADATA = {
  'admin-dashboard': {
    title: 'Administrator System Dashboard',
    subtitle: 'System metrics, property inventory status, and sales volume summary'
  },
  'agent-dashboard': {
    title: 'Licensed Agent Portal',
    subtitle: 'My assigned property listings, upcoming scheduled showings, and buyer offers'
  },
  'client-dashboard': {
    title: 'Client & Buyer Portal',
    subtitle: 'My scheduled property viewings, submitted purchase offers, and available listings'
  },
  dashboard: {
    title: 'Dashboard Overview',
    subtitle: 'System metrics, property inventory status, and sales volume summary'
  },
  agents: {
    title: 'Real Estate Agents',
    subtitle: 'Manage agent records and branch office assignments (AGENT table)'
  },
  categories: {
    title: 'Property Categories',
    subtitle: 'Manage property classifications and descriptions (CATEGORY table)'
  },
  properties: {
    title: 'Property Listings',
    subtitle: 'Manage active, pending, and sold real estate properties (PROPERTY table)'
  },
  clients: {
    title: 'Clients Directory',
    subtitle: 'Manage registered buyers, sellers, and investors (CLIENT table)'
  },
  showings: {
    title: 'Scheduled Showings',
    subtitle: 'Track property viewings and client appointments (SHOWING table)'
  },
  offers: {
    title: 'Property Offers',
    subtitle: 'Manage client purchase offers and status reviews (OFFER table)'
  },
  transactions: {
    title: 'Sales Transactions',
    subtitle: 'Record finalized property sales transactions (TRANSACTION table)'
  },
  reports: {
    title: 'Database Reports & SQL Queries',
    subtitle: 'Oracle SQL aggregations, GROUP BY queries, multi-table joins, and CSV exports'
  }
};

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('estateflow_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [toasts, setToasts] = useState([]);
  const [dbStatus, setDbStatus] = useState({
    connected: false,
    schema: 'SYSTEM',
    mode: 'Checking...'
  });

  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem('estateflow_token');
  const isAuthenticated = Boolean(token && user);
  const userRole = String(user?.role || 'admin').toLowerCase();

  useEffect(() => {
    if (isAuthenticated) {
      checkDbHealth();
    }
  }, [isAuthenticated]);

  async function checkDbHealth() {
    try {
      const res = await api.get('/health/db');
      if (res.connected) {
        setDbStatus({
          connected: true,
          schema: res.schema || 'SYSTEM',
          mode: res.authMode || 'Active',
          connectString: res.connectString
        });
      } else {
        setDbStatus({
          connected: false,
          error: res.message || res.error
        });
      }
    } catch (err) {
      setDbStatus({
        connected: false,
        error: err.message || 'Could not connect to backend server'
      });
    }
  }

  function showToast(message, type = 'info') {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }

  function handleDismissToast(id) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  function handleLoginSuccess(userData) {
    setUser(userData);
    const role = String(userData.role || 'admin').toLowerCase();
    const portalName = role === 'agent' ? 'Agent Portal' : (role === 'client' ? 'Client Portal' : 'Admin Portal');
    showToast(`Welcome back, ${userData.username}! Logged into ${portalName}.`, 'success');
  }

  function handleLogout() {
    localStorage.removeItem('estateflow_token');
    localStorage.removeItem('estateflow_user');
    setUser(null);
    showToast('Signed out of EstateFlow.', 'info');
    navigate('/login');
  }

  function getDefaultLandingPath(role) {
    if (role === 'agent') return '/agent-dashboard';
    if (role === 'client') return '/client-dashboard';
    return '/admin-dashboard';
  }

  // Derive active tab from pathname
  const currentPath = location.pathname.replace(/^\//, '') || getDefaultLandingPath(userRole).replace(/^\//, '');
  const meta = PAGE_METADATA[currentPath] || PAGE_METADATA.dashboard;

  return (
    <div className="app-wrapper">
      <Routes>
        {/* Public Login Route */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to={getDefaultLandingPath(userRole)} replace />
            ) : (
              <LoginPage onLoginSuccess={handleLoginSuccess} />
            )
          }
        />

        {/* Protected App Routes */}
        <Route
          path="/*"
          element={
            !isAuthenticated ? (
              <Navigate to="/login" replace />
            ) : (
              <>
                {/* Top Horizontal Navbar */}
                <Navbar
                  currentPage={currentPath}
                  onNavigate={(pageId) => navigate('/' + pageId)}
                  dbStatus={dbStatus}
                  onRefreshDb={checkDbHealth}
                  user={user}
                  onLogout={handleLogout}
                />

                {/* Page Header Bar */}
                <Header
                  title={meta.title}
                  subtitle={meta.subtitle}
                  dbStatus={dbStatus}
                />

                {/* Main Content Area */}
                <main className="main-content">
                  <DbStatusBanner dbStatus={dbStatus} onRetry={checkDbHealth} />
                  <Routes>
                    {/* Role-based default redirects */}
                    <Route path="/" element={<Navigate to={getDefaultLandingPath(userRole)} replace />} />
                    <Route path="/dashboard" element={<Navigate to={getDefaultLandingPath(userRole)} replace />} />

                    {/* Role Landing Dashboards */}
                    <Route path="/admin-dashboard" element={<AdminDashboard showToast={showToast} />} />
                    <Route path="/agent-dashboard" element={<AgentDashboard showToast={showToast} />} />
                    <Route path="/client-dashboard" element={<ClientDashboard showToast={showToast} />} />

                    {/* Operational Entity Pages */}
                    <Route path="/agents" element={<AgentsPage showToast={showToast} />} />
                    <Route path="/categories" element={<CategoriesPage showToast={showToast} />} />
                    <Route path="/properties" element={<PropertiesPage showToast={showToast} />} />
                    <Route path="/clients" element={<ClientsPage showToast={showToast} />} />
                    <Route path="/showings" element={<ShowingsPage showToast={showToast} />} />
                    <Route path="/offers" element={<OffersPage showToast={showToast} />} />
                    <Route path="/transactions" element={<TransactionsPage showToast={showToast} />} />
                    <Route path="/reports" element={<ReportsPage showToast={showToast} />} />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to={getDefaultLandingPath(userRole)} replace />} />
                  </Routes>
                </main>

                {/* Footer */}
                <footer className="app-footer">
                  <div>
                    <strong>Real Estate Sales Management System</strong> — DBMS Project (Oracle Database 11g XE)
                  </div>
                  <div>
                    Active Session: <strong>{user?.username} ({userRole})</strong> • Connected Schema: <strong>{dbStatus.schema || 'SYSTEM'}</strong>
                  </div>
                </footer>
              </>
            )
          }
        />
      </Routes>

      {/* Global Toast Notifications */}
      <Toast toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}
