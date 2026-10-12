const express = require('express');
const router = express.Router();
const showingController = require('../controllers/showingController');

router.get('/', showingController.getAll);
router.get('/:id', showingController.getById);
router.post('/', showingController.create);
router.put('/:id', showingController.update);
router.delete('/:id', showingController.remove);

module.exports = router;
