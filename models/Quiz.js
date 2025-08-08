const db = require('../db/database');

const Quiz = {
  getAll: (callback) => {
    const sql = 'SELECT * FROM soal ORDER BY id ASC';
    db.all(sql, [], callback);
  },

  getSoalForUjian: (callback) => {
    const sql = 'SELECT id, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d FROM soal ORDER BY id ASC';
    db.all(sql, [], callback);
  },

  insert: (data, callback) => {
    const { pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, kunci_jawaban } = data;
    const sql = `
      INSERT INTO soal (pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, jawaban_benar)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const params = [pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, kunci_jawaban];
    db.run(sql, params, function(err) {
      callback?.(err, { id: this?.lastID });
    });
  },

  update: (id, data, callback) => {
    const { pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, kunci_jawaban } = data;
    const sql = `
      UPDATE soal
      SET pertanyaan = ?, pilihan_a = ?, pilihan_b = ?, pilihan_c = ?, pilihan_d = ?, jawaban_benar = ?
      WHERE id = ?
    `;
    const params = [pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, kunci_jawaban, id];
    db.run(sql, params, function(err) {
      callback?.(err);
    });
  },

  getById: (id, callback) => {
    const sql = 'SELECT * FROM soal WHERE id = ?';
    db.get(sql, [id], callback);
  },

  deleteById: (id, callback) => {
    const sql = 'DELETE FROM soal WHERE id = ?';
    db.run(sql, [id], callback);
  }
};
exports.update = (id, data, callback) => {
  const sql = `
    UPDATE soal SET 
      pertanyaan = ?, 
      pilihan_a = ?, 
      pilihan_b = ?, 
      pilihan_c = ?, 
      pilihan_d = ?, 
      pilihan_e = ?, 
      jawaban_benar = ?
    WHERE id = ?
  `;
  const params = [
    data.pertanyaan,
    data.pilihan_a,
    data.pilihan_b,
    data.pilihan_c,
    data.pilihan_d,
    data.pilihan_e,
    data.jawaban_benar,
    id
  ];
  db.run(sql, params, callback);
};
module.exports = Quiz;
