const clientService = require('../services/clientService');

async function getDistinctTypes(req, res, next) {
  try {
    const types = await clientService.getDistinctClientTypes();
    res.json({ success: true, count: types.length, data: types });
  } catch (err) {
    next(err);
  }
}

async function getAll(req, res, next) {
  try {
    const { search, clientType, sortBy, sortOrder } = req.query;
    const clients = await clientService.getAllClients({ search, clientType, sortBy, sortOrder });
    res.json({ success: true, count: clients.length, data: clients });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const client = await clientService.getClientById(req.params.id);
    if (!client) {
      return res.status(404).json({ success: false, error: 'Client not found' });
    }
    res.json({ success: true, data: client });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    if (!req.body.client_name || req.body.client_name.trim() === '') {
      return res.status(400).json({ success: false, error: 'Client name is required' });
    }
    const created = await clientService.createClient(req.body);
    res.status(201).json({ success: true, data: created, message: 'Client created successfully' });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    if (!req.body.client_name || req.body.client_name.trim() === '') {
      return res.status(400).json({ success: false, error: 'Client name is required' });
    }
    const updated = await clientService.updateClient(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Client not found' });
    }
    res.json({ success: true, data: updated, message: 'Client updated successfully' });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await clientService.deleteClient(req.params.id);
    res.json({ success: true, message: `Client ${req.params.id} deleted successfully` });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDistinctTypes,
  getAll,
  getById,
  create,
  update,
  remove
};
