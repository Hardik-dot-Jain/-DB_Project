import React, { useState, useEffect } from 'react';
import api from '../api/client';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { exportToCsv } from '../utils/exportCsv';
import { formatCurrency, formatNumber, formatDate } from '../utils/formatters';
import {
  DollarSign,
  Building,
  Award,
  Receipt,
  PieChart as PieIcon,
  Download,
  RefreshCw,
  TrendingUp,
  Sliders
} from 'lucide-react';

export default function ReportsPage({ showToast }) {
  const [reports, setReports] = useState(null);
  const [soldSummary, setSoldSummary] = useState(null);
  const [topAgents, setTopAgents] = useState([]);
  const [havingThreshold, setHavingThreshold] = useState(1000000);
  const [loading, setLoading] = useState(true);
  const [loadingTopAgents, setLoadingTopAgents] = useState(false);

  useEffect(() => {
    fetchReports(havingThreshold);
  }, []);

  async function fetchReports(threshold = havingThreshold) {
    setLoading(true);
    try {
      const [allRes, soldRes, topRes] = await Promise.all([
        api.get(`/reports?threshold=${threshold}`),
        api.get('/reports/sold-summary'),
        api.get(`/reports/top-agents?threshold=${threshold}`)
      ]);

      if (allRes.success) setReports(allRes.data);
      if (soldRes.success) setSoldSummary(soldRes.data);
      if (topRes.success) setTopAgents(topRes.data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleThresholdChange(newThreshold) {
    setHavingThreshold(newThreshold);
    setLoadingTopAgents(true);
    try {
      const res = await api.get(`/reports/top-agents?threshold=${newThreshold}`);
      if (res.success) {
        setTopAgents(res.data);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoadingTopAgents(false);
    }
  }

  if (loading) {
    return <LoadingSkeleton text="Computing SQL aggregate reports from Oracle Database..." />;
  }

  const priceStats = reports?.priceStatistics || {};
  const categories = reports?.categoryDistribution || [];
  const agents = reports?.agentPerformance || [];
  const fullTx = reports?.fullTransactionDetails || [];
  const offerRates = reports?.offerSuccessRates || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
            Oracle SQL Analytical Reports
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#6c757d', margin: 0 }}>
            Demonstrating SUM, MIN, MAX, GROUP BY, HAVING, and Multi-Table Joins.
          </p>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={() => fetchReports(havingThreshold)}>
          <RefreshCw size={13} /> Refresh Reports
        </button>
      </div>

      {/* Feature 5: Market Summary Card Section (SUM, MIN, MAX, AVG) */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <TrendingUp size={16} color="#198754" />
            <span style={{ fontWeight: 700 }}>Market Summary of Sold Properties</span>
            <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>SUM / MIN / MAX</span>
            <code style={{ fontSize: '0.75rem', marginLeft: '0.35rem', color: '#6c757d' }}>
              SELECT COUNT(*), SUM(sale_price), MIN(sale_price), MAX(sale_price), AVG(sale_price) FROM transaction
            </code>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => exportToCsv('sold_market_summary', [soldSummary || {}])}
          >
            <Download size={13} /> Export CSV
          </button>
        </div>

        <div className="card-body">
          <div className="stats-grid" style={{ marginBottom: 0, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
            <div style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: 4 }}>
              <div style={{ fontSize: '0.75rem', color: '#6c757d', fontWeight: 600 }}>TOTAL SOLD VOLUME (SUM)</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#198754' }}>
                {formatCurrency(soldSummary?.TOTAL_SOLD_VOLUME || soldSummary?.total_sold_volume)}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#6c757d' }}>
                SUM(sale_price) across all closed deals
              </div>
            </div>

            <div style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: 4 }}>
              <div style={{ fontSize: '0.75rem', color: '#6c757d', fontWeight: 600 }}>MINIMUM SALE PRICE (MIN)</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0d6efd' }}>
                {formatCurrency(soldSummary?.MIN_SOLD_PRICE || soldSummary?.min_sold_price)}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#6c757d' }}>
                MIN(sale_price) lowest recorded sale
              </div>
            </div>

            <div style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: 4 }}>
              <div style={{ fontSize: '0.75rem', color: '#6c757d', fontWeight: 600 }}>MAXIMUM SALE PRICE (MAX)</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#6f42c1' }}>
                {formatCurrency(soldSummary?.MAX_SOLD_PRICE || soldSummary?.max_sold_price)}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#6c757d' }}>
                MAX(sale_price) highest recorded sale
              </div>
            </div>

            <div style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: 4 }}>
              <div style={{ fontSize: '0.75rem', color: '#6c757d', fontWeight: 600 }}>AVERAGE SALE PRICE (AVG)</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#212529' }}>
                {formatCurrency(soldSummary?.AVG_SOLD_PRICE || soldSummary?.avg_sold_price)}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#6c757d' }}>
                ROUND(AVG(sale_price), 2)
              </div>
            </div>

            <div style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: 4 }}>
              <div style={{ fontSize: '0.75rem', color: '#6c757d', fontWeight: 600 }}>TOTAL CLOSED TRANSACTIONS</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fd7e14' }}>
                {soldSummary?.TOTAL_SOLD_UNITS || soldSummary?.total_sold_units || 0} Units
              </div>
              <div style={{ fontSize: '0.7rem', color: '#6c757d' }}>
                COUNT(*) in TRANSACTION table
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature 2: GROUP BY & HAVING Table ("Top Performing Agents") */}
      <div className="card">
        <div className="card-header" style={{ flexWrap: 'wrap', gap: '0.65rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <Award size={16} color="#0d6efd" />
            <span style={{ fontWeight: 700 }}>Top Performing Agents</span>
            <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>GROUP BY & HAVING</span>
            <code style={{ fontSize: '0.75rem', marginLeft: '0.35rem', color: '#6c757d' }}>
              GROUP BY agent_id HAVING SUM(sale_price) &gt;= {havingThreshold}
            </code>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem' }}>
              <Sliders size={13} color="#495057" />
              <label style={{ fontWeight: 600, color: '#495057', margin: 0 }}>HAVING Threshold:</label>
              <select
                className="form-control"
                style={{ padding: '0.2rem 0.45rem', fontSize: '0.8rem', width: 'auto' }}
                value={havingThreshold}
                onChange={(e) => handleThresholdChange(Number(e.target.value))}
              >
                <option value={500000}>$500,000</option>
                <option value={1000000}>$1,000,000 (Default Requirement)</option>
                <option value={1200000}>$1,200,000</option>
                <option value={1500000}>$1,500,000</option>
                <option value={2000000}>$2,000,000</option>
              </select>
            </div>

            <button
              className="btn btn-secondary btn-sm"
              onClick={() => exportToCsv('top_performing_agents_having', topAgents)}
            >
              <Download size={13} /> Export CSV
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-bordered table-striped" style={{ margin: 0 }}>
            <thead>
              <tr>
                <th>Agent ID</th>
                <th>Agent Name</th>
                <th>Office / Branch</th>
                <th>Closed Transactions (COUNT)</th>
                <th>Total Closed Sales Volume (SUM)</th>
                <th>Average Sale Price (AVG)</th>
                <th>Price Range (MIN — MAX)</th>
              </tr>
            </thead>
            <tbody>
              {loadingTopAgents ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '1.5rem', color: '#6c757d' }}>
                    Re-querying Oracle Database with HAVING SUM(sale_price) &gt;= {havingThreshold}...
                  </td>
                </tr>
              ) : topAgents.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '1.5rem', color: '#6c757d' }}>
                    No agents have closed deals meeting HAVING SUM(sale_price) &gt;= {formatCurrency(havingThreshold)}. Try lowering the threshold filter above.
                  </td>
                </tr>
              ) : (
                topAgents.map((ag) => (
                  <tr key={ag.AGENT_ID}>
                    <td><strong>#{ag.AGENT_ID}</strong></td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{ag.AGENT_NAME}</span>
                    </td>
                    <td>
                      <span className="badge badge-secondary">{ag.OFFICE_NAME || 'Main'}</span>
                    </td>
                    <td>
                      <span className="badge badge-primary">{ag.TRANSACTIONS_CLOSED} deal(s)</span>
                    </td>
                    <td style={{ fontWeight: 700, color: '#198754' }}>
                      {formatCurrency(ag.TOTAL_SALES_VOLUME)}
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {formatCurrency(ag.AVG_SALE_PRICE)}
                    </td>
                    <td style={{ color: '#6c757d', fontSize: '0.85rem' }}>
                      {formatCurrency(ag.MIN_SALE_PRICE)} — {formatCurrency(ag.MAX_SALE_PRICE)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 1. Price Statistics Overview */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <DollarSign size={16} color="#0d6efd" />
            <span>1. Listing Price Statistical Summary</span>
            <code style={{ fontSize: '0.75rem', marginLeft: '0.5rem', color: '#6c757d' }}>SELECT AVG, MIN, MAX, STDDEV FROM PROPERTY</code>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => exportToCsv('price_statistics', [priceStats])}
          >
            <Download size={13} /> Export CSV
          </button>
        </div>

        <div className="card-body">
          <div className="stats-grid" style={{ marginBottom: 0, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
            <div style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: 4 }}>
              <div style={{ fontSize: '0.75rem', color: '#6c757d', fontWeight: 600 }}>AVERAGE PRICE</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0d6efd' }}>
                {formatCurrency(priceStats.AVG_PRICE)}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#6c757d' }}>All listings</div>
            </div>

            <div style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: 4 }}>
              <div style={{ fontSize: '0.75rem', color: '#6c757d', fontWeight: 600 }}>MINIMUM PRICE</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#198754' }}>
                {formatCurrency(priceStats.MIN_PRICE)}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#6c757d' }}>Lowest listing</div>
            </div>

            <div style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: 4 }}>
              <div style={{ fontSize: '0.75rem', color: '#6c757d', fontWeight: 600 }}>MAXIMUM PRICE</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#6f42c1' }}>
                {formatCurrency(priceStats.MAX_PRICE)}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#6c757d' }}>Highest listing</div>
            </div>

            <div style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: 4 }}>
              <div style={{ fontSize: '0.75rem', color: '#6c757d', fontWeight: 600 }}>TOTAL INVENTORY VALUE</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#212529' }}>
                {formatCurrency(priceStats.TOTAL_INVENTORY_VALUE)}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#6c757d' }}>{priceStats.TOTAL_PROPERTIES} total properties</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Category Distribution */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Building size={16} color="#198754" />
            <span>2. Property Counts & Valuation by Category</span>
            <code style={{ fontSize: '0.75rem', marginLeft: '0.5rem', color: '#6c757d' }}>GROUP BY category_id, category_name</code>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => exportToCsv('category_breakdown_report', categories)}
          >
            <Download size={13} /> Export CSV
          </button>
        </div>

        <div className="table-responsive">
          <table className="table table-bordered table-striped" style={{ margin: 0 }}>
            <thead>
              <tr>
                <th>Category Name</th>
                <th>Properties Listed</th>
                <th>Avg Listing Price</th>
                <th>Price Range (Min - Max)</th>
                <th>Total Category Value</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.CATEGORY_ID}>
                  <td>
                    <strong>{c.CATEGORY_NAME}</strong>
                    <div style={{ fontSize: '0.75rem', color: '#6c757d' }}>{c.DESCRIPTION}</div>
                  </td>
                  <td>
                    <span className="badge badge-secondary">{c.PROPERTY_COUNT} listing(s)</span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{formatCurrency(c.AVG_LISTING_PRICE)}</td>
                  <td style={{ color: '#6c757d' }}>
                    {c.PROPERTY_COUNT > 0
                      ? `${formatCurrency(c.MIN_PRICE)} — ${formatCurrency(c.MAX_PRICE)}`
                      : '—'}
                  </td>
                  <td style={{ fontWeight: 600, color: '#198754' }}>
                    {formatCurrency(c.TOTAL_INVENTORY_VALUE)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Agent Performance */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Award size={16} color="#6f42c1" />
            <span>3. Real Estate Agent Performance Portfolio</span>
            <code style={{ fontSize: '0.75rem', marginLeft: '0.5rem', color: '#6c757d' }}>GROUP BY agent_id, agent_name</code>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => exportToCsv('agent_performance_report', agents)}
          >
            <Download size={13} /> Export CSV
          </button>
        </div>

        <div className="table-responsive">
          <table className="table table-bordered table-striped" style={{ margin: 0 }}>
            <thead>
              <tr>
                <th>Agent</th>
                <th>Office / Branch</th>
                <th>Properties Managed</th>
                <th>Active Listings</th>
                <th>Sold Deals</th>
                <th>Avg Listing Price</th>
                <th>Total Managed Volume</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((a) => (
                <tr key={a.AGENT_ID}>
                  <td>
                    <strong>{a.AGENT_NAME}</strong>
                    <span style={{ fontSize: '0.75rem', color: '#6c757d', marginLeft: '0.35rem' }}>ID #{a.AGENT_ID}</span>
                  </td>
                  <td>
                    <span className="badge badge-secondary">{a.OFFICE_NAME || 'Main'}</span>
                  </td>
                  <td>
                    <strong>{a.PROPERTIES_MANAGED}</strong>
                  </td>
                  <td>
                    <span className="badge badge-success">{a.ACTIVE_LISTINGS}</span>
                  </td>
                  <td>
                    <span className="badge badge-primary">{a.PROPERTIES_SOLD}</span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{formatCurrency(a.AVG_LISTING_PRICE)}</td>
                  <td style={{ fontWeight: 600, color: '#0d6efd' }}>
                    {formatCurrency(a.TOTAL_MANAGED_VALUE)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Full Transaction Details (Multi-Table Joins) */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Receipt size={16} color="#0d6efd" />
            <span>4. Full Transaction Audit (Multi-Table SQL Join)</span>
            <code style={{ fontSize: '0.75rem', marginLeft: '0.5rem', color: '#6c757d' }}>JOIN TRANSACTION, PROPERTY, OFFER, CLIENT, AGENT</code>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => exportToCsv('full_transactions_audit_report', fullTx)}
          >
            <Download size={13} /> Export CSV
          </button>
        </div>

        <div className="table-responsive">
          <table className="table table-bordered table-striped" style={{ margin: 0 }}>
            <thead>
              <tr>
                <th>Tx ID</th>
                <th>Property</th>
                <th>Client (Buyer)</th>
                <th>Agent</th>
                <th>Listing Price</th>
                <th>Offer Amount</th>
                <th>Final Sale Price</th>
                <th>Price Diff</th>
                <th>Sale Date</th>
              </tr>
            </thead>
            <tbody>
              {fullTx.map((t) => (
                <tr key={t.TRANSACTION_ID}>
                  <td>
                    <strong>#{t.TRANSACTION_ID}</strong>
                  </td>
                  <td>
                    <div><strong>{t.PROPERTY_ID}</strong></div>
                    <div style={{ fontSize: '0.75rem', color: '#6c757d' }}>{t.PROPERTY_ADDRESS}</div>
                  </td>
                  <td>
                    <div>{t.CLIENT_NAME}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6c757d' }}>{t.CLIENT_PHONE} ({t.CLIENT_TYPE})</div>
                  </td>
                  <td>{t.AGENT_NAME || '—'}</td>
                  <td>{formatCurrency(t.LISTING_PRICE)}</td>
                  <td>{formatCurrency(t.OFFER_AMOUNT)}</td>
                  <td style={{ fontWeight: 600, color: '#198754' }}>
                    {formatCurrency(t.SALE_PRICE)}
                  </td>
                  <td>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: Number(t.PRICE_DIFFERENTIAL) >= 0 ? '#198754' : '#dc3545'
                    }}>
                      {Number(t.PRICE_DIFFERENTIAL) >= 0 ? `+${formatCurrency(t.PRICE_DIFFERENTIAL)}` : formatCurrency(t.PRICE_DIFFERENTIAL)}
                      {t.VARIANCE_PCT ? ` (${t.VARIANCE_PCT}%)` : ''}
                    </span>
                  </td>
                  <td>{formatDate(t.SALE_DATE)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Offer Success Rates */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <PieIcon size={16} color="#fd7e14" />
            <span>5. Offer Success & Conversion Rates</span>
            <code style={{ fontSize: '0.75rem', marginLeft: '0.5rem', color: '#6c757d' }}>GROUP BY offer_status</code>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => exportToCsv('offer_success_rates_report', offerRates)}
          >
            <Download size={13} /> Export CSV
          </button>
        </div>

        <div className="table-responsive">
          <table className="table table-bordered table-striped" style={{ margin: 0 }}>
            <thead>
              <tr>
                <th>Offer Status</th>
                <th>Offer Count</th>
                <th>Percentage</th>
                <th>Average Bid Amount</th>
                <th>Price Range (Min - Max)</th>
                <th>Total Volume</th>
              </tr>
            </thead>
            <tbody>
              {offerRates.map((o) => {
                let badge = 'badge-warning';
                if (o.OFFER_STATUS === 'Accepted') badge = 'badge-success';
                if (o.OFFER_STATUS === 'Rejected') badge = 'badge-danger';

                return (
                  <tr key={o.OFFER_STATUS}>
                    <td>
                      <span className={`badge ${badge}`}>{o.OFFER_STATUS}</span>
                    </td>
                    <td><strong>{o.COUNT}</strong></td>
                    <td style={{ fontWeight: 600 }}>{o.PERCENTAGE}%</td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(o.AVG_OFFER_AMOUNT)}</td>
                    <td style={{ color: '#6c757d' }}>
                      {formatCurrency(o.MIN_OFFER_AMOUNT)} — {formatCurrency(o.MAX_OFFER_AMOUNT)}
                    </td>
                    <td style={{ fontWeight: 600, color: '#212529' }}>
                      {formatCurrency(o.TOTAL_AMOUNT)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
