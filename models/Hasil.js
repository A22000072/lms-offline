const db = require('../db/database');

const Hasil = {
  // Ambil semua hasil ujian
  getAll: (callback) => {
    const sql = 'SELECT * FROM hasil ORDER BY waktu_selesai DESC';
    db.all(sql, [], callback);
  },

  // Tambah hasil baru
  insert: (data, callback) => {
    const { nama, nilai, durasi_pengerjaan, waktu_selesai } = data;
    const sql = `
      INSERT INTO hasil (nama, nilai, durasi_pengerjaan, waktu_selesai)
      VALUES (?, ?, ?, ?)
    `;
    const params = [nama, nilai, durasi_pengerjaan, waktu_selesai];
    db.run(sql, params, callback);
  },

  // Hapus hasil berdasarkan ID
  deleteById: (id, callback) => {
    const sql = 'DELETE FROM hasil WHERE id = ?';
    db.run(sql, [id], callback);
  },

  // Ambil hasil berdasarkan ID (opsional)
  getById: (id, callback) => {
    const sql = 'SELECT * FROM hasil WHERE id = ?';
    db.get(sql, [id], callback);
  }
};

module.exports = Hasil;
