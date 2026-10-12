import React, { useState, useEffect } from 'react';
import api from '../api/client';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import { Edit2, Trash2, Filter } from 'lucide-react';
import { formatCurrency, formatNumber } from '../utils/formatters';

export default function PropertiesPage({ showToast }) {
  const [properties, setProperties] = useState([]);
  const [categories, setCategories] = useState([]);
  const [agents, setAgents] = useState([]);
  const [distinctStatuses, setDistinctStatuses] = useState([]);
  const [avgPriceData, setAvgPriceData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [aboveAverageOnly, setAboveAverageOnly] = useState(false);

  // Server-side ORDER BY Sorting
  const [sortBy, setSortBy] = useState('property_id');
  const [sortOrder, setSortOrder] = useState('ASC');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    property_id: '',
    address: '',
    listing_price: '',
    status: 'Active',
    category_id: '',
    agent_id: '',
    square_feet: ''
  });

  useEffect(() => {
    fetchProperties();
  }, [statusFilter, categoryFilter, aboveAverageOnly, sortBy, sortOrder]);

  useEffect(() => {
    fetchDropdowns();
  }, []);

  async function fetchProperties() {
    setLoading(true);
    try {
      const params = {
        sortBy,
        sortOrder
      };
      if (statusFilter !== 'All') params.status = statusFilter;
      if (categoryFilter !== 'All') params.categoryId = categoryFilter;
      if (aboveAverageOnly) params.aboveAverage = 'true';

      const res = await api.get('/properties', { params });
      if (res.success) {
        setProperties(res.data);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function fetchDropdowns() {
    try {
      const [catRes, agentRes, distinctRes, avgRes] = await Promise.all([
        api.get('/categories'),
        api.get('/agents'),
        api.get('/properties/distinct-statuses'),
        api.get('/properties/average-price')
      ]);
      if (catRes.success) setCategories(catRes.data);
      if (agentRes.success) setAgents(agentRes.data);
      if (distinctRes.success) setDistinctStatuses(distinctRes.data);
      if (avgRes.success) setAvgPriceData(avgRes.data);
    } catch (e) {
      console.warn('Failed to load dropdown options:', e.message);
    }
  }

  function handleOpenCreate() {
    setEditingProperty(null);
    setFormData({
      property_id: '',
      address: '',
      listing_price: '',
      status: 'Active',
      category_id: categories[0]?.CATEGORY_ID || '',
      agent_id: agents[0]?.AGENT_ID || '',
      square_feet: ''
    });
    setIsModalOpen(true);
  }

  function handleOpenEdit(prop) {
    setEditingProperty(prop);
    setFormData({
      property_id: prop.PROPERTY_ID,
      address: prop.ADDRESS,
      listing_price: prop.LISTING_PRICE,
      status: prop.STATUS || 'Active',
      category_id: prop.CATEGORY_ID || '',
      agent_id: prop.AGENT_ID || '',
      square_feet: prop.SQUARE_FEET || ''
    });
    setIsModalOpen(true);
  }

  function handleOpenDelete(id) {
    setDeletingId(id);
    setIsDeleteOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingProperty) {
        await api.put(`/properties/${editingProperty.PROPERTY_ID}`, formData);
        showToast(`Property ${editingProperty.PROPERTY_ID} updated successfully!`, 'success');
      } else {
        await api.post('/properties', formData);
        showToast('Property created successfully!', 'success');
      }
      setIsModalOpen(false);
      fetchProperties();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirmDelete() {
    setSubmitting(true);
    try {
      await api.delete(`/properties/${deletingId}`);
      showToast(`Property ${deletingId} deleted successfully.`, 'success');
      setIsDeleteOpen(false);
      fetchProperties();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  const columns = [
    {
      key: 'PROPERTY_ID',
      label: 'Property ID',
      render: (val) => <strong>{val}</strong>
    },
    {
      key: 'ADDRESS',
      label: 'Address',
      render: (val) => val
    },
    {
      key: 'LISTING_PRICE',
      label: 'Listing Price',
      render: (val) => (
        <span style={{ fontWeight: 600, color: '#198754' }}>
          {formatCurrency(val)}
        </span>
      )
    },
    {
      key: 'STATUS',
      label: 'Status',
      render: (val) => {
        let badgeClass = 'badge-success';
        if (val === 'Pending') badgeClass = 'badge-warning';
        if (val === 'Sold') badgeClass = 'badge-primary';
        return <span className={`badge ${badgeClass}`}>{val}</span>;
      }
    },
    {
      key: 'CATEGORY_NAME',
      label: 'Category',
      render: (val) => <span className="badge badge-secondary">{val || '—'}</span>
    },
    {
      key: 'AGENT_NAME',
      label: 'Assigned Agent',
      render: (val, row) => (
        <div>
          <div>{val || '—'}</div>
          {row.AGENT_ID && <span style={{ fontSize: '0.75rem', color: '#6c757d' }}>ID: {row.AGENT_ID}</span>}
        </div>
      )
    },
    {
      key: 'SQUARE_FEET',
      label: 'Sq Ft',
      render: (val) => (val ? `${formatNumber(val)} sq ft` : '—')
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          <button
            className="btn-icon"
            onClick={() => handleOpenEdit(row)}
            title="Edit Property"
          >
            <Edit2 size={13} />
          </button>
          <button
            className="btn-icon btn-icon-danger"
            onClick={() => handleOpenDelete(row.PROPERTY_ID)}
            title="Delete Property"
          >
            <Trash2 size={13} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div>
      {/* Flat Filter Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.85rem',
        marginBottom: '0.85rem',
        backgroundColor: '#ffffff',
        padding: '0.65rem 1rem',
        borderRadius: '4px',
        border: '1px solid #dee2e6',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.825rem', fontWeight: 600, color: '#495057' }}>
          <Filter size={14} /> SQL Query Filters:
        </div>

        {/* Feature 1: DISTINCT Clause Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <label style={{ fontSize: '0.8rem', color: '#495057', fontWeight: 600 }}>
            Unique Statuses <span style={{ color: '#0d6efd', fontSize: '0.75rem' }}>[SELECT DISTINCT]</span>:
          </label>
          <select
            className="form-control"
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', width: 'auto' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses ({distinctStatuses.length} unique)</option>
            {distinctStatuses.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <label style={{ fontSize: '0.8rem', color: '#6c757d' }}>Category:</label>
          <select
            className="form-control"
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', width: 'auto' }}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c.CATEGORY_ID} value={c.CATEGORY_ID}>
                {c.CATEGORY_NAME}
              </option>
            ))}
          </select>
        </div>

        {/* Feature 3: SUBQUERY Button */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            className={`btn btn-sm ${aboveAverageOnly ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setAboveAverageOnly(!aboveAverageOnly)}
            title="Demonstrates SQL Subquery: WHERE listing_price > (SELECT AVG(listing_price) FROM property)"
            style={{ fontWeight: aboveAverageOnly ? 700 : 500 }}
          >
            {aboveAverageOnly ? '✓ Subquery Active: ' : '⚡ '}
            Show Above Average Properties
            {avgPriceData?.AVG_PRICE ? ` (> ${formatCurrency(avgPriceData.AVG_PRICE)})` : ''}
          </button>
        </div>
      </div>

      {aboveAverageOnly && (
        <div style={{
          backgroundColor: '#e7f1ff',
          border: '1px solid #b6d4fe',
          borderRadius: 4,
          padding: '0.45rem 0.85rem',
          marginBottom: '0.75rem',
          fontSize: '0.8rem',
          color: '#084298',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <strong>SQL Subquery Applied: </strong>
            <code>WHERE p.listing_price &gt; (SELECT AVG(listing_price) FROM property)</code>
            {avgPriceData?.AVG_PRICE && (
              <span style={{ marginLeft: '0.5rem' }}>
                (Database Average: <strong>{formatCurrency(avgPriceData.AVG_PRICE)}</strong>)
              </span>
            )}
          </div>
          <button
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.1rem 0.4rem', fontSize: '0.75rem' }}
            onClick={() => setAboveAverageOnly(false)}
          >
            Clear Filter
          </button>
        </div>
      )}

      {/* Feature 4: ORDER BY Sorting Handled via Backend SQL */}
      <DataTable
        title="Property Listings"
        columns={columns}
        data={properties}
        loading={loading}
        onAddNew={handleOpenCreate}
        addNewText="Add Property"
        searchPlaceholder="Search properties by ID or address..."
        exportFilename="properties_inventory"
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={(key, order) => {
          setSortBy(key);
          setSortOrder(order);
        }}
      />

      {/* Modal Add / Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProperty ? `Edit Property ${editingProperty.PROPERTY_ID}` : 'Add New Property Record'}
        maxWidth="580px"
      >
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                Property ID {editingProperty ? '(Primary Key)' : '(VARCHAR2, e.g. P5506)'}
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. P5506"
                disabled={!!editingProperty}
                value={formData.property_id}
                onChange={(e) => setFormData({ ...formData, property_id: e.target.value.toUpperCase() })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Status *</label>
              <select
                className="form-control"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Sold">Sold</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Address *</label>
            <input
              type="text"
              className="form-control"
              required
              placeholder="e.g. 789 Ocean Blvd"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Listing Price ($) *</label>
              <input
                type="number"
                step="0.01"
                min="1"
                required
                className="form-control"
                placeholder="e.g. 620000.00"
                value={formData.listing_price}
                onChange={(e) => setFormData({ ...formData, listing_price: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Square Feet</label>
              <input
                type="number"
                min="0"
                className="form-control"
                placeholder="e.g. 2400"
                value={formData.square_feet}
                onChange={(e) => setFormData({ ...formData, square_feet: e.target.value })}
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Category * (Foreign Key)</label>
              <select
                className="form-control"
                required
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.CATEGORY_ID} value={cat.CATEGORY_ID}>
                    {cat.CATEGORY_NAME} (ID: {cat.CATEGORY_ID})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Assigned Agent * (Foreign Key)</label>
              <select
                className="form-control"
                required
                value={formData.agent_id}
                onChange={(e) => setFormData({ ...formData, agent_id: e.target.value })}
              >
                <option value="">Select Agent</option>
                {agents.map((agent) => (
                  <option key={agent.AGENT_ID} value={agent.AGENT_ID}>
                    {agent.AGENT_NAME} (ID: {agent.AGENT_ID})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-footer" style={{ margin: '1rem -1.15rem -1.15rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : editingProperty ? 'Save Changes' : 'Create Listing'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Property Record"
        message={`Are you sure you want to delete Property ${deletingId}? Note: By database foreign key rules, all associated showings, offers, and transactions will automatically cascade delete.`}
        isDeleting={submitting}
      />
    </div>
  );
}
