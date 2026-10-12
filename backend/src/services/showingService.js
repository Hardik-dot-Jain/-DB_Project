const { executeQuery } = require('../config/db');

async function getAllShowings(options = {}) {
  const sortMap = {
    showing_id: 's.showing_id',
    property_id: 's.property_id',
    property_address: 'p.address',
    client_id: 's.client_id',
    client_name: 'c.client_name',
    showing_date: 's.showing_date'
  };
  const sortCol = sortMap[options.sortBy] || 's.showing_date';
  const defaultDir = options.sortBy ? 'ASC' : 'DESC';
  const sortDir = (options.sortOrder || defaultDir).toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  let sql = `
    SELECT 
      s.showing_id,
      s.property_id,
      p.address AS property_address,
      s.client_id,
      c.client_name,
      c.phone AS client_phone,
      TO_CHAR(s.showing_date, 'YYYY-MM-DD') AS showing_date
    FROM showing s
    LEFT JOIN property p ON s.property_id = p.property_id
    LEFT JOIN client c ON s.client_id = c.client_id
    WHERE 1=1
  `;
  const binds = {};

  if (options.agentId) {
    sql += ` AND p.agent_id = :agentId`;
    binds.agentId = Number(options.agentId);
  }

  if (options.clientId) {
    sql += ` AND s.client_id = :clientId`;
    binds.clientId = Number(options.clientId);
  }

  sql += ` ORDER BY ${sortCol} ${sortDir}, s.showing_id DESC`;
  const result = await executeQuery(sql, binds);
  return result.rows;
}

async function getShowingById(id) {
  const sql = `
    SELECT 
      s.showing_id,
      s.property_id,
      p.address AS property_address,
      s.client_id,
      c.client_name,
      c.phone AS client_phone,
      TO_CHAR(s.showing_date, 'YYYY-MM-DD') AS showing_date
    FROM showing s
    LEFT JOIN property p ON s.property_id = p.property_id
    LEFT JOIN client c ON s.client_id = c.client_id
    WHERE s.showing_id = :id
  `;
  const result = await executeQuery(sql, { id: Number(id) });
  return result.rows.length > 0 ? result.rows[0] : null;
}

async function createShowing(data) {
  let showingId = Number(data.showing_id);
  if (!showingId || isNaN(showingId)) {
    const maxRes = await executeQuery(`SELECT NVL(MAX(showing_id), 3000) + 1 AS NEXT_ID FROM showing`);
    showingId = maxRes.rows[0].NEXT_ID;
  }

  const dateStr = data.showing_date ? String(data.showing_date).slice(0, 10) : new Date().toISOString().slice(0, 10);

  const sql = `
    INSERT INTO showing (showing_id, property_id, client_id, showing_date)
    VALUES (:showing_id, :property_id, :client_id, TO_DATE(:showing_date, 'YYYY-MM-DD'))
  `;

  await executeQuery(sql, {
    showing_id: showingId,
    property_id: String(data.property_id).trim(),
    client_id: Number(data.client_id),
    showing_date: dateStr
  }, { autoCommit: true });

  return getShowingById(showingId);
}

async function updateShowing(id, data) {
  const dateStr = data.showing_date ? String(data.showing_date).slice(0, 10) : new Date().toISOString().slice(0, 10);

  const sql = `
    UPDATE showing 
    SET property_id = :property_id,
        client_id = :client_id,
        showing_date = TO_DATE(:showing_date, 'YYYY-MM-DD')
    WHERE showing_id = :id
  `;

  await executeQuery(sql, {
    id: Number(id),
    property_id: String(data.property_id).trim(),
    client_id: Number(data.client_id),
    showing_date: dateStr
  }, { autoCommit: true });

  return getShowingById(id);
}

async function deleteShowing(id) {
  const sql = `DELETE FROM showing WHERE showing_id = :id`;
  const result = await executeQuery(sql, { id: Number(id) }, { autoCommit: true });
  return result.rowsAffected > 0;
}

module.exports = {
  getAllShowings,
  getShowingById,
  createShowing,
  updateShowing,
  deleteShowing
};
