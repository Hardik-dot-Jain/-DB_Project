const { executeQuery } = require('../config/db');

async function getDistinctStatuses() {
  const sql = `
    SELECT DISTINCT status 
    FROM property 
    WHERE status IS NOT NULL 
    ORDER BY status ASC
  `;
  const result = await executeQuery(sql);
  return result.rows.map(r => r.STATUS);
}

async function getDistinctCategories() {
  const sql = `
    SELECT DISTINCT c.category_id, c.category_name 
    FROM property p 
    JOIN category c ON p.category_id = c.category_id 
    ORDER BY c.category_name ASC
  `;
  const result = await executeQuery(sql);
  return result.rows;
}

async function getAvgListingPrice() {
  const sql = `SELECT ROUND(AVG(listing_price), 2) AS avg_price FROM property`;
  const result = await executeQuery(sql);
  return result.rows[0]?.AVG_PRICE || 0;
}

async function getAllProperties(filters = {}) {
  let sql = `
    SELECT 
      p.property_id, 
      p.address, 
      p.listing_price, 
      p.status, 
      p.category_id, 
      c.category_name, 
      p.agent_id, 
      a.agent_name, 
      p.square_feet
    FROM property p
    LEFT JOIN category c ON p.category_id = c.category_id
    LEFT JOIN agent a ON p.agent_id = a.agent_id
    WHERE 1=1
  `;

  const binds = {};

  if (filters.search) {
    sql += ` AND (UPPER(p.property_id) LIKE UPPER(:search) OR UPPER(p.address) LIKE UPPER(:search))`;
    binds.search = `%${filters.search}%`;
  }

  if (filters.status && filters.status !== 'All') {
    sql += ` AND p.status = :status`;
    binds.status = filters.status;
  }

  if (filters.categoryId && filters.categoryId !== 'All') {
    sql += ` AND p.category_id = :categoryId`;
    binds.categoryId = Number(filters.categoryId);
  }

  if (filters.agentId && filters.agentId !== 'All') {
    sql += ` AND p.agent_id = :agentId`;
    binds.agentId = Number(filters.agentId);
  }

  // Feature 3: SQL Subquery (Above Average Properties)
  if (filters.aboveAverage === 'true' || filters.aboveAverage === true) {
    sql += ` AND p.listing_price > (SELECT AVG(listing_price) FROM property)`;
  }

  // Feature 4: Server-Side ORDER BY
  const sortMap = {
    PROPERTY_ID: 'p.property_id',
    ADDRESS: 'p.address',
    LISTING_PRICE: 'p.listing_price',
    STATUS: 'p.status',
    CATEGORY_NAME: 'c.category_name',
    AGENT_NAME: 'a.agent_name',
    SQUARE_FEET: 'p.square_feet'
  };

  const sortColumn = sortMap[String(filters.sortBy || '').toUpperCase()] || 'p.property_id';
  const sortOrder = String(filters.sortOrder || 'ASC').toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  sql += ` ORDER BY ${sortColumn} ${sortOrder}`;

  const result = await executeQuery(sql, binds);
  return result.rows;
}

async function getPropertyById(id) {
  const sql = `
    SELECT 
      p.property_id, 
      p.address, 
      p.listing_price, 
      p.status, 
      p.category_id, 
      c.category_name, 
      p.agent_id, 
      a.agent_name, 
      p.square_feet
    FROM property p
    LEFT JOIN category c ON p.category_id = c.category_id
    LEFT JOIN agent a ON p.agent_id = a.agent_id
    WHERE p.property_id = :id
  `;
  const result = await executeQuery(sql, { id: String(id).trim() });
  return result.rows.length > 0 ? result.rows[0] : null;
}

async function createProperty(data) {
  const price = Number(data.listing_price);
  if (isNaN(price) || price <= 0) {
    const err = new Error('Listing price must be a valid number greater than 0.');
    err.statusCode = 400;
    throw err;
  }

  let propertyId = data.property_id ? String(data.property_id).trim() : '';
  if (!propertyId) {
    const maxRes = await executeQuery(`
      SELECT 'P' || TO_CHAR(NVL(MAX(TO_NUMBER(SUBSTR(property_id, 2))), 5500) + 1) AS NEXT_ID 
      FROM property 
      WHERE REGEXP_LIKE(property_id, '^P[0-9]+$')
    `);
    propertyId = maxRes.rows[0].NEXT_ID || 'P5506';
  }

  const sql = `
    INSERT INTO property (property_id, address, listing_price, status, category_id, agent_id, square_feet)
    VALUES (:property_id, :address, :listing_price, :status, :category_id, :agent_id, :square_feet)
  `;

  await executeQuery(sql, {
    property_id: propertyId,
    address: data.address,
    listing_price: price,
    status: data.status || 'Active',
    category_id: data.category_id ? Number(data.category_id) : null,
    agent_id: data.agent_id ? Number(data.agent_id) : null,
    square_feet: data.square_feet ? Number(data.square_feet) : null
  }, { autoCommit: true });

  return getPropertyById(propertyId);
}

async function updateProperty(id, data) {
  const price = Number(data.listing_price);
  if (isNaN(price) || price <= 0) {
    const err = new Error('Listing price must be a valid number greater than 0.');
    err.statusCode = 400;
    throw err;
  }

  const sql = `
    UPDATE property 
    SET address = :address,
        listing_price = :listing_price,
        status = :status,
        category_id = :category_id,
        agent_id = :agent_id,
        square_feet = :square_feet
    WHERE property_id = :id
  `;

  await executeQuery(sql, {
    id: String(id).trim(),
    address: data.address,
    listing_price: price,
    status: data.status,
    category_id: data.category_id ? Number(data.category_id) : null,
    agent_id: data.agent_id ? Number(data.agent_id) : null,
    square_feet: data.square_feet ? Number(data.square_feet) : null
  }, { autoCommit: true });

  return getPropertyById(id);
}

async function deleteProperty(id) {
  const sql = `DELETE FROM property WHERE property_id = :id`;
  const result = await executeQuery(sql, { id: String(id).trim() }, { autoCommit: true });
  return result.rowsAffected > 0;
}

module.exports = {
  getDistinctStatuses,
  getDistinctCategories,
  getAvgListingPrice,
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty
};
