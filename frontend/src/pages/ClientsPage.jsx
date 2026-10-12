import React, { useState, useEffect } from 'react';
import api from '../api/client';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import { Edit2, Trash2, Filter } from 'lucide-react';

export default function ClientsPage({ showToast }) {
  const [clients, setClients] = useState([]);
  const [distinctTypes, setDistinctTypes] = useState([]);
  const [selectedType, setSelectedType] = useState('All');
  const [sortBy, setSortBy] = useState('CLIENT_ID');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [formData, setFormData] = useState({
    client_id: '',
    client_name: '',
    phone: '',
    client_type: 'Buyer'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchClients();
  }, [selectedType, sortBy, sortOrder]);

  useEffect(() => {
    fetchDistinctTypes();
  }, []);

  async function fetchDistinctTypes() {
    try {
      const res = await api.get('/clients/distinct-types');
      if (res.success) {
        setDistinctTypes(res.data);
      }
    } catch (e) {
      console.warn('Failed to load distinct client types:', e.message);
    }
  }

  async function fetchClients() {
    setLoading(true);
    try {
      const params = {
        sortBy,
        sortOrder
      };
      if (selectedType !== 'All') {
        params.clientType = selectedType;
      }
      const res = await api.get('/clients', { params });
      if (res.success) {
        setClients(res.data);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  function handleOpenCreate() {
    setEditingClient(null);
    setFormData({
      client_id: '',
      client_name: '',
      phone: '',
      client_type: 'Buyer'
    });
    setIsModalOpen(true);
  }

  function handleOpenEdit(client) {
    setEditingClient(client);
    setFormData({
      client_id: client.CLIENT_ID,
      client_name: client.CLIENT_NAME,
      phone: client.PHONE || '',
      client_type: client.CLIENT_TYPE || 'Buyer'
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
      if (editingClient) {
        await api.put(`/clients/${editingClient.CLIENT_ID}`, formData);
        showToast('Client updated successfully!', 'success');
      } else {
        await api.post('/clients', formData);
        showToast('Client created successfully!', 'success');
      }
      setIsModalOpen(false);
      fetchClients();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirmDelete() {
    setSubmitting(true);
    try {
      await api.delete(`/clients/${deletingId}`);
      showToast(`Client #${deletingId} deleted successfully.`, 'success');
      setIsDeleteOpen(false);
      fetchClients();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  const columns = [
    {
      key: 'CLIENT_ID',
      label: 'Client ID',
      render: (val) => <span style={{ fontWeight: 600, color: '#2563eb' }}>#{val}</span>
    },
    {
      key: 'CLIENT_NAME',
      label: 'Client Name',
      render: (val) => <span style={{ fontWeight: 500 }}>{val}</span>
    },
    {
      key: 'PHONE',
      label: 'Phone (Unique)',
      render: (val) => <span style={{ fontFamily: 'monospace', color: '#475569' }}>{val || '—'}</span>
    },
    {
      key: 'CLIENT_TYPE',
      label: 'Client Type',
      render: (val) => {
        let badgeStyle = 'badge-secondary';
        if (val === 'Buyer') badgeStyle = 'badge-success';
        if (val === 'Seller') badgeStyle = 'badge-warning';
        if (val === 'Investor') badgeStyle = 'badge-primary';
        return <span className={`badge ${badgeStyle}`}>{val}</span>;
      }
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
            title="Edit Client"
          >
            <Edit2 size={15} />
          </button>
          <button
            className="btn-icon btn-icon-danger"
            onClick={() => handleOpenDelete(row.CLIENT_ID)}
            title="Delete Client"
          >
            <Trash2 size={15} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div>
      {/* Flat Filter Toolbar (Demonstrating SELECT DISTINCT) */}
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
            Unique Client Types <span style={{ color: '#0d6efd', fontSize: '0.75rem' }}>[SELECT DISTINCT]</span>:
          </label>
          <select
            className="form-control"
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', width: 'auto' }}
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="All">All Types ({distinctTypes.length} unique in DB)</option>
            {distinctTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {selectedType !== 'All' && (
          <div style={{
            fontSize: '0.75rem',
            color: '#084298',
            backgroundColor: '#cfe2ff',
            padding: '0.2rem 0.5rem',
            borderRadius: '3px',
            marginLeft: 'auto'
          }}>
            Active SQL Clause: <code>WHERE client_type = '{selectedType}'</code>
          </div>
        )}
      </div>

      <DataTable
        title="Clients Directory"
        columns={columns}
        data={clients}
        loading={loading}
        onAddNew={handleOpenCreate}
        addNewText="Add Client"
        searchPlaceholder="Search clients by name or phone..."
        exportFilename="clients_directory"
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
        title={editingClient ? `Edit Client #${editingClient.CLIENT_ID}` : 'Add New Client'}
      >
        <form onSubmit={handleSubmit}>
          {!editingClient && (
            <div className="form-group">
              <label className="form-label">Client ID (Optional - Auto assigned if blank)</label>
              <input
                type="number"
                className="form-control"
                placeholder="e.g. 2006"
                value={formData.client_id}
                onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              className="form-control"
              required
              placeholder="e.g. John Smith"
              value={formData.client_name}
              onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number * (Must be unique)</label>
            <input
              type="text"
              className="form-control"
              required
              placeholder="e.g. 9123456780"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Client Type *</label>
            <select
              className="form-control"
              value={formData.client_type}
              onChange={(e) => setFormData({ ...formData, client_type: e.target.value })}
            >
              <option value="Buyer">Buyer</option>
              <option value="Seller">Seller</option>
              <option value="Investor">Investor</option>
            </select>
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
              {submitting ? 'Saving...' : editingClient ? 'Save Changes' : 'Create Client'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Client"
        message={`Are you sure you want to delete Client #${deletingId}? This will fail if the client has scheduled showings or submitted offers.`}
        isDeleting={submitting}
      />
    </div>
  );
}
