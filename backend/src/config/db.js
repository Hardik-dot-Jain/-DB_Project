const oracledb = require('oracledb');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Configure oracledb output format to Objects (key-value) by default
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.autoCommit = false; // Explicit transaction control

let isClientInitialized = false;

// Attempt to initialize Oracle Client (Thick mode) for Oracle 11g compatibility on Windows
function initializeClientIfNeeded() {
  if (isClientInitialized) return;

  const candidateDirs = [
    process.env.ORACLE_CLIENT_LIB_DIR,
    'C:\\oraclexe\\app\\oracle\\product\\11.2.0\\server\\bin',
    'C:\\oracle\\instantclient_19_8',
    'C:\\instantclient_19_8'
  ].filter(Boolean);

  for (const dir of candidateDirs) {
    if (fs.existsSync(dir)) {
      try {
        oracledb.initOracleClient({ libDir: dir });
        isClientInitialized = true;
        console.log(`[Oracle DB] Initialized in Thick Mode using library dir: ${dir}`);
        return;
      } catch (err) {
        if (err.message.includes('NJS-027')) {
          isClientInitialized = true;
          return;
        }
        console.warn(`[Oracle DB] Could not init client from ${dir}:`, err.message);
      }
    }
  }

  try {
    oracledb.initOracleClient();
    isClientInitialized = true;
    console.log('[Oracle DB] Initialized in Thick Mode using system PATH.');
  } catch (err) {
    if (!err.message.includes('NJS-027')) {
      console.log('[Oracle DB] Proceeding in Thin Mode (or client already initialized):', err.message);
    }
    isClientInitialized = true;
  }
}

let pool = null;
let currentAuthMode = 'none';

async function initDbPool() {
  if (pool) return pool;
  initializeClientIfNeeded();

  const user = process.env.DB_USER || 'SYSTEM';
  const password = process.env.DB_PASSWORD;
  const connectString = process.env.DB_CONNECT_STRING || 'localhost:1521/XE';

  const poolMin = parseInt(process.env.DB_POOL_MIN || '2', 10);
  const poolMax = parseInt(process.env.DB_POOL_MAX || '10', 10);
  const poolIncrement = parseInt(process.env.DB_POOL_INCREMENT || '2', 10);
  const poolTimeout = parseInt(process.env.DB_POOL_TIMEOUT || '60', 10);

  const hasConfiguredPassword = password && password !== 'your_oracle_password' && password.trim() !== '';

  if (hasConfiguredPassword) {
    try {
      pool = await oracledb.createPool({
        user,
        password,
        connectString,
        poolMin,
        poolMax,
        poolIncrement,
        poolTimeout,
        poolAlias: 'estateflow_pool'
      });
      currentAuthMode = `Credentials (${user})`;
      console.log(`[Oracle DB] Connection pool created for user '${user}'.`);
      return pool;
    } catch (err) {
      console.warn(`[Oracle DB] Password authentication failed: ${err.message}. Checking OS Authentication fallback...`);
    }
  }

  // OS Authentication fallback (works seamlessly on Windows local Oracle XE)
  try {
    const testConn = await oracledb.getConnection({ externalAuth: true, privilege: oracledb.SYSDBA });
    await testConn.close();
    currentAuthMode = 'OS Authentication (SYSDBA)';
    console.log('[Oracle DB] Connected via Local OS Authentication (SYSDBA).');
    return null; // Signals to use direct OS auth connections
  } catch (osErr) {
    console.warn('[Oracle DB] OS Authentication not available:', osErr.message);
  }

  throw new Error('Database authentication not configured. Please set DB_USER and DB_PASSWORD in backend/.env.');
}

/**
 * Acquire a connection (from pool or via OS auth) and set current schema to SYSTEM
 */
async function getConnection() {
  initializeClientIfNeeded();
  const schema = process.env.DB_SCHEMA || 'SYSTEM';

  let conn;
  const user = process.env.DB_USER || 'SYSTEM';
  const password = process.env.DB_PASSWORD;
  const connectString = process.env.DB_CONNECT_STRING || 'localhost:1521/XE';
  const hasConfiguredPassword = password && password !== 'your_oracle_password' && password.trim() !== '';

  if (hasConfiguredPassword) {
    if (!pool) {
      await initDbPool();
    }
    if (pool) {
      conn = await pool.getConnection();
    }
  }

  if (!conn) {
    // OS Auth connection
    conn = await oracledb.getConnection({ externalAuth: true, privilege: oracledb.SYSDBA });
    currentAuthMode = 'OS Authentication (SYSDBA)';
  }

  if (conn) {
    try {
      await conn.execute(`ALTER SESSION SET CURRENT_SCHEMA = ${schema}`);
    } catch (schemaErr) {
      // Ignore if cannot set current_schema
    }
  }

  return conn;
}

/**
 * Execute a SQL query with automatic connection management
 */
async function executeQuery(sql, binds = {}, options = {}) {
  let conn;
  try {
    conn = await getConnection();
    const queryOptions = {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      autoCommit: false,
      ...options
    };
    const result = await conn.execute(sql, binds, queryOptions);
    if (options.autoCommit) {
      await conn.commit();
    }
    return result;
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (closeErr) {
        console.error('[Oracle DB] Error closing connection:', closeErr.message);
      }
    }
  }
}

/**
 * Execute a multi-statement transaction with automatic rollback on error and commit on success
 */
async function executeTransaction(callback) {
  let conn;
  try {
    conn = await getConnection();
    const result = await callback(conn);
    await conn.commit();
    return result;
  } catch (err) {
    if (conn) {
      try {
        await conn.rollback();
      } catch (rollbackErr) {
        console.error('[Oracle DB] Error during transaction rollback:', rollbackErr.message);
      }
    }
    throw err;
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (closeErr) {
        console.error('[Oracle DB] Error closing connection in transaction:', closeErr.message);
      }
    }
  }
}

/**
 * Real connection test using SELECT 1 FROM dual
 */
async function testConnection() {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute('SELECT 1 AS alive FROM dual', [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    const isAlive = result.rows && result.rows.length > 0 && result.rows[0].ALIVE === 1;
    return {
      connected: isAlive,
      mode: currentAuthMode,
      connectString: process.env.DB_CONNECT_STRING || 'localhost:1521/XE',
      schema: process.env.DB_SCHEMA || 'SYSTEM'
    };
  } catch (err) {
    return {
      connected: false,
      error: err.message,
      mode: currentAuthMode
    };
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (e) {
        // ignore
      }
    }
  }
}

async function closeDbPool() {
  if (pool) {
    try {
      await pool.close(10);
      pool = null;
      console.log('[Oracle DB] Connection pool closed.');
    } catch (err) {
      console.error('[Oracle DB] Error closing connection pool:', err.message);
    }
  }
}

module.exports = {
  oracledb,
  initDbPool,
  closeDbPool,
  getConnection,
  executeQuery,
  executeTransaction,
  testConnection
};
