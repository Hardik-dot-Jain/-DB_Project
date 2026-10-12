const { executeQuery } = require('../config/db');

async function getDashboardData() {
  // 1. Summary Metrics
  const metricsSql = `
    SELECT
      (SELECT COUNT(*) FROM property WHERE status = 'Active') AS active_properties,
      (SELECT COUNT(*) FROM property) AS total_properties,
      (SELECT COUNT(*) FROM agent) AS total_agents,
      (SELECT COUNT(*) FROM client) AS total_clients,
      (SELECT COUNT(*) FROM offer WHERE offer_status = 'Pending') AS pending_offers,
      (SELECT COUNT(*) FROM transaction) AS total_sales,
      (SELECT NVL(SUM(sale_price), 0) FROM transaction) AS total_sales_volume,
      (SELECT NVL(ROUND(AVG(listing_price), 2), 0) FROM property) AS avg_listing_price
    FROM dual
  `;

  // 2. Properties by Status
  const statusSql = `
    SELECT 
      NVL(status, 'Unspecified') AS status, 
      COUNT(*) AS count
    FROM property 
    GROUP BY status 
    ORDER BY count DESC
  `;

  // 3. Properties by Category
  const categorySql = `
    SELECT 
      c.category_name, 
      COUNT(p.property_id) AS count,
      NVL(ROUND(AVG(p.listing_price), 2), 0) AS avg_price
    FROM category c
    LEFT JOIN property p ON c.category_id = p.category_id
    GROUP BY c.category_name
    ORDER BY count DESC
  `;

  // 4. Offer Statuses
  const offerStatusSql = `
    SELECT 
      NVL(offer_status, 'Unspecified') AS status, 
      COUNT(*) AS count,
      NVL(SUM(offer_amount), 0) AS total_amount
    FROM offer 
    GROUP BY offer_status 
    ORDER BY count DESC
  `;

  // 5. Sales Value by Date
  const salesByDateSql = `
    SELECT 
      TO_CHAR(sale_date, 'YYYY-MM-DD') AS sale_date, 
      SUM(sale_price) AS daily_total, 
      COUNT(*) AS transactions_count
    FROM transaction 
    WHERE sale_date IS NOT NULL
    GROUP BY sale_date 
    ORDER BY sale_date ASC
  `;

  // 6. Recent Transactions with Joins
  const recentTransactionsSql = `
    SELECT 
      t.transaction_id,
      t.property_id,
      p.address AS property_address,
      c.client_name,
      t.sale_price,
      TO_CHAR(t.sale_date, 'YYYY-MM-DD') AS sale_date
    FROM transaction t
    LEFT JOIN property p ON t.property_id = p.property_id
    LEFT JOIN offer o ON t.offer_id = o.offer_id
    LEFT JOIN client c ON o.client_id = c.client_id
    ORDER BY t.sale_date DESC, t.transaction_id DESC
  `;

  const [
    metricsRes,
    statusRes,
    categoryRes,
    offerStatusRes,
    salesByDateRes,
    recentTxRes
  ] = await Promise.all([
    executeQuery(metricsSql),
    executeQuery(statusSql),
    executeQuery(categorySql),
    executeQuery(offerStatusSql),
    executeQuery(salesByDateSql),
    executeQuery(recentTransactionsSql)
  ]);

  return {
    metrics: metricsRes.rows[0],
    charts: {
      propertiesByStatus: statusRes.rows,
      propertiesByCategory: categoryRes.rows,
      offerStatuses: offerStatusRes.rows,
      salesByDate: salesByDateRes.rows
    },
    recentTransactions: recentTxRes.rows
  };
}

