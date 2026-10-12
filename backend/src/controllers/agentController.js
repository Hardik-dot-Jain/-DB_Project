const agentService = require('../services/agentService');

async function getAll(req, res, next) {
  try {
    const { sortBy, sortOrder } = req.query;
    const agents = await agentService.getAllAgents({ sortBy, sortOrder });
    res.json({ success: true, count: agents.length, data: agents });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const agent = await agentService.getAgentById(req.params.id);
    if (!agent) {
      return res.status(404).json({ success: false, error: 'Agent not found' });
    }
    res.json({ success: true, data: agent });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    if (!req.body.agent_name || req.body.agent_name.trim() === '') {
      return res.status(400).json({ success: false, error: 'Agent name is required' });
    }
    const created = await agentService.createAgent(req.body);
    res.status(201).json({ success: true, data: created, message: 'Agent created successfully' });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    if (!req.body.agent_name || req.body.agent_name.trim() === '') {
      return res.status(400).json({ success: false, error: 'Agent name is required' });
    }
    const updated = await agentService.updateAgent(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Agent not found' });
    }
    res.json({ success: true, data: updated, message: 'Agent updated successfully' });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await agentService.deleteAgent(req.params.id);
    res.json({ success: true, message: `Agent ${req.params.id} deleted successfully` });
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
