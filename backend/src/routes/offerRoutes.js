const express = require('express');
const router = express.Router();
const offerController = require('../controllers/offerController');

router.get('/', offerController.getAll);
router.get('/:id', offerController.getById);
router.post('/', offerController.create);
router.put('/:id', offerController.update);
router.delete('/:id', offerController.remove);

module.exports = router;