async function getAgentDashboardData(agentId) {
  const safeAgentId = Number(agentId);

  // 1. Agent profile info
  const agentRes = await executeQuery(
    `SELECT agent_id, agent_name, office_name FROM agent WHERE agent_id = :id`,
    { id: safeAgentId }
  );
  const agent = agentRes.rows[0] || { AGENT_ID: safeAgentId, AGENT_NAME: 'Agent', OFFICE_NAME: 'General' };

  // 2. Metrics for this specific agent
  const metricsSql = `
    SELECT
      (SELECT COUNT(*) FROM property WHERE agent_id = :id) AS assigned_properties,
      (SELECT COUNT(*) FROM property WHERE agent_id = :id AND status = 'Active') AS active_properties,
      (SELECT COUNT(*) FROM property WHERE agent_id = :id AND status = 'Pending') AS pending_properties,
      (SELECT COUNT(*) FROM property WHERE agent_id = :id AND status = 'Sold') AS sold_properties,
      (SELECT NVL(SUM(t.sale_price), 0)
       FROM transaction t
       JOIN property p ON t.property_id = p.property_id
       WHERE p.agent_id = :id) AS total_sales_volume,
      (SELECT COUNT(*)
       FROM transaction t
       JOIN property p ON t.property_id = p.property_id
       WHERE p.agent_id = :id) AS total_sales_count,
      (SELECT COUNT(*)
       FROM showing s
       JOIN property p ON s.property_id = p.property_id
       WHERE p.agent_id = :id) AS total_showings,
      (SELECT COUNT(*)
       FROM offer o
       JOIN property p ON o.property_id = p.property_id
       WHERE p.agent_id = :id AND o.offer_status = 'Pending') AS pending_offers
    FROM dual
  `;
  const metricsRes = await executeQuery(metricsSql, { id: safeAgentId });

  // 3. Upcoming showings on their properties
  const showingsSql = `
    SELECT
      s.showing_id,
      s.property_id,
      p.address AS property_address,
      p.listing_price,
      s.client_id,
      c.client_name,
      c.phone AS client_phone,
      TO_CHAR(s.showing_date, 'YYYY-MM-DD') AS showing_date
    FROM showing s
    JOIN property p ON s.property_id = p.property_id
    LEFT JOIN client c ON s.client_id = c.client_id
    WHERE p.agent_id = :id
    ORDER BY s.showing_date ASC, s.showing_id DESC
  `;
  const showingsRes = await executeQuery(showingsSql, { id: safeAgentId });

  // 4. Assigned property listings
  const propertiesSql = `
    SELECT
      p.property_id,
      p.address,
      p.listing_price,
      p.status,
      c.category_name,
      p.square_feet
    FROM property p
    LEFT JOIN category c ON p.category_id = c.category_id
    WHERE p.agent_id = :id
    ORDER BY p.property_id DESC
  `;
  const propertiesRes = await executeQuery(propertiesSql, { id: safeAgentId });

  // 5. Recent offers on their properties
  const offersSql = `
    SELECT
      o.offer_id,
      o.property_id,
      p.address AS property_address,
      c.client_name,
      c.phone AS client_phone,
      o.offer_amount,
      o.offer_status
    FROM offer o
    JOIN property p ON o.property_id = p.property_id
    LEFT JOIN client c ON o.client_id = c.client_id
    WHERE p.agent_id = :id
    ORDER BY o.offer_id DESC
  `;
  const offersRes = await executeQuery(offersSql, { id: safeAgentId });

  return {
    agent,
    metrics: metricsRes.rows[0],
    showings: showingsRes.rows,
    properties: propertiesRes.rows,
    offers: offersRes.rows
  };
}

async function getClientDashboardData(clientId) {
  const safeClientId = Number(clientId);

  // 1. Client profile info
  const clientRes = await executeQuery(
    `SELECT client_id, client_name, phone, client_type FROM client WHERE client_id = :id`,
    { id: safeClientId }
  );
  const client = clientRes.rows[0] || { CLIENT_ID: safeClientId, CLIENT_NAME: 'Client', CLIENT_TYPE: 'Buyer' };

  // 2. Metrics for this client
  const metricsSql = `
    SELECT
      (SELECT COUNT(*) FROM showing WHERE client_id = :id) AS total_viewings,
      (SELECT COUNT(*) FROM offer WHERE client_id = :id) AS total_offers,
      (SELECT COUNT(*) FROM offer WHERE client_id = :id AND offer_status = 'Accepted') AS accepted_offers,
      (SELECT COUNT(*) FROM offer WHERE client_id = :id AND offer_status = 'Pending') AS pending_offers,
      (SELECT COUNT(*)
       FROM transaction t
       JOIN offer o ON t.offer_id = o.offer_id
       WHERE o.client_id = :id) AS completed_purchases
    FROM dual
  `;
  const metricsRes = await executeQuery(metricsSql, { id: safeClientId });

  // 3. Client's scheduled viewings
  const viewingsSql = `
    SELECT
      s.showing_id,
      s.property_id,
      p.address AS property_address,
      p.listing_price,
      p.status AS property_status,
      a.agent_name,
      TO_CHAR(s.showing_date, 'YYYY-MM-DD') AS showing_date
    FROM showing s
    JOIN property p ON s.property_id = p.property_id
    LEFT JOIN agent a ON p.agent_id = a.agent_id
    WHERE s.client_id = :id
    ORDER BY s.showing_date ASC
  `;
  const viewingsRes = await executeQuery(viewingsSql, { id: safeClientId });

  // 4. Client's purchase offers
  const offersSql = `
    SELECT
      o.offer_id,
      o.property_id,
      p.address AS property_address,
      p.listing_price,
      o.offer_amount,
      o.offer_status,
      a.agent_name
    FROM offer o
    JOIN property p ON o.property_id = p.property_id
    LEFT JOIN agent a ON p.agent_id = a.agent_id
    WHERE o.client_id = :id
    ORDER BY o.offer_id DESC
  `;
  const offersRes = await executeQuery(offersSql, { id: safeClientId });

  // 5. Available Active properties to browse
  const activePropsSql = `
    SELECT
      p.property_id,
      p.address,
      p.listing_price,
      p.status,
      c.category_name,
      a.agent_name,
      p.square_feet
    FROM property p
    LEFT JOIN category c ON p.category_id = c.category_id
    LEFT JOIN agent a ON p.agent_id = a.agent_id
    WHERE p.status = 'Active'
    ORDER BY p.listing_price ASC
  `;
  const activePropsRes = await executeQuery(activePropsSql);

  return {
    client,
    metrics: metricsRes.rows[0],
    viewings: viewingsRes.rows,
    offers: offersRes.rows,
    activeProperties: activePropsRes.rows.slice(0, 8)
  };
}

module.exports = {
  getDashboardData,
  getAgentDashboardData,
  getClientDashboardData
};
