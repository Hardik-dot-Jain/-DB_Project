const { executeQuery, getConnection } = require('../config/db');

async function getAgentBranchColumn() {
  const conn = await getConnection();
  try {
    const res = await conn.execute(
      `SELECT column_name FROM all_tab_columns WHERE owner = 'SYSTEM' AND table_name = 'AGENT'`
    );
    const cols = res.rows.map(r => r.COLUMN_NAME.toUpperCase());
    return cols.includes('OFFICE_NAME') ? 'office_name' : 'agency_branch';
  } finally {
    await conn.close();
  }
}

// Feature 5: Market Summary of Sold Properties (SUM, MIN, MAX, AVG)
async function getSoldPropertiesSummary() {
  const sql = `
    SELECT 
      COUNT(*) AS total_sold_units,
      NVL(SUM(sale_price), 0) AS total_sold_volume,
      NVL(MIN(sale_price), 0) AS min_sold_price,
      NVL(MAX(sale_price), 0) AS max_sold_price,
      NVL(ROUND(AVG(sale_price), 2), 0) AS avg_sold_price
    FROM transaction
  `;
  const result = await executeQuery(sql);
  return result.rows[0];
}

// Feature 2: GROUP BY & HAVING Clause (Top Performing Agents)
async function getTopPerformingAgents(threshold = 1000000) {
  const branchCol = await getAgentBranchColumn();
  const sql = `
    SELECT 
      a.agent_id,
      a.agent_name,
      a.${branchCol} AS office_name,
      COUNT(t.transaction_id) AS transactions_closed,
      NVL(SUM(t.sale_price), 0) AS total_sales_volume,
      NVL(ROUND(AVG(t.sale_price), 2), 0) AS avg_sale_price,
      NVL(MIN(t.sale_price), 0) AS min_sale_price,
      NVL(MAX(t.sale_price), 0) AS max_sale_price
    FROM agent a
    JOIN property p ON a.agent_id = p.agent_id
    JOIN transaction t ON p.property_id = t.property_id
    GROUP BY a.agent_id, a.agent_name, a.${branchCol}
    HAVING SUM(t.sale_price) >= :threshold
    ORDER BY total_sales_volume DESC
  `;
  const result = await executeQuery(sql, { threshold: Number(threshold) });
  return result.rows;
}

async function getPriceStatistics() {
  const sql = `
    SELECT 
      ROUND(AVG(listing_price), 2) AS avg_price,
      MIN(listing_price) AS min_price,
      MAX(listing_price) AS max_price,
      COUNT(*) AS total_properties,
      ROUND(STDDEV(listing_price), 2) AS stddev_price,
      SUM(listing_price) AS total_inventory_value
    FROM property
  `;
  const result = await executeQuery(sql);
  return result.rows[0];
}

async function getCategoryDistribution() {
  const sql = `
    SELECT 
      c.category_id,
      c.category_name,
      c.description,
      COUNT(p.property_id) AS property_count,
      NVL(ROUND(AVG(p.listing_price), 2), 0) AS avg_listing_price,
      NVL(MIN(p.listing_price), 0) AS min_price,
      NVL(MAX(p.listing_price), 0) AS max_price,
      NVL(SUM(p.listing_price), 0) AS total_inventory_value
    FROM category c
    LEFT JOIN property p ON c.category_id = p.category_id
    GROUP BY c.category_id, c.category_name, c.description
    ORDER BY property_count DESC, c.category_name ASC
  `;
  const result = await executeQuery(sql);
  return result.rows;
}

async function getAgentPerformance() {
  const branchCol = await getAgentBranchColumn();
  const sql = `
    SELECT 
      a.agent_id,
      a.agent_name,
      a.${branchCol} AS office_name,
      COUNT(p.property_id) AS properties_managed,
      NVL(ROUND(AVG(p.listing_price), 2), 0) AS avg_listing_price,
      NVL(SUM(p.listing_price), 0) AS total_managed_value,
      NVL(SUM(CASE WHEN p.status = 'Sold' THEN 1 ELSE 0 END), 0) AS properties_sold,
      NVL(SUM(CASE WHEN p.status = 'Active' THEN 1 ELSE 0 END), 0) AS active_listings
    FROM agent a
    LEFT JOIN property p ON a.agent_id = p.agent_id
    GROUP BY a.agent_id, a.agent_name, a.${branchCol}
    ORDER BY properties_managed DESC, total_managed_value DESC
  `;
  const result = await executeQuery(sql);
  return result.rows;
}

async function getFullTransactionDetails() {
  const branchCol = await getAgentBranchColumn();
  const sql = `
    SELECT 
      t.transaction_id,
      t.property_id,
      p.address AS property_address,
      p.listing_price,
      t.offer_id,
      o.offer_amount,
      t.sale_price,
      TO_CHAR(t.sale_date, 'YYYY-MM-DD') AS sale_date,
      ROUND(t.sale_price - p.listing_price, 2) AS price_differential,
      ROUND(((t.sale_price - p.listing_price) / p.listing_price) * 100, 2) AS variance_pct,
      c.client_id,
      c.client_name,
      c.phone AS client_phone,
      c.client_type,
      a.agent_id,
      a.agent_name,
      a.${branchCol} AS agent_office
    FROM transaction t
    JOIN property p ON t.property_id = p.property_id
    JOIN offer o ON t.offer_id = o.offer_id
    JOIN client c ON o.client_id = c.client_id
    LEFT JOIN agent a ON p.agent_id = a.agent_id
    ORDER BY t.sale_date DESC, t.transaction_id DESC
  `;
  const result = await executeQuery(sql);
  return result.rows;
}

async function getOfferSuccessRates() {
  const sql = `
    SELECT 
      NVL(offer_status, 'Unspecified') AS offer_status,
      COUNT(*) AS count,
      ROUND((COUNT(*) * 100.0) / (SELECT NULLIF(COUNT(*), 0) FROM offer), 1) AS percentage,
      ROUND(AVG(offer_amount), 2) AS avg_offer_amount,
      MIN(offer_amount) AS min_offer_amount,
      MAX(offer_amount) AS max_offer_amount,
      SUM(offer_amount) AS total_amount
    FROM offer
    GROUP BY offer_status
    ORDER BY count DESC
  `;
  const result = await executeQuery(sql);
  return result.rows;
}

async function getAllReports(havingThreshold = 1000000) {
  const [
    soldSummary,
    topAgents,
    priceStats,
    categories,
    agentPerf,
    transactions,
    offerRates
  ] = await Promise.all([
    getSoldPropertiesSummary(),
    getTopPerformingAgents(havingThreshold),
    getPriceStatistics(),
    getCategoryDistribution(),
    getAgentPerformance(),
    getFullTransactionDetails(),
    getOfferSuccessRates()
  ]);

  return {
    soldPropertiesSummary: soldSummary,
    topPerformingAgents: topAgents,
    priceStatistics: priceStats,
    categoryDistribution: categories,
    agentPerformance: agentPerf,
    fullTransactionDetails: transactions,
    offerSuccessRates: offerRates
  };
}

module.exports = {
  getSoldPropertiesSummary,
  getTopPerformingAgents,
  getPriceStatistics,
  getCategoryDistribution,
  getAgentPerformance,
  getFullTransactionDetails,
  getOfferSuccessRates,
  getAllReports
};
