const express = require('express');
const router = express.Router();
const soalController = require('../controllers/soalController');

// Rute utama untuk siswa: mengambil semua soal sekaligus
// Ini cocok dengan `fetch("/api/soal")` di quiz.js
router.get('/', soalController.getSoal);

// Rute-rute lain untuk dasbor guru (opsional, tapi baik untuk ada)
router.post('/', soalController.createSoal);
router.put('/:id', soalController.updateSoal);
router.delete('/:id', soalController.deleteSoal);
router.get('/:id', soalController.getSoalById); // Untuk fitur edit di dasbor
router.get('/by-id/:id', soalController.getSoalByIdUntukSiswa);
router.delete('/all', soalController.deleteAllSoal);

module.exports = router;
