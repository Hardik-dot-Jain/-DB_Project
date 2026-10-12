import React, { useState, useEffect } from 'react';
import api from '../api/client';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import { Edit2, Trash2, Calendar } from 'lucide-react';
import { formatDate } from '../utils/formatters';

export default function ShowingsPage({ showToast }) {
  const [showings, setShowings] = useState([]);
  const [properties, setProperties] = useState([]);
  const [clients, setClients] = useState([]);
  const [sortBy, setSortBy] = useState('showing_date');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingShowing, setEditingShowing] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    showing_id: '',
    property_id: '',
    client_id: '',
    showing_date: ''
  });

  useEffect(() => {
    fetchShowings();
  }, [sortBy, sortOrder]);

  useEffect(() => {
    fetchDropdowns();
  }, []);

  async function fetchShowings() {
    setLoading(true);
    try {
      const res = await api.get('/showings', {
        params: {
          sortBy: sortBy.toLowerCase(),
          sortOrder
        }
      });
      if (res.success) {
        setShowings(res.data);
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
      console.warn('Dropdown loading error:', e.message);
    }
  }

  function handleOpenCreate() {
    setEditingShowing(null);
    setFormData({
      showing_id: '',
      property_id: properties[0]?.PROPERTY_ID || '',
      client_id: clients[0]?.CLIENT_ID || '',
      showing_date: new Date().toISOString().slice(0, 10)
    });
    setIsModalOpen(true);
  }

  function handleOpenEdit(showing) {
    setEditingShowing(showing);
    setFormData({
      showing_id: showing.SHOWING_ID,
      property_id: showing.PROPERTY_ID,
      client_id: showing.CLIENT_ID,
      showing_date: showing.SHOWING_DATE || ''
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
      if (editingShowing) {
        await api.put(`/showings/${editingShowing.SHOWING_ID}`, formData);
        showToast('Showing updated successfully!', 'success');
      } else {
        await api.post('/showings', formData);
        showToast('Showing scheduled successfully!', 'success');
      }
      setIsModalOpen(false);
      fetchShowings();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirmDelete() {
    setSubmitting(true);
    try {
      await api.delete(`/showings/${deletingId}`);
      showToast(`Showing #${deletingId} deleted successfully.`, 'success');
      setIsDeleteOpen(false);
      fetchShowings();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  const columns = [
    {
      key: 'SHOWING_ID',
      label: 'Showing ID',
      render: (val) => <span style={{ fontWeight: 600, color: '#2563eb' }}>#{val}</span>
    },
    {
      key: 'PROPERTY_ID',
      label: 'Property',
      render: (val, row) => (
        <div>
          <span style={{ fontWeight: 600, color: '#0f172a' }}>{val}</span>
          <div style={{ fontSize: '0.775rem', color: '#64748b' }}>{row.PROPERTY_ADDRESS}</div>
        </div>
      )
    },
    {
      key: 'CLIENT_NAME',
      label: 'Client (Prospect)',
      render: (val, row) => (
        <div>
          <span style={{ fontWeight: 500 }}>{val}</span>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{row.CLIENT_PHONE}</div>
        </div>
      )
    },
    {
      key: 'SHOWING_DATE',
      label: 'Showing Date',
      render: (val) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 500 }}>
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
            title="Edit Showing"
          >
            <Edit2 size={15} />
          </button>
          <button
            className="btn-icon btn-icon-danger"
            onClick={() => handleOpenDelete(row.SHOWING_ID)}
            title="Delete Showing"
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
        title="Scheduled Showings"
        columns={columns}
        data={showings}
        loading={loading}
        onAddNew={handleOpenCreate}
        addNewText="Schedule Showing"
        searchPlaceholder="Search showings by property or client..."
        exportFilename="showings_schedule"
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
        title={editingShowing ? `Edit Showing #${editingShowing.SHOWING_ID}` : 'Schedule New Property Showing'}
      >
        <form onSubmit={handleSubmit}>
          {!editingShowing && (
            <div className="form-group">
              <label className="form-label">Showing ID (Optional - Auto assigned if blank)</label>
              <input
                type="number"
                className="form-control"
                placeholder="e.g. 3006"
                value={formData.showing_id}
                onChange={(e) => setFormData({ ...formData, showing_id: e.target.value })}
              />
            </div>
          )}

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
                  {p.PROPERTY_ID} - {p.ADDRESS} ({p.STATUS})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Client * (Foreign Key)</label>
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

          <div className="form-group">
            <label className="form-label">Showing Date *</label>
            <input
              type="date"
              className="form-control"
              required
              value={formData.showing_date}
              onChange={(e) => setFormData({ ...formData, showing_date: e.target.value })}
            />
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
              {submitting ? 'Saving...' : editingShowing ? 'Save Changes' : 'Schedule Showing'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Showing"
        message={`Are you sure you want to delete Showing #${deletingId}?`}
        isDeleting={submitting}
      />
    </div>
  );
}
