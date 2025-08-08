const PengaturanModel = require('../models/pengaturanModel');

exports.getPengaturan = (req, res) => {
  PengaturanModel.get((err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(row);
  });
};

exports.updatePengaturan = (req, res) => {
  // Konversi nilai checkbox 'true'/'false' menjadi 1/0 untuk database
  const data = {
    tampilkan_nilai: req.body.tampilkan_nilai ? 1 : 0,
    tampilkan_review: req.body.tampilkan_review ? 1 : 0,
    durasi: parseInt(req.body.durasi, 10) || 15
  };

  PengaturanModel.update(data, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, message: 'Pengaturan berhasil disimpan.' });
  });
};
