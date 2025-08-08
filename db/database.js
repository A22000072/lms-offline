const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.resolve(__dirname, 'lms.db'), (err) => {
  if (err) {
    console.error('Gagal koneksi ke database:', err.message);
  } else {
    console.log('Terhubung ke database SQLite');
  }
});

module.exports = db;
