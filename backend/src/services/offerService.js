const { executeQuery } = require('../config/db');

async function getAllOffers(filters = {}) {
  let sql = `
    SELECT 
      o.offer_id,
      o.property_id,
      p.address AS property_address,
      p.listing_price,
      o.client_id,
      c.client_name,
      c.phone AS client_phone,
      o.offer_amount,
      o.offer_status
    FROM offer o
    LEFT JOIN property p ON o.property_id = p.property_id
    LEFT JOIN client c ON o.client_id = c.client_id
    WHERE 1=1
  `;
  const binds = {};

  if (filters.status && filters.status !== 'All') {
    sql += ` AND o.offer_status = :status`;
    binds.status = filters.status;
  }

  if (filters.propertyId) {
    sql += ` AND o.property_id = :propertyId`;
    binds.propertyId = String(filters.propertyId).trim();
  }

  if (filters.agentId) {
    sql += ` AND p.agent_id = :agentId`;
    binds.agentId = Number(filters.agentId);
  }

  if (filters.clientId) {
    sql += ` AND o.client_id = :clientId`;
    binds.clientId = Number(filters.clientId);
  }

  const sortMap = {
    offer_id: 'o.offer_id',
    property_id: 'o.property_id',
    property_address: 'p.address',
    client_name: 'c.client_name',
    listing_price: 'p.listing_price',
    offer_amount: 'o.offer_amount',
    offer_status: 'o.offer_status'
  };
  const sortCol = sortMap[filters.sortBy] || 'o.offer_id';
  const defaultDir = filters.sortBy ? 'ASC' : 'DESC';
  const sortDir = (filters.sortOrder || defaultDir).toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  sql += ` ORDER BY ${sortCol} ${sortDir}`;

  const result = await executeQuery(sql, binds);
  return result.rows;
}

async function getOfferById(id) {
  const sql = `
    SELECT 
      o.offer_id,
      o.property_id,
      p.address AS property_address,
      p.listing_price,
      o.client_id,
      c.client_name,
      c.phone AS client_phone,
      o.offer_amount,
      o.offer_status
    FROM offer o
    LEFT JOIN property p ON o.property_id = p.property_id
    LEFT JOIN client c ON o.client_id = c.client_id
    WHERE o.offer_id = :id
  `;
  const result = await executeQuery(sql, { id: Number(id) });
  return result.rows.length > 0 ? result.rows[0] : null;
}

async function createOffer(data) {
  const amount = Number(data.offer_amount);
  if (isNaN(amount) || amount <= 0) {
    const err = new Error('Offer amount must be a valid number greater than 0.');
    err.statusCode = 400;
    throw err;
  }

  let offerId = Number(data.offer_id);
  if (!offerId || isNaN(offerId)) {
    const maxRes = await executeQuery(`SELECT NVL(MAX(offer_id), 4000) + 1 AS NEXT_ID FROM offer`);
    offerId = maxRes.rows[0].NEXT_ID;
  }

  const sql = `
    INSERT INTO offer (offer_id, property_id, client_id, offer_amount, offer_status)
    VALUES (:offer_id, :property_id, :client_id, :offer_amount, :offer_status)
  `;

  await executeQuery(sql, {
    offer_id: offerId,
    property_id: String(data.property_id).trim(),
    client_id: Number(data.client_id),
    offer_amount: amount,
    offer_status: data.offer_status || 'Pending'
  }, { autoCommit: true });

  return getOfferById(offerId);
}

async function updateOffer(id, data) {
  const amount = Number(data.offer_amount);
  if (isNaN(amount) || amount <= 0) {
    const err = new Error('Offer amount must be a valid number greater than 0.');
    err.statusCode = 400;
    throw err;
  }

  const sql = `
    UPDATE offer 
    SET property_id = :property_id,
        client_id = :client_id,
        offer_amount = :offer_amount,
        offer_status = :offer_status
    WHERE offer_id = :id
  `;

  await executeQuery(sql, {
    id: Number(id),
    property_id: String(data.property_id).trim(),
    client_id: Number(data.client_id),
    offer_amount: amount,
    offer_status: data.offer_status
  }, { autoCommit: true });

  return getOfferById(id);
}

async function deleteOffer(id) {
  // Check if a transaction is recorded for this offer
  const txCheck = await executeQuery(
    `SELECT COUNT(*) AS CNT FROM transaction WHERE offer_id = :id`,
    { id: Number(id) }
  );
  if (txCheck.rows[0].CNT > 0) {
    const err = new Error(`Cannot delete Offer ID ${id}: Finalized in ${txCheck.rows[0].CNT} completed sales transaction(s).`);
    err.statusCode = 409;
    throw err;
  }

  const sql = `DELETE FROM offer WHERE offer_id = :id`;
  const result = await executeQuery(sql, { id: Number(id) }, { autoCommit: true });
  return result.rowsAffected > 0;
}

module.exports = {
  getAllOffers,
  getOfferById,
  createOffer,
  updateOffer,
  deleteOffer
};
