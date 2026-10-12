import React, { useState, useEffect } from 'react';
import api from '../api/client';
import {
  Building2,
  CalendarCheck,
  DollarSign,
  Handshake,
  User,
  MapPin,
  CheckCircle,
  Clock,
  Phone
} from 'lucide-react';
import StatCard from '../components/StatCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import StatusBadge from '../components/StatusBadge';
import { formatCurrency, formatNumber } from '../utils/formatters';

export default function AgentDashboard({ showToast }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const storedUser = typeof localStorage !== 'undefined'
    ? JSON.parse(localStorage.getItem('estateflow_user') || 'null')
    : null;

  useEffect(() => {
    fetchAgentDashboard();
  }, []);

  async function fetchAgentDashboard() {
    setLoading(true);
    try {
      const res = await api.get('/dashboard/agent');
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      if (showToast) showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <LoadingSkeleton text="Loading agent portfolio and assigned showings from Oracle DB..." />;
  }

  const agent = data?.agent || {};
  const metrics = data?.metrics || {};
  const showings = data?.showings || [];
  const properties = data?.properties || [];
  const offers = data?.offers || [];

  return (
    <div>
      {/* Agent Identity Profile Banner */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #dee2e6',
        borderLeft: '4px solid #0d6efd',
        borderRadius: '4px',
        padding: '1rem 1.25rem',
        marginBottom: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '4px',
            backgroundColor: '#0d6efd',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <User size={22} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#212529' }}>
              {agent.AGENT_NAME || storedUser?.linkedName || 'Licensed Agent'}
            </h2>
            <div style={{ fontSize: '0.8rem', color: '#6c757d', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.15rem' }}>
              <span>Agent ID: <strong>#{agent.AGENT_ID || storedUser?.referenceId || 9001}</strong></span>
              <span>•</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                <MapPin size={12} /> {agent.OFFICE_NAME || storedUser?.linkedDetails || 'Downtown Luxury Branch'}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            fontSize: '0.75rem',
            backgroundColor: '#e7f1ff',
            color: '#0d6efd',
            border: '1px solid #b6d4fe',
            padding: '0.25rem 0.6rem',
            borderRadius: '3px',
            fontWeight: 600
          }}>
            Agent Portal Active
          </span>
          <span style={{
            fontSize: '0.75rem',
            backgroundColor: '#d1e7dd',
            color: '#0f5132',
            border: '1px solid #badbcc',
            padding: '0.25rem 0.6rem',
            borderRadius: '3px',
            fontWeight: 600
          }}>
            Data Scope: Isolated by Agent ID
          </span>
        </div>
      </div>

      {/* 4 Agent Metric Cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: '1.25rem' }}>
        <StatCard
          label="My Assigned Properties"
          value={formatNumber(metrics.ASSIGNED_PROPERTIES)}
          subtext={`${formatNumber(metrics.ACTIVE_PROPERTIES)} Active • ${formatNumber(metrics.PENDING_PROPERTIES)} Pending`}
          icon={Building2}
          color="#0d6efd"
          variant="widget-blue"
        />

        <StatCard
          label="Total Sales Volume"
          value={formatCurrency(metrics.TOTAL_SALES_VOLUME)}
          subtext={`${formatNumber(metrics.TOTAL_SALES_COUNT)} finalized sales transaction(s)`}
          icon={DollarSign}
          color="#198754"
          variant="widget-green"
        />

        <StatCard
          label="Scheduled Showings"
          value={formatNumber(metrics.TOTAL_SHOWINGS)}
          subtext="Appointments on assigned properties"
          icon={CalendarCheck}
          color="#6f42c1"
          variant="widget-purple"
        />

        <StatCard
          label="Pending Purchase Offers"
          value={formatNumber(metrics.PENDING_OFFERS)}
          subtext="Buyer offers awaiting review"
          icon={Handshake}
          color="#fd7e14"
          variant="widget-orange"
        />
      </div>

      {/* Table 1: Upcoming Scheduled Showings */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
            <CalendarCheck size={16} color="#0d6efd" />
            <span>My Upcoming Scheduled Showings</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#6c757d' }}>
            Filtered by: <code>WHERE p.agent_id = {agent.AGENT_ID || 9001}</code>
          </span>
        </div>
        <div className="table-responsive">
          <table className="table table-bordered table-striped" style={{ margin: 0 }}>
            <thead>
              <tr>
                <th>Showing ID</th>
                <th>Showing Date</th>
                <th>Property Listing</th>
                <th>Listing Price</th>
                <th>Client Name</th>
                <th>Contact Phone</th>
              </tr>
            </thead>
            <tbody>
              {showings.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '1.5rem', color: '#6c757d' }}>
                    No showings currently scheduled for your properties.
                  </td>
                </tr>
              ) : (
                showings.map((s) => (
                  <tr key={s.SHOWING_ID}>
                    <td><strong>#{s.SHOWING_ID}</strong></td>
                    <td>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600, color: '#0d6efd' }}>
                        <Clock size={13} /> {s.SHOWING_DATE}
                      </div>
                    </td>
                    <td>
                      <div><strong>{s.PROPERTY_ID}</strong></div>
                      <div style={{ fontSize: '0.75rem', color: '#6c757d' }}>{s.PROPERTY_ADDRESS}</div>
                    </td>
                    <td>{formatCurrency(s.LISTING_PRICE)}</td>
                    <td>
                      <strong>{s.CLIENT_NAME}</strong>
                      <span style={{ fontSize: '0.75rem', color: '#6c757d', marginLeft: '0.3rem' }}>(#{s.CLIENT_ID})</span>
                    </td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem' }}>
                        <Phone size={12} color="#6c757d" /> {s.CLIENT_PHONE || 'N/A'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid: Properties and Offers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.25rem' }}>
        {/* Table 2: Assigned Property Listings */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
              <Building2 size={16} color="#198754" />
              <span>My Property Listings ({properties.length})</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#6c757d' }}>PROPERTY table</span>
          </div>
          <div className="table-responsive">
            <table className="table table-bordered table-striped" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th>Prop ID</th>
                  <th>Address</th>
                  <th>Price</th>
                  <th>Category</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {properties.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '1.5rem', color: '#6c757d' }}>
                      No properties assigned to this agent.
                    </td>
                  </tr>
                ) : (
                  properties.map((p) => (
                    <tr key={p.PROPERTY_ID}>
                      <td><strong>{p.PROPERTY_ID}</strong></td>
                      <td style={{ fontSize: '0.85rem' }}>{p.ADDRESS}</td>
                      <td style={{ fontWeight: 600 }}>{formatCurrency(p.LISTING_PRICE)}</td>
                      <td>{p.CATEGORY_NAME || 'Residential'}</td>
                      <td><StatusBadge status={p.STATUS} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 3: Offers Received */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
              <Handshake size={16} color="#fd7e14" />
              <span>Recent Offers on My Properties ({offers.length})</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#6c757d' }}>OFFER table</span>
          </div>
          <div className="table-responsive">
            <table className="table table-bordered table-striped" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th>Offer ID</th>
                  <th>Property</th>
                  <th>Buyer</th>
                  <th>Offer Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {offers.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '1.5rem', color: '#6c757d' }}>
                      No offers submitted on your properties yet.
                    </td>
                  </tr>
                ) : (
                  offers.map((o) => (
                    <tr key={o.OFFER_ID}>
                      <td><strong>#{o.OFFER_ID}</strong></td>
                      <td style={{ fontSize: '0.8rem' }}>{o.PROPERTY_ADDRESS}</td>
                      <td>{o.CLIENT_NAME}</td>
                      <td style={{ fontWeight: 600, color: '#0d6efd' }}>{formatCurrency(o.OFFER_AMOUNT)}</td>
                      <td><StatusBadge status={o.OFFER_STATUS} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
