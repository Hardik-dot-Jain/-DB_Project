import React, { useState, useEffect } from 'react';
import api from '../api/client';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import { Edit2, Trash2 } from 'lucide-react';

export default function CategoriesPage({ showToast }) {
  const [categories, setCategories] = useState([]);
  const [sortBy, setSortBy] = useState('category_id');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [formData, setFormData] = useState({
    category_id: '',
    category_name: '',
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, [sortBy, sortOrder]);

  async function fetchCategories() {
    setLoading(true);
    try {
      const res = await api.get('/categories', {
        params: {
          sortBy: sortBy.toLowerCase(),
          sortOrder
        }
      });
      if (res.success) {
        setCategories(res.data);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  function handleOpenCreate() {
    setEditingCategory(null);
    setFormData({
      category_id: '',
      category_name: '',
      description: ''
    });
    setIsModalOpen(true);
  }

  function handleOpenEdit(cat) {
    setEditingCategory(cat);
    setFormData({
      category_id: cat.CATEGORY_ID,
      category_name: cat.CATEGORY_NAME,
      description: cat.DESCRIPTION || ''
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
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.CATEGORY_ID}`, formData);
        showToast('Category updated successfully!', 'success');
      } else {
        await api.post('/categories', formData);
        showToast('Category created successfully!', 'success');
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirmDelete() {
    setSubmitting(true);
    try {
      await api.delete(`/categories/${deletingId}`);
      showToast(`Category #${deletingId} deleted successfully.`, 'success');
      setIsDeleteOpen(false);
      fetchCategories();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  const columns = [
    {
      key: 'CATEGORY_ID',
      label: 'Category ID',
      render: (val) => <span style={{ fontWeight: 600, color: '#2563eb' }}>#{val}</span>
    },
    {
      key: 'CATEGORY_NAME',
      label: 'Category Name',
      render: (val) => <span style={{ fontWeight: 600 }}>{val}</span>
    },
    {
      key: 'DESCRIPTION',
      label: 'Description',
      render: (val) => <span style={{ color: '#64748b' }}>{val || '—'}</span>
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
            title="Edit Category"
          >
            <Edit2 size={15} />
          </button>
          <button
            className="btn-icon btn-icon-danger"
            onClick={() => handleOpenDelete(row.CATEGORY_ID)}
            title="Delete Category"
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
        title="Property Categories"
        columns={columns}
        data={categories}
        loading={loading}
        onAddNew={handleOpenCreate}
        addNewText="Add Category"
        searchPlaceholder="Search categories..."
        exportFilename="categories_report"
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
        title={editingCategory ? `Edit Category #${editingCategory.CATEGORY_ID}` : 'Add New Category'}
      >
        <form onSubmit={handleSubmit}>
          {!editingCategory && (
            <div className="form-group">
              <label className="form-label">Category ID (Optional - Auto assigned if blank)</label>
              <input
                type="number"
                className="form-control"
                placeholder="e.g. 106"
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Category Name *</label>
            <input
              type="text"
              className="form-control"
              required
              placeholder="e.g. Penthouse, Multi-family"
              value={formData.category_name}
              onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Brief description of the property category..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              {submitting ? 'Saving...' : editingCategory ? 'Save Changes' : 'Create Category'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Category"
        message={`Are you sure you want to delete Category #${deletingId}? This will fail if any properties are assigned to this category.`}
        isDeleting={submitting}
      />
    </div>
  );
}
