import React, { useState, useEffect } from 'react';
import api from '../api/client';
import {
  CalendarCheck,
  Handshake,
  CheckCircle,
  Building2,
  User,
  Phone,
  Clock,
  Tag,
  DollarSign
} from 'lucide-react';
import StatCard from '../components/StatCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import StatusBadge from '../components/StatusBadge';
import { formatCurrency, formatNumber } from '../utils/formatters';

export default function ClientDashboard({ showToast }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const storedUser = typeof localStorage !== 'undefined'
    ? JSON.parse(localStorage.getItem('estateflow_user') || 'null')
    : null;

  useEffect(() => {
    fetchClientDashboard();
  }, []);

  async function fetchClientDashboard() {
    setLoading(true);
    try {
      const res = await api.get('/dashboard/client');
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
    return <LoadingSkeleton text="Loading your viewings, offers, and property portfolio from Oracle DB..." />;
  }

  const client = data?.client || {};
  const metrics = data?.metrics || {};
  const viewings = data?.viewings || [];
  const offers = data?.offers || [];
  const activeProperties = data?.activeProperties || [];

  return (
    <div>
      {/* Client Identity Profile Banner */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #dee2e6',
        borderLeft: '4px solid #198754',
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
            backgroundColor: '#198754',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <User size={22} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#212529' }}>
              {client.CLIENT_NAME || storedUser?.linkedName || 'Registered Client'}
            </h2>
            <div style={{ fontSize: '0.8rem', color: '#6c757d', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.15rem' }}>
              <span>Client ID: <strong>#{client.CLIENT_ID || storedUser?.referenceId || 2001}</strong></span>
              <span>•</span>
              <span>Account Type: <strong>{client.CLIENT_TYPE || storedUser?.linkedDetails || 'Buyer'}</strong></span>
              {client.PHONE && (
                <>
                  <span>•</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                    <Phone size={12} /> {client.PHONE}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            fontSize: '0.75rem',
            backgroundColor: '#d1e7dd',
            color: '#0f5132',
            border: '1px solid #badbcc',
            padding: '0.25rem 0.6rem',
            borderRadius: '3px',
            fontWeight: 600
          }}>
            Client Portal Active
          </span>
          <span style={{
            fontSize: '0.75rem',
            backgroundColor: '#e2e3e5',
            color: '#383d41',
            border: '1px solid #d6d8db',
            padding: '0.25rem 0.6rem',
            borderRadius: '3px',
            fontWeight: 600
          }}>
            Scope: Isolated by Client ID
          </span>
        </div>
      </div>

      {/* 4 Client Metric Cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: '1.25rem' }}>
        <StatCard
          label="My Scheduled Viewings"
          value={formatNumber(metrics.TOTAL_VIEWINGS)}
          subtext="Upcoming and attended appointments"
          icon={CalendarCheck}
          color="#0d6efd"
          variant="widget-blue"
        />

        <StatCard
          label="Purchase Offers Made"
          value={formatNumber(metrics.TOTAL_OFFERS)}
          subtext={`${formatNumber(metrics.PENDING_OFFERS)} pending • ${formatNumber(metrics.ACCEPTED_OFFERS)} accepted`}
          icon={Handshake}
          color="#fd7e14"
          variant="widget-orange"
        />

        <StatCard
          label="Accepted Offers"
          value={formatNumber(metrics.ACCEPTED_OFFERS)}
          subtext="Purchase agreements approved"
          icon={CheckCircle}
          color="#198754"
          variant="widget-green"
        />

        <StatCard
          label="Completed Purchases"
          value={formatNumber(metrics.COMPLETED_PURCHASES)}
          subtext="Finalized sales contracts"
          icon={DollarSign}
          color="#6f42c1"
          variant="widget-purple"
        />
      </div>

      {/* Section 1: My Scheduled Property Viewings */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
            <CalendarCheck size={16} color="#0d6efd" />
            <span>My Scheduled Property Viewings ({viewings.length})</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#6c757d' }}>
            Filtered by: <code>WHERE s.client_id = {client.CLIENT_ID || 2001}</code>
          </span>
        </div>
        <div className="table-responsive">
          <table className="table table-bordered table-striped" style={{ margin: 0 }}>
            <thead>
              <tr>
                <th>Showing ID</th>
                <th>Appointment Date</th>
                <th>Property Address</th>
                <th>Listing Price</th>
                <th>Status</th>
                <th>Assigned Agent</th>
              </tr>
            </thead>
            <tbody>
              {viewings.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '1.5rem', color: '#6c757d' }}>
                    You have no property showings scheduled at this time.
                  </td>
                </tr>
              ) : (
                viewings.map((v) => (
                  <tr key={v.SHOWING_ID}>
                    <td><strong>#{v.SHOWING_ID}</strong></td>
                    <td>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600, color: '#0d6efd' }}>
                        <Clock size={13} /> {v.SHOWING_DATE}
                      </div>
                    </td>
                    <td>
                      <div><strong>{v.PROPERTY_ID}</strong></div>
                      <div style={{ fontSize: '0.75rem', color: '#6c757d' }}>{v.PROPERTY_ADDRESS}</div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(v.LISTING_PRICE)}</td>
                    <td><StatusBadge status={v.PROPERTY_STATUS} /></td>
                    <td>{v.AGENT_NAME || 'Unassigned'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2: My Purchase Offers */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
            <Handshake size={16} color="#fd7e14" />
            <span>My Purchase Offers & Status Reviews ({offers.length})</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#6c757d' }}>
            Filtered by: <code>WHERE o.client_id = {client.CLIENT_ID || 2001}</code>
          </span>
        </div>
        <div className="table-responsive">
          <table className="table table-bordered table-striped" style={{ margin: 0 }}>
            <thead>
              <tr>
                <th>Offer ID</th>
                <th>Property Listing</th>
                <th>Listing Price</th>
                <th>My Offer Amount</th>
                <th>Offer Status</th>
                <th>Listing Agent</th>
              </tr>
            </thead>
            <tbody>
              {offers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '1.5rem', color: '#6c757d' }}>
                    You have not submitted any property purchase offers yet.
                  </td>
                </tr>
              ) : (
                offers.map((o) => (
                  <tr key={o.OFFER_ID}>
                    <td><strong>#{o.OFFER_ID}</strong></td>
                    <td>
                      <div><strong>{o.PROPERTY_ID}</strong></div>
                      <div style={{ fontSize: '0.75rem', color: '#6c757d' }}>{o.PROPERTY_ADDRESS}</div>
                    </td>
                    <td>{formatCurrency(o.LISTING_PRICE)}</td>
                    <td style={{ fontWeight: 700, color: '#0d6efd' }}>{formatCurrency(o.OFFER_AMOUNT)}</td>
                    <td><StatusBadge status={o.OFFER_STATUS} /></td>
                    <td>{o.AGENT_NAME || 'Unassigned'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 3: Available Properties to Explore */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
            <Building2 size={16} color="#198754" />
            <span>Available Properties on the Market</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#6c757d' }}>
            Active listings available for viewing or offers
          </span>
        </div>
        <div className="table-responsive">
          <table className="table table-bordered table-striped" style={{ margin: 0 }}>
            <thead>
              <tr>
                <th>Property ID</th>
                <th>Address</th>
                <th>Category</th>
                <th>Listing Price</th>
                <th>Listing Agent</th>
                <th>Market Status</th>
              </tr>
            </thead>
            <tbody>
              {activeProperties.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '1.5rem', color: '#6c757d' }}>
                    No active properties currently available.
                  </td>
                </tr>
              ) : (
                activeProperties.map((p) => (
                  <tr key={p.PROPERTY_ID}>
                    <td><strong>{p.PROPERTY_ID}</strong></td>
                    <td style={{ fontSize: '0.85rem' }}>{p.ADDRESS}</td>
                    <td>{p.CATEGORY_NAME || 'Residential'}</td>
                    <td style={{ fontWeight: 600, color: '#198754' }}>{formatCurrency(p.LISTING_PRICE)}</td>
                    <td>{p.AGENT_NAME || 'Assigned Agent'}</td>
                    <td><StatusBadge status={p.STATUS} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
