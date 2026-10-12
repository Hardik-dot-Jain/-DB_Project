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

async function getAllAgents(options = {}) {
  const branchCol = await getAgentBranchColumn();
  const sortMap = {
    agent_id: 'agent_id',
    agent_name: 'agent_name',
    office_name: branchCol,
    agency_branch: branchCol
  };
  const sortCol = sortMap[options.sortBy] || 'agent_id';
  const sortDir = (options.sortOrder || 'ASC').toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  const sql = `
    SELECT 
      agent_id, 
      agent_name, 
      ${branchCol} AS office_name, 
      ${branchCol} AS agency_branch
    FROM agent 
    ORDER BY ${sortCol} ${sortDir}
  `;
  const result = await executeQuery(sql);
  return result.rows;
}

async function getAgentById(id) {
  const branchCol = await getAgentBranchColumn();
  const sql = `
    SELECT 
      agent_id, 
      agent_name, 
      ${branchCol} AS office_name, 
      ${branchCol} AS agency_branch
    FROM agent 
    WHERE agent_id = :id
  `;
  const result = await executeQuery(sql, { id: Number(id) });
  return result.rows.length > 0 ? result.rows[0] : null;
}

async function createAgent(data) {
  const branchCol = await getAgentBranchColumn();
  let agentId = Number(data.agent_id);

  // If no ID provided, compute MAX(agent_id) + 1
  if (!agentId || isNaN(agentId)) {
    const maxRes = await executeQuery(`SELECT NVL(MAX(agent_id), 9000) + 1 AS NEXT_ID FROM agent`);
    agentId = maxRes.rows[0].NEXT_ID;
  }

  const branchValue = data.office_name || data.agency_branch || 'Main Office';
  const sql = `
    INSERT INTO agent (agent_id, agent_name, ${branchCol})
    VALUES (:agent_id, :agent_name, :branchValue)
  `;

  await executeQuery(sql, {
    agent_id: agentId,
    agent_name: data.agent_name,
    branchValue
  }, { autoCommit: true });

  return getAgentById(agentId);
}

async function updateAgent(id, data) {
  const branchCol = await getAgentBranchColumn();
  const branchValue = data.office_name || data.agency_branch || 'Main Office';
  const sql = `
    UPDATE agent 
    SET agent_name = :agent_name,
        ${branchCol} = :branchValue
    WHERE agent_id = :id
  `;

  await executeQuery(sql, {
    id: Number(id),
    agent_name: data.agent_name,
    branchValue
  }, { autoCommit: true });

  return getAgentById(id);
}

async function deleteAgent(id) {
  // Check if agent is assigned to any properties first
  const propCheck = await executeQuery(
    `SELECT COUNT(*) AS CNT FROM property WHERE agent_id = :id`,
    { id: Number(id) }
  );
  if (propCheck.rows[0].CNT > 0) {
    const err = new Error(`Cannot delete Agent ID ${id}: Currently managing ${propCheck.rows[0].CNT} property listing(s). Reassign them first.`);
    err.statusCode = 409;
    throw err;
  }

  const sql = `DELETE FROM agent WHERE agent_id = :id`;
  const result = await executeQuery(sql, { id: Number(id) }, { autoCommit: true });
  return result.rowsAffected > 0;
}

module.exports = {
  getAllAgents,
  getAgentById,
  createAgent,
  updateAgent,
  deleteAgent
};
