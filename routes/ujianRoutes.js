const express = require('express');
const router = express.Router();
const ujianController = require('../controllers/ujianController');


// router.get('/soal', ujianController.getSoalUjian);
// router.post('/submit', ujianController.submitJawaban);
// router.get('/durasi', ujianController.getDurasiUjian);
// router.post('/durasi', ujianController.setDurasiUjian);
router.get('/start', ujianController.startUjian);
router.post('/submit', ujianController.submitUjian);
router.post('/validate-token', ujianController.validateToken);


module.exports = router