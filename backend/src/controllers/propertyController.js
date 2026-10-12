const propertyService = require('../services/propertyService');

async function getDistinctStatuses(req, res, next) {
  try {
    const statuses = await propertyService.getDistinctStatuses();
    res.json({ success: true, count: statuses.length, data: statuses });
  } catch (err) {
    next(err);
  }
}

async function getDistinctCategories(req, res, next) {
  try {
    const categories = await propertyService.getDistinctCategories();
    res.json({ success: true, count: categories.length, data: categories });
  } catch (err) {
    next(err);
  }
}

async function getAveragePrice(req, res, next) {
  try {
    const avgPrice = await propertyService.getAvgListingPrice();
    res.json({ success: true, data: { avg_price: avgPrice } });
  } catch (err) {
    next(err);
  }
}

async function getAll(req, res, next) {
  try {
    const { search, status, categoryId, agentId, aboveAverage, sortBy, sortOrder } = req.query;

    // RBAC: If logged in as agent, isolate to their assigned properties
    let effectiveAgentId = agentId;
    if (req.user && req.user.role === 'agent' && req.user.referenceId) {
      effectiveAgentId = req.user.referenceId;
    }

    const properties = await propertyService.getAllProperties({
      search,
      status,
      categoryId,
      agentId: effectiveAgentId,
      aboveAverage,
      sortBy,
      sortOrder
    });
    res.json({ success: true, count: properties.length, data: properties });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const property = await propertyService.getPropertyById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, error: 'Property not found' });
    }
    res.json({ success: true, data: property });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    if (!req.body.address || req.body.address.trim() === '') {
      return res.status(400).json({ success: false, error: 'Address is required' });
    }
    if (!req.body.listing_price || Number(req.body.listing_price) <= 0) {
      return res.status(400).json({ success: false, error: 'Listing price must be greater than 0' });
    }
    const created = await propertyService.createProperty(req.body);
    res.status(201).json({ success: true, data: created, message: 'Property created successfully' });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    if (!req.body.address || req.body.address.trim() === '') {
      return res.status(400).json({ success: false, error: 'Address is required' });
    }
    if (!req.body.listing_price || Number(req.body.listing_price) <= 0) {
      return res.status(400).json({ success: false, error: 'Listing price must be greater than 0' });
    }
    const updated = await propertyService.updateProperty(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Property not found' });
    }
    res.json({ success: true, data: updated, message: 'Property updated successfully' });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await propertyService.deleteProperty(req.params.id);
    res.json({ success: true, message: `Property ${req.params.id} deleted successfully (cascaded related showings, offers, transactions)` });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDistinctStatuses,
  getDistinctCategories,
  getAveragePrice,
  getAll,
  getById,
  create,
  update,
  remove
};
