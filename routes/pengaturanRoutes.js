const express = require('express');
const router = express.Router();
const pengaturanController = require('../controllers/pengaturanController');

// Rute untuk mengambil pengaturan
router.get('/', pengaturanController.getPengaturan);

// Rute untuk menyimpan pengaturan
router.post('/', pengaturanController.updatePengaturan);

module.exports = router;
