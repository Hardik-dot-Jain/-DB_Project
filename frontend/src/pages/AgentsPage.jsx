import React, { useState, useEffect } from 'react';
import api from '../api/client';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import { Edit2, Trash2 } from 'lucide-react';

export default function AgentsPage({ showToast }) {
  const [agents, setAgents] = useState([]);
  const [sortBy, setSortBy] = useState('agent_id');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [formData, setFormData] = useState({
    agent_id: '',
    agent_name: '',
    office_name: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAgents();
  }, [sortBy, sortOrder]);

  async function fetchAgents() {
    setLoading(true);
    try {
      const res = await api.get('/agents', {
        params: {
          sortBy: sortBy.toLowerCase(),
          sortOrder
        }
      });
      if (res.success) {
        setAgents(res.data);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  function handleOpenCreate() {
    setEditingAgent(null);
    setFormData({
      agent_id: '',
      agent_name: '',
      office_name: 'Downtown Luxury'
    });
    setIsModalOpen(true);
  }

  function handleOpenEdit(agent) {
    setEditingAgent(agent);
    setFormData({
      agent_id: agent.AGENT_ID,
      agent_name: agent.AGENT_NAME,
      office_name: agent.OFFICE_NAME || agent.AGENCY_BRANCH || ''
    });
    setIsModalOpen(true);
  }

  function handleOpenDelete(agentId) {
    setDeletingId(agentId);
    setIsDeleteOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingAgent) {
        await api.put(`/agents/${editingAgent.AGENT_ID}`, formData);
        showToast('Agent updated successfully!', 'success');
      } else {
        await api.post('/agents', formData);
        showToast('Agent created successfully!', 'success');
      }
      setIsModalOpen(false);
      fetchAgents();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirmDelete() {
    setSubmitting(true);
    try {
      await api.delete(`/agents/${deletingId}`);
      showToast(`Agent #${deletingId} deleted successfully.`, 'success');
      setIsDeleteOpen(false);
      fetchAgents();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  const columns = [
    {
      key: 'AGENT_ID',
      label: 'Agent ID',
      render: (val) => <span style={{ fontWeight: 600, color: '#2563eb' }}>#{val}</span>
    },
    {
      key: 'AGENT_NAME',
      label: 'Agent Name',
      render: (val) => <span style={{ fontWeight: 500 }}>{val}</span>
    },
    {
      key: 'OFFICE_NAME',
      label: 'Agency Office / Branch',
      render: (val, row) => (
        <span className="badge badge-secondary">
          {val || row.AGENCY_BRANCH || 'Main Office'}
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
            title="Edit Agent"
          >
            <Edit2 size={15} />
          </button>
          <button
            className="btn-icon btn-icon-danger"
            onClick={() => handleOpenDelete(row.AGENT_ID)}
            title="Delete Agent"
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
        title="Real Estate Agents"
        columns={columns}
        data={agents}
        loading={loading}
        onAddNew={handleOpenCreate}
        addNewText="Add Agent"
        searchPlaceholder="Search agents by name or branch..."
        exportFilename="agents_report"
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={(key, order) => {
          setSortBy(key);
          setSortOrder(order);
        }}
      />

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAgent ? `Edit Agent #${editingAgent.AGENT_ID}` : 'Add New Real Estate Agent'}
      >
        <form onSubmit={handleSubmit}>
          {!editingAgent && (
            <div className="form-group">
              <label className="form-label">Agent ID (Optional - Auto assigned if blank)</label>
              <input
                type="number"
                className="form-control"
                placeholder="e.g. 9006"
                value={formData.agent_id}
                onChange={(e) => setFormData({ ...formData, agent_id: e.target.value })}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              className="form-control"
              required
              placeholder="e.g. Sarah Jenkins"
              value={formData.agent_name}
              onChange={(e) => setFormData({ ...formData, agent_name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Agency Office / Branch *</label>
            <input
              type="text"
              className="form-control"
              required
              placeholder="e.g. Downtown Luxury, Coastal Prime"
              value={formData.office_name}
              onChange={(e) => setFormData({ ...formData, office_name: e.target.value })}
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
              {submitting ? 'Saving...' : editingAgent ? 'Save Changes' : 'Create Agent'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Agent"
        message={`Are you sure you want to delete Agent #${deletingId}? This will fail if the agent is actively managing property listings.`}
        isDeleting={submitting}
      />
    </div>
  );
}
