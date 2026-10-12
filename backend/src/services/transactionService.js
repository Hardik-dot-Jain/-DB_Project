const { executeQuery, executeTransaction } = require('../config/db');

async function getAllTransactions(options = {}) {
  const sortMap = {
    transaction_id: 't.transaction_id',
    property_id: 't.property_id',
    property_address: 'p.address',
    listing_price: 'p.listing_price',
    offer_id: 't.offer_id',
    client_name: 'c.client_name',
    sale_price: 't.sale_price',
    sale_date: 't.sale_date'
  };
  const sortCol = sortMap[options.sortBy] || 't.sale_date';
  const defaultDir = options.sortBy ? 'ASC' : 'DESC';
  const sortDir = (options.sortOrder || defaultDir).toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  let sql = `
    SELECT 
      t.transaction_id,
      t.property_id,
      p.address AS property_address,
      p.listing_price,
      t.offer_id,
      o.offer_amount,
      c.client_id,
      c.client_name,
      c.phone AS client_phone,
      t.sale_price,
      TO_CHAR(t.sale_date, 'YYYY-MM-DD') AS sale_date
    FROM transaction t
    LEFT JOIN property p ON t.property_id = p.property_id
    LEFT JOIN offer o ON t.offer_id = o.offer_id
    LEFT JOIN client c ON o.client_id = c.client_id
    WHERE 1=1
  `;
  const binds = {};

  if (options.agentId) {
    sql += ` AND p.agent_id = :agentId`;
    binds.agentId = Number(options.agentId);
  }

  if (options.clientId) {
    sql += ` AND o.client_id = :clientId`;
    binds.clientId = Number(options.clientId);
  }

  sql += ` ORDER BY ${sortCol} ${sortDir}, t.transaction_id DESC`;
  const result = await executeQuery(sql, binds);
  return result.rows;
}

async function getTransactionById(id) {
  const sql = `
    SELECT 
      t.transaction_id,
      t.property_id,
      p.address AS property_address,
      p.listing_price,
      t.offer_id,
      o.offer_amount,
      c.client_id,
      c.client_name,
      c.phone AS client_phone,
      t.sale_price,
      TO_CHAR(t.sale_date, 'YYYY-MM-DD') AS sale_date
    FROM transaction t
    LEFT JOIN property p ON t.property_id = p.property_id
    LEFT JOIN offer o ON t.offer_id = o.offer_id
    LEFT JOIN client c ON o.client_id = c.client_id
    WHERE t.transaction_id = :id
  `;
  const result = await executeQuery(sql, { id: Number(id) });
  return result.rows.length > 0 ? result.rows[0] : null;
}

async function createTransaction(data) {
  const salePrice = Number(data.sale_price);
  if (isNaN(salePrice) || salePrice <= 0) {
    const err = new Error('Sale price must be a valid number greater than 0.');
    err.statusCode = 400;
    throw err;
  }

  const dateStr = data.sale_date ? String(data.sale_date).slice(0, 10) : new Date().toISOString().slice(0, 10);
  const propertyId = String(data.property_id).trim();
  const offerId = Number(data.offer_id);

  // Execute multi-step atomic database transaction
  const newTxId = await executeTransaction(async (conn) => {
    let txId = Number(data.transaction_id);
    if (!txId || isNaN(txId)) {
      const maxRes = await conn.execute(`SELECT NVL(MAX(transaction_id), 5000) + 1 AS NEXT_ID FROM transaction`);
      txId = maxRes.rows[0].NEXT_ID;
    }

    // 1. Insert Transaction
    await conn.execute(
      `INSERT INTO transaction (transaction_id, property_id, offer_id, sale_price, sale_date)
       VALUES (:transaction_id, :property_id, :offer_id, :sale_price, TO_DATE(:sale_date, 'YYYY-MM-DD'))`,
      {
        transaction_id: txId,
        property_id: propertyId,
        offer_id: offerId,
        sale_price: salePrice,
        sale_date: dateStr
      }
    );

    // 2. Mark Property status as 'Sold'
    await conn.execute(
      `UPDATE property SET status = 'Sold' WHERE property_id = :property_id`,
      { property_id: propertyId }
    );

    // 3. Mark Offer status as 'Accepted'
    await conn.execute(
      `UPDATE offer SET offer_status = 'Accepted' WHERE offer_id = :offer_id`,
      { offer_id: offerId }
    );

    return txId;
  });

  return getTransactionById(newTxId);
}

async function updateTransaction(id, data) {
  const salePrice = Number(data.sale_price);
  if (isNaN(salePrice) || salePrice <= 0) {
    const err = new Error('Sale price must be a valid number greater than 0.');
    err.statusCode = 400;
    throw err;
  }

  const dateStr = data.sale_date ? String(data.sale_date).slice(0, 10) : new Date().toISOString().slice(0, 10);

  const sql = `
    UPDATE transaction 
    SET property_id = :property_id,
        offer_id = :offer_id,
        sale_price = :sale_price,
        sale_date = TO_DATE(:sale_date, 'YYYY-MM-DD')
    WHERE transaction_id = :id
  `;

  await executeQuery(sql, {
    id: Number(id),
    property_id: String(data.property_id).trim(),
    offer_id: Number(data.offer_id),
    sale_price: salePrice,
    sale_date: dateStr
  }, { autoCommit: true });

  return getTransactionById(id);
}

async function deleteTransaction(id) {
  const sql = `DELETE FROM transaction WHERE transaction_id = :id`;
  const result = await executeQuery(sql, { id: Number(id) }, { autoCommit: true });
  return result.rowsAffected > 0;
}

module.exports = {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction
};
