import React, { useState, useMemo } from 'react';
import { Search, ChevronUp, ChevronDown, Download, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { exportToCsv } from '../utils/exportCsv';

export default function DataTable({
  columns,
  data = [],
  title,
  onAddNew,
  addNewText = 'Add New',
  searchPlaceholder = 'Search records...',
  exportFilename = 'export',
  loading = false,
  emptyMessage = 'No records found in database.',
  sortBy = null,
  sortOrder = 'ASC',
  onSortChange = null
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [localSortKey, setLocalSortKey] = useState(null);
  const [localSortAsc, setLocalSortAsc] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const currentSortKey = onSortChange ? sortBy : localSortKey;
  const currentSortAsc = onSortChange ? (sortOrder?.toUpperCase() === 'ASC') : localSortAsc;

  // Filter (by client search string)
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase();
    return data.filter((row) =>
      Object.values(row).some((val) =>
        val !== null && val !== undefined && String(val).toLowerCase().includes(term)
      )
    );
  }, [data, searchTerm]);

  // Sort: If server-side sort (onSortChange) is active, data is already sorted by Oracle SQL ORDER BY
  const sortedData = useMemo(() => {
    if (onSortChange || !localSortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      let valA = a[localSortKey];
      let valB = b[localSortKey];

      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return localSortAsc ? valA - valB : valB - valA;
      }
      return localSortAsc
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [filteredData, localSortKey, localSortAsc, onSortChange]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, page, pageSize]);

  function handleSort(key) {
    if (onSortChange) {
      const nextOrder = (sortBy === key && sortOrder?.toUpperCase() === 'ASC') ? 'DESC' : 'ASC';
      onSortChange(key, nextOrder);
    } else {
      if (localSortKey === key) {
        setLocalSortAsc(!localSortAsc);
      } else {
        setLocalSortKey(key);
        setLocalSortAsc(true);
      }
    }
  }

  function handleExport() {
    exportToCsv(exportFilename, data);
  }

  return (
    <div className="table-panel">
      {/* Flat Toolbar */}
      <div className="table-toolbar-bar">
        <div className="search-box">
          <Search size={14} color="#6c757d" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {onSortChange && currentSortKey && (
            <div style={{
              fontSize: '0.75rem',
              color: '#0d6efd',
              backgroundColor: '#e7f1ff',
              padding: '0.2rem 0.5rem',
              borderRadius: '3px',
              border: '1px solid #b6d4fe',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}>
              <span>SQL:</span>
              <code>ORDER BY {currentSortKey} {currentSortAsc ? 'ASC' : 'DESC'}</code>
            </div>
          )}

          <button
            className="btn btn-secondary btn-sm"
            onClick={handleExport}
            title="Export all records to CSV"
          >
            <Download size={13} /> Export to CSV
          </button>

          {onAddNew && (
            <button className="btn btn-primary btn-sm" onClick={onAddNew}>
              <Plus size={14} /> {addNewText}
            </button>
          )}
        </div>
      </div>

      {/* Flat Bordered Table */}
      <div className="table-responsive">
        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              {columns.map((col) => {
                const isSorted = currentSortKey === col.key;
                return (
                  <th
                    key={col.key || col.label}
                    onClick={() => col.sortable !== false && col.key && handleSort(col.key)}
                    style={{
                      cursor: col.sortable !== false ? 'pointer' : 'default',
                      userSelect: 'none',
                      backgroundColor: isSorted ? '#edf4fe' : undefined
                    }}
                    title={col.sortable !== false ? `Click to sort by ${col.label} (SQL ORDER BY)` : undefined}
                  >
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <span style={{ fontWeight: isSorted ? 700 : undefined }}>{col.label}</span>
                      {col.sortable !== false && (
                        <span>
                          {isSorted ? (
                            currentSortAsc ? <ChevronUp size={13} color="#0d6efd" /> : <ChevronDown size={13} color="#0d6efd" />
                          ) : (
                            <ChevronDown size={13} color="#adb5bd" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: '2rem', textAlign: 'center' }}>
                  <div className="loading-box" style={{ padding: 0 }}>
                    <div className="spinner"></div>
                    <span>Loading records from Oracle Database...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: '2rem', textAlign: 'center', color: '#6c757d' }}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => (
                <tr key={row[columns[0]?.key] || idx}>
                  {columns.map((col) => (
                    <td key={col.key || col.label}>
                      {col.render
                        ? col.render(row[col.key], row)
                        : (row[col.key] !== null && row[col.key] !== undefined ? String(row[col.key]) : '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Flat Table Footer & Pagination */}
      {sortedData.length > 0 && (
        <div className="table-footer">
          <div>
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, sortedData.length)} of {sortedData.length} records
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <button
              className="btn btn-secondary btn-sm"
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              style={{ opacity: page === 1 ? 0.5 : 1, padding: '0.2rem 0.5rem' }}
            >
              <ChevronLeft size={13} /> Prev
            </button>
            <span style={{ padding: '0 0.4rem', fontWeight: 600 }}>
              Page {page} of {totalPages}
            </span>
            <button
              className="btn btn-secondary btn-sm"
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              style={{ opacity: page >= totalPages ? 0.5 : 1, padding: '0.2rem 0.5rem' }}
            >
              Next <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
