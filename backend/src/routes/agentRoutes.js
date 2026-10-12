const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentController');

router.get('/', agentController.getAll);
router.get('/:id', agentController.getById);
router.post('/', agentController.create);
router.put('/:id', agentController.update);
router.delete('/:id', agentController.remove);

module.exports = router;
