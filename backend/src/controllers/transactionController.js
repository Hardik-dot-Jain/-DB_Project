const transactionService = require('../services/transactionService');

async function getAll(req, res, next) {
  try {
    const { sortBy, sortOrder } = req.query;
    let agentId = req.query.agentId;
    let clientId = req.query.clientId;

    if (req.user && req.user.role === 'agent' && req.user.referenceId) {
      agentId = req.user.referenceId;
    } else if (req.user && req.user.role === 'client' && req.user.referenceId) {
      clientId = req.user.referenceId;
    }

    const transactions = await transactionService.getAllTransactions({ sortBy, sortOrder, agentId, clientId });
    res.json({ success: true, count: transactions.length, data: transactions });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const transaction = await transactionService.getTransactionById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }
    res.json({ success: true, data: transaction });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    if (!req.body.property_id) {
      return res.status(400).json({ success: false, error: 'Property ID is required' });
    }
    if (!req.body.offer_id) {
      return res.status(400).json({ success: false, error: 'Offer ID is required' });
    }
    if (!req.body.sale_price || Number(req.body.sale_price) <= 0) {
      return res.status(400).json({ success: false, error: 'Sale price must be greater than 0' });
    }
    const created = await transactionService.createTransaction(req.body);
    res.status(201).json({
      success: true,
      data: created,
      message: 'Transaction finalized successfully. Property marked Sold and Offer marked Accepted.'
    });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    if (!req.body.sale_price || Number(req.body.sale_price) <= 0) {
      return res.status(400).json({ success: false, error: 'Sale price must be greater than 0' });
    }
    const updated = await transactionService.updateTransaction(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }
    res.json({ success: true, data: updated, message: 'Transaction updated successfully' });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await transactionService.deleteTransaction(req.params.id);
    res.json({ success: true, message: `Transaction ${req.params.id} deleted successfully` });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};
