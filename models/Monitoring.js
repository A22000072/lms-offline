const db = require('../db/database');

const Monitoring = {
  // Ambil semua data monitoring
  getAll: (callback) => {
    const sql = 'SELECT * FROM monitoring ORDER BY updated_at DESC';
    db.all(sql, [], callback);
  },

  // Simpan atau perbarui data monitoring siswa (upsert by nama)
  upsert: (data, callback) => {
    const { nama, status_tab, updated_at } = data;
    const sql = `
      INSERT INTO monitoring (nama, status_tab, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(nama) DO UPDATE SET
        status_tab = excluded.status_tab,
        updated_at = excluded.updated_at
    `;
    const params = [nama, status_tab, updated_at];
    db.run(sql, params, callback);
  },

  // Hapus semua data monitoring (opsional)
  clearAll: (callback) => {
    const sql = 'DELETE FROM monitoring';
    db.run(sql, [], callback);
  }
};

module.exports = Monitoring;
