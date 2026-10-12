const dashboardService = require('../services/dashboardService');

async function getDashboard(req, res, next) {
  try {
    const role = String(req.user?.role || 'admin').toLowerCase();
    const refId = req.user?.referenceId;

    let data;
    if (role === 'agent' && refId) {
      data = await dashboardService.getAgentDashboardData(refId);
    } else if (role === 'client' && refId) {
      data = await dashboardService.getClientDashboardData(refId);
    } else {
      data = await dashboardService.getDashboardData();
    }

    res.json({
      success: true,
      role,
      referenceId: refId,
      data
    });
  } catch (err) {
    next(err);
  }
}

async function getAgentDashboard(req, res, next) {
  try {
    const agentId = req.user?.referenceId || req.query.agentId || 9001;
    const data = await dashboardService.getAgentDashboardData(agentId);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function getClientDashboard(req, res, next) {
  try {
    const clientId = req.user?.referenceId || req.query.clientId || 2001;
    const data = await dashboardService.getClientDashboardData(clientId);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function getAdminDashboard(req, res, next) {
  try {
    const data = await dashboardService.getDashboardData();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDashboard,
  getAgentDashboard,
  getClientDashboard,
  getAdminDashboard
};
