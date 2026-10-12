const offerService = require('../services/offerService');

async function getAll(req, res, next) {
  try {
    const { status, propertyId, sortBy, sortOrder } = req.query;
    let agentId = req.query.agentId;
    let clientId = req.query.clientId;

    if (req.user && req.user.role === 'agent' && req.user.referenceId) {
      agentId = req.user.referenceId;
    } else if (req.user && req.user.role === 'client' && req.user.referenceId) {
      clientId = req.user.referenceId;
    }

    const offers = await offerService.getAllOffers({ status, propertyId, agentId, clientId, sortBy, sortOrder });
    res.json({ success: true, count: offers.length, data: offers });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const offer = await offerService.getOfferById(req.params.id);
    if (!offer) {
      return res.status(404).json({ success: false, error: 'Offer not found' });
    }
    res.json({ success: true, data: offer });
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
    if (!req.body.offer_amount || Number(req.body.offer_amount) <= 0) {
      return res.status(400).json({ success: false, error: 'Offer amount must be greater than 0' });
    }
    const created = await offerService.createOffer(req.body);
    res.status(201).json({ success: true, data: created, message: 'Offer submitted successfully' });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    if (!req.body.offer_amount || Number(req.body.offer_amount) <= 0) {
      return res.status(400).json({ success: false, error: 'Offer amount must be greater than 0' });
    }
    const updated = await offerService.updateOffer(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Offer not found' });
    }
    res.json({ success: true, data: updated, message: 'Offer updated successfully' });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await offerService.deleteOffer(req.params.id);
    res.json({ success: true, message: `Offer ${req.params.id} deleted successfully` });
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
