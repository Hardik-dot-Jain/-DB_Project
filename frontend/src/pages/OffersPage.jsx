import React, { useState, useEffect } from 'react';
import api from '../api/client';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import { Edit2, Trash2, CheckCircle, XCircle, Handshake, Filter } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export default function OffersPage({ showToast }) {
  const [offers, setOffers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('offer_id');
  const [sortOrder, setSortOrder] = useState('DESC');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    offer_id: '',
    property_id: '',
    client_id: '',
    offer_amount: '',
    offer_status: 'Pending'
  });

  useEffect(() => {
    fetchOffers();
  }, [statusFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchDropdowns();
  }, []);

  async function fetchOffers() {
    setLoading(true);
    try {
      const params = {
        sortBy: sortBy.toLowerCase(),
        sortOrder
      };
      if (statusFilter !== 'All') params.status = statusFilter;
      const res = await api.get('/offers', { params });
      if (res.success) {
        setOffers(res.data);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function fetchDropdowns() {
    try {
      const [propRes, clientRes] = await Promise.all([
        api.get('/properties'),
        api.get('/clients')
      ]);
      if (propRes.success) setProperties(propRes.data);
      if (clientRes.success) setClients(clientRes.data);
    } catch (e) {
      console.warn('Failed to load dropdowns:', e.message);
    }
  }

  function handleOpenCreate() {
    setEditingOffer(null);
    setFormData({
      offer_id: '',
      property_id: properties[0]?.PROPERTY_ID || '',
      client_id: clients[0]?.CLIENT_ID || '',
      offer_amount: '',
      offer_status: 'Pending'
    });
    setIsModalOpen(true);
  }

  function handleOpenEdit(offer) {
    setEditingOffer(offer);
    setFormData({
      offer_id: offer.OFFER_ID,
      property_id: offer.PROPERTY_ID,
      client_id: offer.CLIENT_ID,
      offer_amount: offer.OFFER_AMOUNT,
      offer_status: offer.OFFER_STATUS || 'Pending'
    });
    setIsModalOpen(true);
  }

  async function handleQuickStatusChange(offer, newStatus) {
    try {
      await api.put(`/offers/${offer.OFFER_ID}`, {
        property_id: offer.PROPERTY_ID,
        client_id: offer.CLIENT_ID,
        offer_amount: offer.OFFER_AMOUNT,
        offer_status: newStatus
      });
      showToast(`Offer #${offer.OFFER_ID} marked as ${newStatus}!`, 'success');
      fetchOffers();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  function handleOpenDelete(id) {
    setDeletingId(id);
    setIsDeleteOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingOffer) {
        await api.put(`/offers/${editingOffer.OFFER_ID}`, formData);
        showToast('Offer updated successfully!', 'success');
      } else {
        await api.post('/offers', formData);
        showToast('Offer submitted successfully!', 'success');
      }
      setIsModalOpen(false);
      fetchOffers();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirmDelete() {
    setSubmitting(true);
    try {
      await api.delete(`/offers/${deletingId}`);
      showToast(`Offer #${deletingId} deleted successfully.`, 'success');
      setIsDeleteOpen(false);
      fetchOffers();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  const columns = [
    {
      key: 'OFFER_ID',
      label: 'Offer ID',
      render: (val) => <span style={{ fontWeight: 600, color: '#2563eb' }}>#{val}</span>
    },
    {
      key: 'PROPERTY_ID',
      label: 'Property',
      render: (val, row) => (
        <div>
          <span style={{ fontWeight: 600 }}>{val}</span>
          <div style={{ fontSize: '0.775rem', color: '#64748b' }}>{row.PROPERTY_ADDRESS}</div>
          <div style={{ fontSize: '0.75rem', color: '#059669' }}>List: {formatCurrency(row.LISTING_PRICE)}</div>
        </div>
      )
    },
    {
      key: 'CLIENT_NAME',
      label: 'Client (Bidder)',
      render: (val, row) => (
        <div>
          <span style={{ fontWeight: 500 }}>{val}</span>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{row.CLIENT_PHONE}</div>
        </div>
      )
    },
    {
      key: 'OFFER_AMOUNT',
      label: 'Offer Amount',
      render: (val, row) => {
        const diff = row.LISTING_PRICE ? Number(val) - Number(row.LISTING_PRICE) : 0;
        return (
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
              {formatCurrency(val)}
            </div>
            {diff !== 0 && (
              <div style={{ fontSize: '0.725rem', color: diff >= 0 ? '#059669' : '#dc2626' }}>
                {diff >= 0 ? `+${formatCurrency(diff)} above list` : `${formatCurrency(diff)} below list`}
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: 'OFFER_STATUS',
      label: 'Status',
      render: (val) => {
        let badgeClass = 'badge-warning';
        if (val === 'Accepted') badgeClass = 'badge-success';
        if (val === 'Rejected') badgeClass = 'badge-danger';
        return <span className={`badge ${badgeClass}`}>{val}</span>;
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
          {row.OFFER_STATUS === 'Pending' && (
            <>
              <button
                className="btn-icon"
                onClick={() => handleQuickStatusChange(row, 'Accepted')}
                title="Accept Offer"
                style={{ color: '#198754' }}
              >
                <CheckCircle size={14} />
              </button>
              <button
                className="btn-icon btn-icon-danger"
                onClick={() => handleQuickStatusChange(row, 'Rejected')}
                title="Reject Offer"
              >
                <XCircle size={14} />
              </button>
            </>
          )}

          <button
            className="btn-icon"
            onClick={() => handleOpenEdit(row)}
            title="Edit Offer"
          >
            <Edit2 size={13} />
          </button>
          <button
            className="btn-icon btn-icon-danger"
            onClick={() => handleOpenDelete(row.OFFER_ID)}
            title="Delete Offer"
          >
            <Trash2 size={13} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div>
      {/* Status Filter */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.85rem',
        marginBottom: '0.85rem',
        backgroundColor: '#ffffff',
        padding: '0.65rem 1rem',
        borderRadius: '4px',
        border: '1px solid #dee2e6'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.825rem', fontWeight: 600, color: '#495057' }}>
          <Filter size={14} /> Filter by Status:
        </div>
        <select
          className="form-control"
          style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', width: 'auto' }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Accepted">Accepted</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      <DataTable
        title="Client Offers"
        columns={columns}
        data={offers}
        loading={loading}
        onAddNew={handleOpenCreate}
        addNewText="Submit Offer"
        searchPlaceholder="Search offers by property or client..."
        exportFilename="client_offers"
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={(key, order) => {
          setSortBy(key);
          setSortOrder(order);
        }}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingOffer ? `Edit Offer #${editingOffer.OFFER_ID}` : 'Submit Client Offer'}
      >
        <form onSubmit={handleSubmit}>
          {!editingOffer && (
            <div className="form-group">
              <label className="form-label">Offer ID (Optional - Auto assigned if blank)</label>
              <input
                type="number"
                className="form-control"
                placeholder="e.g. 4006"
                value={formData.offer_id}
                onChange={(e) => setFormData({ ...formData, offer_id: e.target.value })}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Target Property * (Foreign Key)</label>
            <select
              className="form-control"
              required
              value={formData.property_id}
              onChange={(e) => setFormData({ ...formData, property_id: e.target.value })}
            >
              <option value="">Select Property</option>
              {properties.map((p) => (
                <option key={p.PROPERTY_ID} value={p.PROPERTY_ID}>
                  {p.PROPERTY_ID} - {p.ADDRESS} (Listed at {formatCurrency(p.LISTING_PRICE)})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Client (Bidder) * (Foreign Key)</label>
            <select
              className="form-control"
              required
              value={formData.client_id}
              onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
            >
              <option value="">Select Client</option>
              {clients.map((c) => (
                <option key={c.CLIENT_ID} value={c.CLIENT_ID}>
                  {c.CLIENT_NAME} ({c.CLIENT_TYPE} - {c.PHONE})
                </option>
              ))}
            </select>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Offer Amount ($) *</label>
              <input
                type="number"
                step="0.01"
                min="1"
                required
                className="form-control"
                placeholder="e.g. 450000.00"
                value={formData.offer_amount}
                onChange={(e) => setFormData({ ...formData, offer_amount: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Offer Status *</label>
              <select
                className="form-control"
                value={formData.offer_status}
                onChange={(e) => setFormData({ ...formData, offer_status: e.target.value })}
              >
                <option value="Pending">Pending</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
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
              {submitting ? 'Saving...' : editingOffer ? 'Save Changes' : 'Submit Offer'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Offer"
        message={`Are you sure you want to delete Offer #${deletingId}? This will fail if this offer is referenced by a finalized transaction.`}
        isDeleting={submitting}
      />
    </div>
  );
}
