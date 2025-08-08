const db = require('../db/database');

const PengaturanModel = {
  // Mengambil pengaturan saat ini (hanya ada 1 baris)
  get(callback) {
    const sql = 'SELECT * FROM pengaturan WHERE id = 1';
    db.get(sql, [], (err, row) => {
      // Jika tidak ada baris, kembalikan pengaturan default
      if (!err && !row) {
        return callback(null, { tampilkan_nilai: true, tampilkan_review: true, durasi: 15 });
      }
      callback(err, row);
    });
  },

  // Menyimpan atau memperbarui pengaturan
  update(data, callback) {
    const { tampilkan_nilai, tampilkan_review, durasi } = data;
    const sql = `
      UPDATE pengaturan 
      SET tampilkan_nilai = ?, tampilkan_review = ?, durasi = ? 
      WHERE id = 1
    `;
    db.run(sql, [tampilkan_nilai, tampilkan_review, durasi], callback);
  }
};

module.exports = PengaturanModel;
