const express = require('express');
const router = express.Router();
const monitoringController = require('../controllers/monitoringController');

router.get('/', monitoringController.getAllMonitoring);
router.post('/', monitoringController.insertOrUpdateMonitoring);
router.delete('/', monitoringController.resetMonitoring);

module.exports = router;