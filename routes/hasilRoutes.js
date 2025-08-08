const express = require('express');
const router = express.Router();
const hasilController = require('../controllers/hasilController');

router.get('/', hasilController.getAllHasil);
router.post('/', hasilController.saveHasil);
router.delete('/:id', hasilController.deleteHasil); // <- ini yang error kalau fungsi tidak ada

module.exports = router;
