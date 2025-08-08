const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, './db/lms.db');
const db = new sqlite3.Database(dbPath);

// Data Dummy
const ujianData = {
  nama_ujian: 'Ujian Harian Matematika',
  deskripsi: 'Ujian untuk materi aljabar dan persamaan linear',
  waktu_mulai: '2025-08-05 08:00:00',
  waktu_selesai: '2025-08-05 09:00:00',
  durasi_menit: 60
};

const soalData = [
  {
    pertanyaan: 'Berapakah hasil dari 2 + 2?',
    pilihan_a: '3',
    pilihan_b: '4',
    pilihan_c: '5',
    pilihan_d: '6',
    pilihan_e: '2',
    jawaban_benar: 'B'
  },
  {
    pertanyaan: 'Hasil dari 3 x 3 adalah?',
    pilihan_a: '6',
    pilihan_b: '8',
    pilihan_c: '9',
    pilihan_d: '12',
    pilihan_e: '15',
    jawaban_benar: 'C'
  },
  {
    pertanyaan: 'Persamaan 2x = 10, maka x = ...?',
    pilihan_a: '3',
    pilihan_b: '4',
    pilihan_c: '5',
    pilihan_d: '6',
    pilihan_e: '7',
    jawaban_benar: 'C'
  }
];

const hasilData = {
  nama: 'Budi Santoso',
  kelas: '10 IPA 2',
  jawaban: '{"1":"B","2":"C","3":"C"}',
  nilai: 100,
  waktu_mulai: '2025-08-05 08:00:00',
  waktu_selesai: '2025-08-05 08:25:00'
};

const monitoringData = [
  {
    nama: 'Budi Santoso',
    kelas: '10 IPA 2',
    waktu: '2025-08-05 08:10:12',
    aktivitas: 'Berpindah tab'
  },
  {
    nama: 'Budi Santoso',
    kelas: '10 IPA 2',
    waktu: '2025-08-05 08:11:30',
    aktivitas: 'Kembali ke halaman ujian'
  }
];

// Insert Dummy Data
db.serialize(() => {
  // Insert ujian
  db.run(`INSERT INTO ujian (nama_ujian, deskripsi, waktu_mulai, waktu_selesai, durasi_menit)
          VALUES (?, ?, ?, ?, ?)`,
    [ujianData.nama_ujian, ujianData.deskripsi, ujianData.waktu_mulai, ujianData.waktu_selesai, ujianData.durasi_menit],
    function (err) {
      if (err) return console.error('❌ Gagal insert ujian:', err.message);
      console.log('✅ Data ujian ditambahkan.');

      const ujianId = this.lastID;

      // Insert soal
      const insertSoal = db.prepare(`INSERT INTO soal
        (ujian_id, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, pilihan_e, jawaban_benar)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);

      soalData.forEach(soal => {
        insertSoal.run(ujianId, soal.pertanyaan, soal.pilihan_a, soal.pilihan_b, soal.pilihan_c, soal.pilihan_d, soal.pilihan_e, soal.jawaban_benar);
      });

      insertSoal.finalize(() => console.log('✅ Data soal ditambahkan.'));

      // Insert hasil
      db.run(`INSERT INTO hasil (ujian_id, nama, kelas, jawaban, nilai, waktu_mulai, waktu_selesai)
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [ujianId, hasilData.nama, hasilData.kelas, hasilData.jawaban, hasilData.nilai, hasilData.waktu_mulai, hasilData.waktu_selesai],
        (err) => {
          if (err) console.error('❌ Gagal insert hasil:', err.message);
          else console.log('✅ Data hasil ditambahkan.');
        });

      // Insert monitoring
      const insertMonitoring = db.prepare(`INSERT INTO monitoring (nama, kelas, waktu, aktivitas) VALUES (?, ?, ?, ?)`);
      monitoringData.forEach(m => {
        insertMonitoring.run(m.nama, m.kelas, m.waktu, m.aktivitas);
      });

      insertMonitoring.finalize(() => console.log('✅ Data monitoring ditambahkan.'));
    });
});
