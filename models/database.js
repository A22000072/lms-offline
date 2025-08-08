const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Lokasi file database
const dbPath = path.resolve(__dirname, '../db/lms.db');

// Inisialisasi koneksi database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) return console.error('❌ Gagal membuka database:', err.message);
  console.log('✅ Terkoneksi ke database SQLite.');
});

db.serialize(() => {
  // Tabel Ujian
  db.run(`
    CREATE TABLE IF NOT EXISTS ujian (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nama_ujian TEXT NOT NULL,
      deskripsi TEXT,
      waktu_mulai TEXT NOT NULL,
      waktu_selesai TEXT NOT NULL,
      durasi_menit INTEGER NOT NULL
    )
  `, (err) => {
    if (err) console.error('❌ Gagal membuat tabel ujian:', err.message);
    else console.log('✅ Tabel "ujian" siap digunakan.');
  });

  // Tabel Soal
  db.run(`
    CREATE TABLE IF NOT EXISTS soal (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ujian_id INTEGER,
      pertanyaan TEXT NOT NULL,
      pilihan_a TEXT NOT NULL,
      pilihan_b TEXT NOT NULL,
      pilihan_c TEXT NOT NULL,
      pilihan_d TEXT NOT NULL,
      pilihan_e TEXT NOT NULL,
      jawaban_benar TEXT NOT NULL
    )
  `, (err) => {
    if (err) console.error('❌ Gagal membuat tabel soal:', err.message);
    else console.log('✅ Tabel "soal" siap digunakan.');
  });

  // Tabel Hasil Ujian
  db.run(`
    CREATE TABLE IF NOT EXISTS hasil (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ujian_id INTEGER NOT NULL,
      nama TEXT NOT NULL,
      kelas TEXT NOT NULL,
      jawaban TEXT NOT NULL,
      nilai INTEGER NOT NULL,
      waktu_mulai TEXT NOT NULL,
      waktu_selesai TEXT NOT NULL
    )
  `, (err) => {
    if (err) console.error('❌ Gagal membuat tabel hasil:', err.message);
    else console.log('✅ Tabel "hasil" siap digunakan.');
  });

  // Tabel Monitoring
  db.run(`
    CREATE TABLE IF NOT EXISTS monitoring (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nama TEXT,
      kelas TEXT,
      waktu TEXT,
      aktivitas TEXT
    )
  `, (err) => {
    if (err) console.error('❌ Gagal membuat tabel monitoring:', err.message);
    else console.log('✅ Tabel "monitoring" siap digunakan.');
  });
});

module.exports = db;
