import React, { useState, useEffect } from 'react';
import api from '../api/client';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import { Edit2, Trash2, Calendar, Receipt, DollarSign } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function TransactionsPage({ showToast }) {
  const [transactions, setTransactions] = useState([]);
  const [properties, setProperties] = useState([]);
  const [offers, setOffers] = useState([]);
  const [sortBy, setSortBy] = useState('sale_date');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    transaction_id: '',
    property_id: '',
    offer_id: '',
    sale_price: '',
    sale_date: ''
  });

  useEffect(() => {
    fetchTransactions();
  }, [sortBy, sortOrder]);

  useEffect(() => {
    fetchDropdowns();
  }, []);

  async function fetchTransactions() {
    setLoading(true);
    try {
      const res = await api.get('/transactions', {
        params: {
          sortBy: sortBy.toLowerCase(),
          sortOrder
        }
      });
      if (res.success) {
        setTransactions(res.data);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function fetchDropdowns() {
    try {
      const [propRes, offerRes] = await Promise.all([
        api.get('/properties'),
        api.get('/offers')
      ]);
      if (propRes.success) setProperties(propRes.data);
      if (offerRes.success) setOffers(offerRes.data);
    } catch (e) {
      console.warn('Failed to load dropdowns:', e.message);
    }
  }

  function handleOpenCreate() {
    setEditingTx(null);
    const initialOffer = offers[0];
    const initialProp = properties.find(p => p.PROPERTY_ID === initialOffer?.PROPERTY_ID) || properties[0];

    setFormData({
      transaction_id: '',
      property_id: initialProp?.PROPERTY_ID || '',
      offer_id: initialOffer?.OFFER_ID || '',
      sale_price: initialOffer?.OFFER_AMOUNT || initialProp?.LISTING_PRICE || '',
      sale_date: new Date().toISOString().slice(0, 10)
    });
    setIsModalOpen(true);
  }

  function handleOpenEdit(tx) {
    setEditingTx(tx);
    setFormData({
      transaction_id: tx.TRANSACTION_ID,
      property_id: tx.PROPERTY_ID,
      offer_id: tx.OFFER_ID,
      sale_price: tx.SALE_PRICE,
      sale_date: tx.SALE_DATE || ''
    });
    setIsModalOpen(true);
  }

  function handleOfferSelect(offerId) {
    const selected = offers.find(o => String(o.OFFER_ID) === String(offerId));
    if (selected) {
      setFormData(prev => ({
        ...prev,
        offer_id: selected.OFFER_ID,
        property_id: selected.PROPERTY_ID,
        sale_price: selected.OFFER_AMOUNT
      }));
    } else {
      setFormData(prev => ({ ...prev, offer_id: offerId }));
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
      if (editingTx) {
        await api.put(`/transactions/${editingTx.TRANSACTION_ID}`, formData);
        showToast('Transaction updated successfully!', 'success');
      } else {
        const res = await api.post('/transactions', formData);
        showToast(res.message || 'Transaction finalized successfully!', 'success');
      }
      setIsModalOpen(false);
      fetchTransactions();
      fetchDropdowns(); // Refresh property/offer statuses
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirmDelete() {
    setSubmitting(true);
    try {
      await api.delete(`/transactions/${deletingId}`);
      showToast(`Transaction #${deletingId} deleted successfully.`, 'success');
      setIsDeleteOpen(false);
      fetchTransactions();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  const columns = [
    {
      key: 'TRANSACTION_ID',
      label: 'Tx ID',
      render: (val) => <span style={{ fontWeight: 700, color: '#2563eb' }}>#{val}</span>
    },
    {
      key: 'PROPERTY_ID',
      label: 'Sold Property',
      render: (val, row) => (
        <div>
          <span style={{ fontWeight: 600 }}>{val}</span>
          <div style={{ fontSize: '0.775rem', color: '#64748b' }}>{row.PROPERTY_ADDRESS}</div>
        </div>
      )
    },
    {
      key: 'OFFER_ID',
      label: 'Offer Ref',
      render: (val, row) => (
        <div>
          <span className="badge badge-primary">Offer #{val}</span>
          {row.OFFER_AMOUNT && (
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
              Bid: {formatCurrency(row.OFFER_AMOUNT)}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'CLIENT_NAME',
      label: 'Purchaser (Buyer)',
      render: (val, row) => (
        <div>
          <span style={{ fontWeight: 500 }}>{val || '—'}</span>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{row.CLIENT_PHONE}</div>
        </div>
      )
    },
    {
      key: 'SALE_PRICE',
      label: 'Final Sale Price',
      render: (val) => (
        <span style={{ fontWeight: 700, fontSize: '0.975rem', color: '#059669' }}>
          {formatCurrency(val)}
        </span>
      )
    },
    {
      key: 'SALE_DATE',
      label: 'Sale Date',
      render: (val) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#334155' }}>
          <Calendar size={14} color="#64748b" /> {formatDate(val)}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button
            className="btn-icon"
            onClick={() => handleOpenEdit(row)}
            title="Edit Transaction"
          >
            <Edit2 size={15} />
          </button>
          <button
            className="btn-icon btn-icon-danger"
            onClick={() => handleOpenDelete(row.TRANSACTION_ID)}
            title="Delete Transaction"
          >
            <Trash2 size={15} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div>
      <DataTable
        title="Finalized Sales Transactions"
        columns={columns}
        data={transactions}
        loading={loading}
        onAddNew={handleOpenCreate}
        addNewText="Record Transaction"
        searchPlaceholder="Search transactions by ID, property or buyer..."
        exportFilename="sales_transactions"
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
        title={editingTx ? `Edit Transaction #${editingTx.TRANSACTION_ID}` : 'Finalize Sales Transaction'}
        maxWidth="600px"
      >
        <form onSubmit={handleSubmit}>
          {!editingTx && (
            <div className="form-group">
              <label className="form-label">Transaction ID (Optional - Auto assigned if blank)</label>
              <input
                type="number"
                className="form-control"
                placeholder="e.g. 5006"
                value={formData.transaction_id}
                onChange={(e) => setFormData({ ...formData, transaction_id: e.target.value })}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Based on Offer * (Foreign Key)</label>
            <select
              className="form-control"
              required
              value={formData.offer_id}
              onChange={(e) => handleOfferSelect(e.target.value)}
            >
              <option value="">Select Accepted or Pending Offer</option>
              {offers.map((o) => (
                <option key={o.OFFER_ID} value={o.OFFER_ID}>
                  Offer #{o.OFFER_ID} ({o.OFFER_STATUS}) - {o.PROPERTY_ID} - {formatCurrency(o.OFFER_AMOUNT)} (Client: {o.CLIENT_NAME})
                </option>
              ))}
            </select>
            <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
              Selecting an offer automatically links its property and offer amount.
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Property * (Foreign Key)</label>
            <select
              className="form-control"
              required
              value={formData.property_id}
              onChange={(e) => setFormData({ ...formData, property_id: e.target.value })}
            >
              <option value="">Select Property</option>
              {properties.map((p) => (
                <option key={p.PROPERTY_ID} value={p.PROPERTY_ID}>
                  {p.PROPERTY_ID} - {p.ADDRESS} ({p.STATUS} - List: {formatCurrency(p.LISTING_PRICE)})
                </option>
              ))}
            </select>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Final Sale Price ($) *</label>
              <input
                type="number"
                step="0.01"
                min="1"
                required
                className="form-control"
                placeholder="e.g. 450000.00"
                value={formData.sale_price}
                onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Sale Date *</label>
              <input
                type="date"
                className="form-control"
                required
                value={formData.sale_date}
                onChange={(e) => setFormData({ ...formData, sale_date: e.target.value })}
              />
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
              {submitting ? 'Processing...' : editingTx ? 'Save Changes' : 'Finalize Sale'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Transaction"
        message={`Are you sure you want to delete Transaction #${deletingId}?`}
        isDeleting={submitting}
      />
    </div>
  );
}
