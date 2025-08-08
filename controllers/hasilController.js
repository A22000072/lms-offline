// File: /controllers/hasilController.js

const db = require('../db/database');

/**
 * 1. Mengambil semua data hasil ujian dari database
 * Digunakan oleh: router.get('/')
 */
const getAllHasil = (req, res) => {
  const query = 'SELECT * FROM hasil ORDER BY waktu_selesai DESC';

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Gagal mengambil data hasil:', err.message);
      return res.status(500).json({ message: 'Gagal mengambil data dari server.' });
    }
    res.status(200).json(rows);
  });
};


/**
 * 2. Menyimpan satu hasil ujian baru ke database
 * Digunakan oleh: router.post('/')
 * (Ini adalah fungsi Anda, hanya diganti namanya dari simpanHasil -> saveHasil)
 */
const saveHasil = (req, res) => {
  const { ujian_id, nama, kelas, jawaban, nilai, waktu_mulai, waktu_selesai } = req.body;

  // Validasi input
  if (!ujian_id || !nama || !kelas || !jawaban || nilai == null || !waktu_mulai || !waktu_selesai) {
    return res.status(400).json({ message: 'Data yang dikirim tidak lengkap.' });
  }

  const query = `
    INSERT INTO hasil (ujian_id, nama, kelas, jawaban, nilai, waktu_mulai, waktu_selesai)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    query,
    [ujian_id, nama, kelas, jawaban, nilai, waktu_mulai, waktu_selesai],
    function (err) {
      if (err) {
        console.error('Gagal menyimpan hasil ke database:', err.message);
        return res.status(500).json({ message: 'Gagal menyimpan hasil ujian.' });
      }
      // Mengirimkan konfirmasi sukses beserta ID data yang baru dibuat
      res.status(201).json({ message: 'Hasil berhasil disimpan.', id: this.lastID });
    }
  );
};

/**
 * 3. Menghapus satu data hasil ujian berdasarkan ID
 * Digunakan oleh: router.delete('/:id')
 */
const deleteHasil = (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM hasil WHERE id = ?';

  db.run(query, id, function (err) {
    if (err) {
      console.error('Gagal menghapus hasil:', err.message);
      return res.status(500).json({ message: 'Gagal menghapus hasil.' });
    }
    // Cek apakah ada baris yang terhapus
    if (this.changes === 0) {
      return res.status(404).json({ message: `Hasil dengan ID ${id} tidak ditemukan.` });
    }
    res.status(200).json({ message: `Hasil dengan ID ${id} berhasil dihapus.` });
  });
};


// Mengekspor semua fungsi agar bisa diimpor dan digunakan di hasilRoutes.js
module.exports = {
  getAllHasil,
  saveHasil,
  deleteHasil
};