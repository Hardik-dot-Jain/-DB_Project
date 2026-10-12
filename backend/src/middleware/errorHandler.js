/**
 * Centralized Error Handling Middleware for EstateFlow
 * Handles Oracle DB errors, validation errors, and operational exceptions safely.
 */

function errorHandler(err, req, res, next) {
  console.error(`[Error] ${req.method} ${req.url}:`, err.message || err);

  // Oracle Specific Error Handling
  if (err.message) {
    // Unique constraint violation (e.g. PK already exists, phone number unique)
    if (err.message.includes('ORA-00001')) {
      return res.status(409).json({
        success: false,
        error: 'Conflict: A record with this primary key or unique field already exists.',
        details: err.message
      });
    }

    // Foreign Key Child Record Exists (cannot delete parent)
    if (err.message.includes('ORA-02292')) {
      return res.status(409).json({
        success: false,
        error: 'Cannot delete this record because dependent records exist in other tables. Remove related records first.',
        details: err.message
      });
    }

    // Foreign Key Parent Record Not Found (cannot insert invalid FK)
    if (err.message.includes('ORA-02291')) {
      return res.status(400).json({
        success: false,
        error: 'Referenced parent record does not exist. Please select a valid foreign key value.',
        details: err.message
      });
    }

    // Check constraint violation (e.g. price <= 0)
    if (err.message.includes('ORA-02290')) {
      return res.status(400).json({
        success: false,
        error: 'Validation error: The provided values violate a database check constraint (e.g., amount must be greater than zero).',
        details: err.message
      });
    }

    // Value too large for column
    if (err.message.includes('ORA-12899') || err.message.includes('ORA-01438')) {
      return res.status(400).json({
        success: false,
        error: 'Value exceeds the maximum length or numeric precision permitted by the database schema.',
        details: err.message
      });
    }
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
}

module.exports = errorHandler;
