const reportsService = require('../services/reportsService');

async function getAllReports(req, res, next) {
  try {
    const threshold = req.query.threshold ? Number(req.query.threshold) : 1000000;
    const data = await reportsService.getAllReports(threshold);
    res.json({
      success: true,
      data
    });
  } catch (err) {
    next(err);
  }
}

async function getSoldSummary(req, res, next) {
  try {
    const data = await reportsService.getSoldPropertiesSummary();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function getTopAgents(req, res, next) {
  try {
    const threshold = req.query.threshold ? Number(req.query.threshold) : 1000000;
    const data = await reportsService.getTopPerformingAgents(threshold);
    res.json({ success: true, data, threshold });
  } catch (err) {
    next(err);
  }
}

async function getPriceStats(req, res, next) {
  try {
    const data = await reportsService.getPriceStatistics();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function getCategoryDistribution(req, res, next) {
  try {
    const data = await reportsService.getCategoryDistribution();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function getAgentPerformance(req, res, next) {
  try {
    const data = await reportsService.getAgentPerformance();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function getFullTransactions(req, res, next) {
  try {
    const data = await reportsService.getFullTransactionDetails();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function getOfferRates(req, res, next) {
  try {
    const data = await reportsService.getOfferSuccessRates();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllReports,
  getSoldSummary,
  getTopAgents,
  getPriceStats,
  getCategoryDistribution,
  getAgentPerformance,
  getFullTransactions,
  getOfferRates
};

