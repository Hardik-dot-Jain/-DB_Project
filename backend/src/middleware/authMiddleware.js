const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'estateflow_secret_key_oracle_project_2026';

function requireAuth(req, res, next) {
  // Allow OPTIONS preflight requests
  if (req.method === 'OPTIONS') {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Access denied: Authentication token required'
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      ...decoded,
      role: String(decoded.role || 'admin').toLowerCase(),
      referenceId: decoded.referenceId || decoded.reference_id || null,
      reference_id: decoded.referenceId || decoded.reference_id || null
    };
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Access denied: Token is invalid or has expired'
    });
  }
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    const userRole = String(req.user.role || '').toLowerCase();
    const normalizedAllowed = allowedRoles.map(r => String(r).toLowerCase());
    if (!normalizedAllowed.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: `Access forbidden: Requires one of [${allowedRoles.join(', ')}] role(s)`
      });
    }
    next();
  };
}

module.exports = {
  requireAuth,
  requireRole
};
