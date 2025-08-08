const db = require('../db/database'); // Pastikan path ini benar
const SoalModel = require('../models/soalModel'); // Asumsi Anda menggunakan model

// Fungsi untuk dasbor guru (tidak diubah)
exports.getSoal = (req, res) => {
  SoalModel.getAll((err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

exports.createSoal = (req, res) => {
  SoalModel.create(req.body, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
};

exports.updateSoal = (req, res) => {
  SoalModel.update(req.params.id, req.body, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
};

exports.deleteSoal = (req, res) => {
  SoalModel.delete(req.params.id, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
};

exports.getSoalById = (req, res) => {
  SoalModel.getById(req.params.id, (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Soal tidak ditemukan' });
    res.json(row);
  });
};

// --- FUNGSI YANG DIPERBAIKI ---
// Mengambil data satu soal untuk dikerjakan siswa
exports.getSoalByIdUntukSiswa = (req, res) => {
  // PERBAIKAN: Ubah ID dari parameter URL menjadi angka (Integer)
  const id = parseInt(req.params.id, 10);

  // Periksa apakah ID valid setelah diubah menjadi angka
  if (isNaN(id)) {
      return res.status(400).json({ "error": "ID Soal tidak valid." });
  }
  
  // console.log(`[DEBUG] Mencari soal dengan ID (sebagai angka): ${id}`);

  const sql = "SELECT id, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, pilihan_e FROM soal WHERE id = ?";
  
  db.get(sql, [id], (err, row) => {
    if (err) {
      console.error(`[DEBUG] Error database saat mencari ID ${id}:`, err.message);
      return res.status(500).json({ "error": "Terjadi kesalahan pada server." });
    }

    // console.log(`[DEBUG] Hasil query untuk ID ${id}:`, row);

    if (!row) {
      // Jika tidak ada baris yang ditemukan, kirim 404
      return res.status(404).json({ "error": "Soal tidak ditemukan." });
    }

    // Jika ditemukan, kirim datanya
    res.json(row);
  });
};

exports.deleteAllSoal = (req, res) => {
  console.log("Request diterima: DELETE /api/soal/all");

  SoalModel.deleteAll((err) => {
    if (err) {
      console.error("Error saat menghapus semua soal:", err.message);
      return res.status(500).json({ error: "Gagal menghapus semua soal dari database." });
    }

    console.log("Berhasil menghapus semua soal.");
    return res.status(200).json({ success: true, message: 'Semua soal berhasil dihapus.' });
  });
};