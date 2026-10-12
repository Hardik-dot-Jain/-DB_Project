const showingService = require('../services/showingService');

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

    const showings = await showingService.getAllShowings({ sortBy, sortOrder, agentId, clientId });
    res.json({ success: true, count: showings.length, data: showings });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const showing = await showingService.getShowingById(req.params.id);
    if (!showing) {
      return res.status(404).json({ success: false, error: 'Showing not found' });
    }
    res.json({ success: true, data: showing });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    if (!req.body.property_id) {
      return res.status(400).json({ success: false, error: 'Property ID is required' });
    }
    if (!req.body.client_id) {
      return res.status(400).json({ success: false, error: 'Client ID is required' });
    }
    if (!req.body.showing_date) {
      return res.status(400).json({ success: false, error: 'Showing date is required' });
    }
    const created = await showingService.createShowing(req.body);
    res.status(201).json({ success: true, data: created, message: 'Showing scheduled successfully' });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    if (!req.body.property_id || !req.body.client_id || !req.body.showing_date) {
      return res.status(400).json({ success: false, error: 'Property ID, Client ID, and Showing date are required' });
    }
    const updated = await showingService.updateShowing(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Showing not found' });
    }
    res.json({ success: true, data: updated, message: 'Showing updated successfully' });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await showingService.deleteShowing(req.params.id);
    res.json({ success: true, message: `Showing ${req.params.id} deleted successfully` });
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
