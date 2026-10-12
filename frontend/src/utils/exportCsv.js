/**
 * Export arbitrary JSON data array to CSV file and trigger browser download
 */
export function exportToCsv(filename, rows) {
  if (!rows || !rows.length) {
    alert('No data to export.');
    return;
  }

  const separator = ',';
  const keys = Object.keys(rows[0]);

  const csvContent = [
    // Header row
    keys.map(key => `"${key.replace(/"/g, '""')}"`).join(separator),
    // Data rows
    ...rows.map(row =>
      keys.map(key => {
        let val = row[key];
        if (val === null || val === undefined) val = '';
        const stringVal = String(val).replace(/"/g, '""');
        return `"${stringVal}"`;
      }).join(separator)
    )
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
