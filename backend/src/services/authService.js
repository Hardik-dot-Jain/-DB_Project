const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { executeQuery } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'estateflow_secret_key_oracle_project_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

async function login(username, password) {
  if (!username || !password) {
    const error = new Error('Username and password are required');
    error.statusCode = 400;
    throw error;
  }

  const cleanUsername = String(username).trim();
  const sql = `
    SELECT user_id, username, password_hash, role, reference_id
    FROM APP_USERS
    WHERE UPPER(username) = UPPER(:username)
  `;

  const result = await executeQuery(sql, { username: cleanUsername });
  if (result.rows.length === 0) {
    const error = new Error('Invalid username or password');
    error.statusCode = 401;
    throw error;
  }

  const dbUser = result.rows[0];
  const isValid = bcrypt.compareSync(password, dbUser.PASSWORD_HASH);
  if (!isValid) {
    const error = new Error('Invalid username or password');
    error.statusCode = 401;
    throw error;
  }

  const userRole = String(dbUser.ROLE || 'admin').toLowerCase();
  const refId = dbUser.REFERENCE_ID ? Number(dbUser.REFERENCE_ID) : null;

  let linkedName = null;
  let linkedDetails = null;

  if (userRole === 'agent' && refId) {
    try {
      const aRes = await executeQuery(
        'SELECT agent_name, office_name FROM agent WHERE agent_id = :id',
        { id: refId }
      );
      if (aRes.rows.length > 0) {
        linkedName = aRes.rows[0].AGENT_NAME;
        linkedDetails = aRes.rows[0].OFFICE_NAME;
      }
    } catch {
      // ignore
    }
  } else if (userRole === 'client' && refId) {
    try {
      const cRes = await executeQuery(
        'SELECT client_name, client_type, phone FROM client WHERE client_id = :id',
        { id: refId }
      );
      if (cRes.rows.length > 0) {
        linkedName = cRes.rows[0].CLIENT_NAME;
        linkedDetails = cRes.rows[0].CLIENT_TYPE;
      }
    } catch {
      // ignore
    }
  }

  const payload = {
    userId: dbUser.USER_ID,
    username: dbUser.USERNAME,
    role: userRole,
    referenceId: refId,
    reference_id: refId
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  return {
    token,
    user: {
      userId: dbUser.USER_ID,
      username: dbUser.USERNAME,
      role: userRole,
      referenceId: refId,
      reference_id: refId,
      linkedName,
      linkedDetails
    }
  };
}

async function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    const error = new Error('Invalid or expired authentication token');
    error.statusCode = 401;
    throw error;
  }
}

module.exports = {
  login,
  verifyToken
};
