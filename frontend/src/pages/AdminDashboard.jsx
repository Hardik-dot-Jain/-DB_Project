import React, { useState, useEffect } from 'react';
import api from '../api/client';
import {
  Building2,
  Users,
  UserCheck,
  Handshake,
  ReceiptText,
  DollarSign
} from 'lucide-react';
import StatCard from '../components/StatCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { formatCurrency, formatNumber } from '../utils/formatters';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend
} from 'recharts';

const CHART_COLORS = ['#0d6efd', '#198754', '#ffc107', '#6f42c1', '#20c997', '#dc3545'];

export default function AdminDashboard({ showToast }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  async function fetchDashboard() {
    setLoading(true);
    try {
      const res = await api.get('/dashboard/admin');
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
    return <LoadingSkeleton text="Loading system metrics from Oracle Database..." />;
  }

  const metrics = data?.metrics || {};
  const charts = data?.charts || {};
  const recentTransactions = data?.recentTransactions || [];

  return (
    <div>
      {/* 6 Summary Stat Widgets */}
      <div className="stats-grid">
        <StatCard
          label="Active Properties"
          value={formatNumber(metrics.ACTIVE_PROPERTIES)}
          subtext={`Total listings: ${formatNumber(metrics.TOTAL_PROPERTIES)}`}
          icon={Building2}
          color="#0d6efd"
          variant="widget-blue"
        />

        <StatCard
          label="Total Agents"
          value={formatNumber(metrics.TOTAL_AGENTS)}
          subtext="Active brokers in AGENT table"
          icon={Users}
          color="#6f42c1"
          variant="widget-purple"
        />

        <StatCard
          label="Total Clients"
          value={formatNumber(metrics.TOTAL_CLIENTS)}
          subtext="Buyers, sellers & investors"
          icon={UserCheck}
          color="#20c997"
          variant="widget-teal"
        />

        <StatCard
          label="Pending Offers"
          value={formatNumber(metrics.PENDING_OFFERS)}
          subtext="Awaiting seller decision"
          icon={Handshake}
          color="#fd7e14"
          variant="widget-orange"
        />

        <StatCard
          label="Completed Sales"
          value={formatNumber(metrics.TOTAL_SALES)}
          subtext="Finalized transactions"
          icon={ReceiptText}
          color="#198754"
          variant="widget-green"
        />

        <StatCard
          label="Total Sales Volume"
          value={formatCurrency(metrics.TOTAL_SALES_VOLUME)}
          subtext={`Avg list: ${formatCurrency(metrics.AVG_LISTING_PRICE)}`}
          icon={DollarSign}
          color="#198754"
          variant="widget-green"
        />
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Chart 1: Properties by Status */}
        <div className="card">
          <div className="card-header">
            <span>Properties by Status</span>
            <span style={{ fontSize: '0.75rem', color: '#6c757d', fontWeight: 400 }}>PROPERTY table distribution</span>
          </div>
          <div className="card-body">
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={charts.propertiesByStatus || []}
                    dataKey="COUNT"
                    nameKey="STATUS"
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    label={({ STATUS, COUNT }) => `${STATUS}: ${COUNT}`}
                  >
                    {(charts.propertiesByStatus || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Chart 2: Properties by Category */}
        <div className="card">
          <div className="card-header">
            <span>Properties by Category</span>
            <span style={{ fontSize: '0.75rem', color: '#6c757d', fontWeight: 400 }}>Grouped by CATEGORY table</span>
          </div>
          <div className="card-body">
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer>
                <BarChart data={charts.propertiesByCategory || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                  <XAxis dataKey="CATEGORY_NAME" stroke="#6c757d" fontSize={11} />
                  <YAxis allowDecimals={false} stroke="#6c757d" fontSize={11} />
                  <Tooltip formatter={(val) => [val, 'Count']} />
                  <Bar dataKey="COUNT" fill="#0d6efd" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Chart 3: Offer Statuses */}
        <div className="card">
          <div className="card-header">
            <span>Offer Status Breakdown</span>
            <span style={{ fontSize: '0.75rem', color: '#6c757d', fontWeight: 400 }}>Grouped by OFFER table</span>
          </div>
          <div className="card-body">
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer>
                <BarChart data={charts.offerStatuses || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                  <XAxis dataKey="STATUS" stroke="#6c757d" fontSize={11} />
                  <YAxis allowDecimals={false} stroke="#6c757d" fontSize={11} />
                  <Tooltip formatter={(val) => [val, 'Offers']} />
                  <Bar dataKey="COUNT" fill="#198754" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Chart 4: Sales Value by Date */}
        <div className="card">
          <div className="card-header">
            <span>Sales Value by Date</span>
            <span style={{ fontSize: '0.75rem', color: '#6c757d', fontWeight: 400 }}>TRANSACTION table query</span>
          </div>
          <div className="card-body">
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer>
                <LineChart data={charts.salesByDate || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                  <XAxis dataKey="SALE_DATE" stroke="#6c757d" fontSize={11} />
                  <YAxis stroke="#6c757d" fontSize={11} tickFormatter={(v) => `$${v / 1000}k`} />
                  <Tooltip formatter={(val) => [formatCurrency(val), 'Sale Volume']} />
                  <Line
                    type="monotone"
                    dataKey="DAILY_TOTAL"
                    stroke="#0d6efd"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Finalized Transactions Table */}
      <div className="card">
        <div className="card-header">
          <span>Recent Finalized Transactions</span>
          <span style={{ fontSize: '0.75rem', color: '#6c757d', fontWeight: 400 }}>Live records from TRANSACTION</span>
        </div>
        <div className="table-responsive">
          <table className="table table-bordered table-striped" style={{ margin: 0 }}>
            <thead>
              <tr>
                <th>Tx ID</th>
                <th>Property</th>
                <th>Client Name</th>
                <th>Sale Price</th>
                <th>Sale Date</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '1.5rem', color: '#6c757d' }}>
                    No transactions recorded.
                  </td>
                </tr>
              ) : (
                recentTransactions.map((tx) => (
                  <tr key={tx.TRANSACTION_ID}>
                    <td>
                      <strong>#{tx.TRANSACTION_ID}</strong>
                    </td>
                    <td>
                      <div><strong>{tx.PROPERTY_ID}</strong></div>
                      <div style={{ fontSize: '0.75rem', color: '#6c757d' }}>{tx.PROPERTY_ADDRESS}</div>
                    </td>
                    <td>{tx.CLIENT_NAME}</td>
                    <td style={{ fontWeight: 600, color: '#198754' }}>
                      {formatCurrency(tx.SALE_PRICE)}
                    </td>
                    <td>{tx.SALE_DATE}</td>
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
