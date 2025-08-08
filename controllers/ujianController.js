const db = require('../db/database'); // Sesuaikan path ke file database Anda

/**
 * Fungsi untuk mengacak urutan elemen dalam sebuah array.
 */
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

/**
 * Controller untuk memulai ujian.
 * PERBAIKAN: Sekarang membaca durasi dari tabel pengaturan.
 */
const startUjian = (req, res) => {
  // 1. Ambil pengaturan durasi dari database terlebih dahulu
  const pengaturanSql = 'SELECT durasi FROM pengaturan WHERE id = 1';
  db.get(pengaturanSql, [], (err, pengaturan) => {
    if (err) {
      console.error("Error mengambil pengaturan durasi:", err.message);
      return res.status(500).json({ error: "Gagal memuat pengaturan ujian." });
    }

    // Gunakan durasi dari DB, atau 15 menit jika tidak ada
    const durasiMenit = pengaturan ? pengaturan.durasi : 15;
    const durasiDetik = durasiMenit * 60;

    // 2. Lanjutkan untuk mengambil dan mengacak ID soal
    const soalSql = "SELECT id FROM soal";
    db.all(soalSql, [], (soalErr, rows) => {
      if (soalErr) {
        console.error("Error mengambil ID soal:", soalErr.message);
        return res.status(500).json({ error: "Gagal memuat data ujian." });
      }
      
      const ids = rows.map(row => row.id);
      const shuffledIds = shuffleArray(ids);
      
      // 3. Kirim semua data yang dibutuhkan ke frontend
      res.json({
        shuffledIds: shuffledIds,
        totalSoal: ids.length,
        durasi: durasiDetik // Mengirim durasi yang benar (dalam detik)
      });
    });
  });
};

/**
 * Controller untuk menerima jawaban dan menilai.
 * PERBAIKAN: Sekarang memeriksa pengaturan sebelum mengirim nilai & review.
 */
const submitUjian = (req, res) => {
    const { nama, kelas, jawabanSiswa, waktuMulai } = req.body;

    // 1. Ambil pengaturan dari database
    const pengaturanSql = 'SELECT tampilkan_nilai, tampilkan_review FROM pengaturan WHERE id = 1';
    db.get(pengaturanSql, [], (pengaturanErr, pengaturan) => {
        if (pengaturanErr) {
            return res.status(500).json({ "error": "Gagal memuat pengaturan hasil." });
        }
        
        const { tampilkan_nilai, tampilkan_review } = pengaturan || { tampilkan_nilai: true, tampilkan_review: true };

        // 2. Lanjutkan untuk mengambil semua soal dan menilai
        const soalSql = "SELECT id, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, pilihan_e, jawaban_benar FROM soal ORDER BY id ASC";
        db.all(soalSql, [], (err, semuaSoal) => {
            if (err) {
                return res.status(500).json({ "error": "Gagal memproses hasil ujian." });
            }
            let skor = 0;
            semuaSoal.forEach(soal => {
                if (soal.jawaban_benar.toUpperCase() === jawabanSiswa[soal.id]) {
                    skor++;
                }
            });
            const nilai = semuaSoal.length > 0 ? Math.round((skor / semuaSoal.length) * 100) : 0;

            // Simpan hasil ke database (logika ini tidak berubah)
            const insertSql = `INSERT INTO hasil (ujian_id, nama, kelas, jawaban, nilai, waktu_mulai, waktu_selesai) VALUES (?, ?, ?, ?, ?, ?, ?)`;
            db.run(insertSql, [1, nama, kelas, JSON.stringify(jawabanSiswa), nilai, waktuMulai, new Date().toISOString()]);

            // 3. Siapkan data respons berdasarkan pengaturan
            const responsData = {
                nama: nama,
                // Kirim nilai hanya jika diizinkan
                nilai: tampilkan_nilai ? nilai : null,
                // Siapkan data review hanya jika diizinkan
                reviewData: tampilkan_review ? {
                    soalList: semuaSoal,
                    jawabanSiswa: jawabanSiswa
                } : null
            };

            res.json(responsData);
        });
    });
};

/**
 * FUNGSI BARU untuk memvalidasi token dari siswa.
 */
validateToken = (req, res) => {
    // 1. Ambil io dari objek aplikasi
    const io = req.app.get('socketio');
    
    // 2. Ambil token DAN socketId dari body request
    const { token, socketId } = req.body;

    if (!token || !socketId) {
        return res.status(400).json({ 
            success: false, 
            message: 'Permintaan tidak lengkap, token atau ID sesi hilang.' 
        });
    }

    // 3. Lakukan validasi yang ketat
    // Cek apakah ada token yang tersimpan untuk socketId ini, DAN
    // Cek apakah tokennya cocok
    if (io.activeTokens && io.activeTokens[socketId] && io.activeTokens[socketId] === token) {
        // Validasi berhasil!
        
        // Hapus token setelah digunakan agar tidak bisa dipakai lagi
        delete io.activeTokens[socketId]; 
        
        res.json({ success: true, message: 'Blokir berhasil dibuka.' });

    } else {
        // Validasi gagal
        res.status(401).json({ success: false, message: 'Token tidak valid untuk pengguna ini.' });
    }
};


// Mengekspor semua fungsi dalam satu objek
module.exports = {
    startUjian,
    submitUjian,
    validateToken // Pastikan fungsi baru diekspor
};
