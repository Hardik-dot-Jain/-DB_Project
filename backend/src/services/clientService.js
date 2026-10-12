const { executeQuery } = require('../config/db');

async function getDistinctClientTypes() {
  const sql = `
    SELECT DISTINCT client_type 
    FROM client 
    WHERE client_type IS NOT NULL 
    ORDER BY client_type ASC
  `;
  const result = await executeQuery(sql);
  return result.rows.map(r => r.CLIENT_TYPE);
}

async function getAllClients(filters = {}) {
  let sql = `
    SELECT client_id, client_name, phone, client_type
    FROM client
    WHERE 1=1
  `;
  const binds = {};

  if (filters.search) {
    sql += ` AND (UPPER(client_name) LIKE UPPER(:search) OR phone LIKE :search)`;
    binds.search = `%${filters.search}%`;
  }

  if (filters.clientType && filters.clientType !== 'All') {
    sql += ` AND client_type = :clientType`;
    binds.clientType = filters.clientType;
  }

  // Feature 4: Server-Side ORDER BY
  const sortMap = {
    CLIENT_ID: 'client_id',
    CLIENT_NAME: 'client_name',
    PHONE: 'phone',
    CLIENT_TYPE: 'client_type'
  };

  const sortColumn = sortMap[String(filters.sortBy || '').toUpperCase()] || 'client_id';
  const sortOrder = String(filters.sortOrder || 'ASC').toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  sql += ` ORDER BY ${sortColumn} ${sortOrder}`;

  const result = await executeQuery(sql, binds);
  return result.rows;
}

async function getClientById(id) {
  const sql = `
    SELECT client_id, client_name, phone, client_type
    FROM client
    WHERE client_id = :id
  `;
  const result = await executeQuery(sql, { id: Number(id) });
  return result.rows.length > 0 ? result.rows[0] : null;
}

async function createClient(data) {
  let clientId = Number(data.client_id);
  if (!clientId || isNaN(clientId)) {
    const maxRes = await executeQuery(`SELECT NVL(MAX(client_id), 2000) + 1 AS NEXT_ID FROM client`);
    clientId = maxRes.rows[0].NEXT_ID;
  }

  const sql = `
    INSERT INTO client (client_id, client_name, phone, client_type)
    VALUES (:client_id, :client_name, :phone, :client_type)
  `;

  await executeQuery(sql, {
    client_id: clientId,
    client_name: data.client_name,
    phone: data.phone || null,
    client_type: data.client_type || 'Buyer'
  }, { autoCommit: true });

  return getClientById(clientId);
}

async function updateClient(id, data) {
  const sql = `
    UPDATE client 
    SET client_name = :client_name,
        phone = :phone,
        client_type = :client_type
    WHERE client_id = :id
  `;

  await executeQuery(sql, {
    id: Number(id),
    client_name: data.client_name,
    phone: data.phone || null,
    client_type: data.client_type || 'Buyer'
  }, { autoCommit: true });

  return getClientById(id);
}

async function deleteClient(id) {
  const showingCheck = await executeQuery(
    `SELECT COUNT(*) AS CNT FROM showing WHERE client_id = :id`,
    { id: Number(id) }
  );
  if (showingCheck.rows[0].CNT > 0) {
    const err = new Error(`Cannot delete Client ID ${id}: Client is linked to ${showingCheck.rows[0].CNT} scheduled showing(s).`);
    err.statusCode = 409;
    throw err;
  }

  const offerCheck = await executeQuery(
    `SELECT COUNT(*) AS CNT FROM offer WHERE client_id = :id`,
    { id: Number(id) }
  );
  if (offerCheck.rows[0].CNT > 0) {
    const err = new Error(`Cannot delete Client ID ${id}: Client has made ${offerCheck.rows[0].CNT} property offer(s).`);
    err.statusCode = 409;
    throw err;
  }

  const sql = `DELETE FROM client WHERE client_id = :id`;
  const result = await executeQuery(sql, { id: Number(id) }, { autoCommit: true });
  return result.rowsAffected > 0;
}

module.exports = {
  getDistinctClientTypes,
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient
};
