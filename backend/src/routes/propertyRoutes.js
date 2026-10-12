const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');

// Explicit SQL demo routes
router.get('/distinct-statuses', propertyController.getDistinctStatuses);
router.get('/distinct-categories', propertyController.getDistinctCategories);
router.get('/average-price', propertyController.getAveragePrice);

// Standard CRUD routes
router.get('/', propertyController.getAll);
router.get('/:id', propertyController.getById);
router.post('/', propertyController.create);
router.put('/:id', propertyController.update);
router.delete('/:id', propertyController.remove);

module.exports = router;
