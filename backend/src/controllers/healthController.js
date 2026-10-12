const { testConnection } = require('../config/db');

async function getHealth(req, res) {
  res.json({
    status: 'ok',
    service: 'EstateFlow Real Estate Sales Management API',
    timestamp: new Date().toISOString()
  });
}

async function getDbHealth(req, res) {
  try {
    const connTest = await testConnection();
    if (connTest.connected) {
      return res.json({
        status: 'ok',
        database: 'Oracle Database XE',
        connected: true,
        authMode: connTest.mode,
        schema: connTest.schema,
        connectString: connTest.connectString
      });
    } else {
      return res.status(503).json({
        status: 'error',
        database: 'Oracle Database',
        connected: false,
        error: connTest.error,
        message: 'Oracle database is not reachable with current credentials. Please check backend/.env.'
      });
    }
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      connected: false,
      error: err.message
    });
  }
}

module.exports = {
  getHealth,
  getDbHealth
};
