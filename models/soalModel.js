const db = require('../db/database');

const SoalModel = {
  getAll(callback) {
    const sql = 'SELECT * FROM soal';
    db.all(sql, [], callback);
  },

  getById(id, callback) {
    const sql = 'SELECT * FROM soal WHERE id = ?';
    db.get(sql, [id], callback);
  },

  create(data, callback) {
    const { pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, pilihan_e, jawaban_benar } = data;
    const sql = `INSERT INTO soal (pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, pilihan_e, jawaban_benar) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const params = [pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, pilihan_e, jawaban_benar];
    db.run(sql, params, callback);
  },

  update(id, data, callback) {
  const { pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, pilihan_e, jawaban_benar } = data;
  const sql = `UPDATE soal SET pertanyaan = ?, pilihan_a = ?, pilihan_b = ?, pilihan_c = ?, pilihan_d = ?, pilihan_e = ?, jawaban_benar = ? WHERE id = ?`;
  const params = [pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, pilihan_e, jawaban_benar, id];
  db.run(sql, params, callback);
}
,

  delete(id, callback) {
    const sql = `DELETE FROM soal WHERE id = ?`;
    db.run(sql, [id], callback);
  },


getById(id, callback) {
  db.get('SELECT * FROM soal WHERE id = ?', [id], (err, row) => {
    callback(err, row);
  });
},


deleteAll(callback){
  const sql = 'DELETE FROM soal';
  db.run(sql, [], function(err) {
    if (err) return callback(err);

    db.run("DELETE FROM sqlite_sequence WHERE name='soal'", [], (resetErr) => {
      if (resetErr) return callback(resetErr);
      callback(null); // HANYA callback jika semua berhasil
    });
  });
}
};

module.exports = SoalModel;
