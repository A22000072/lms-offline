// =================================
// SETUP & IMPORT MODUL
// =================================
const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const socketIo = require('socket.io');

// Inisialisasi Aplikasi
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// =================================
// KONFIGURASI VIEW ENGINE (EJS)
// =================================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


// =================================
// MIDDLEWARE
// =================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


// =================================
// INTEGRASI SOCKET.IO
// =================================
try {
  const socketManager = require('./socket/socketManager');
  socketManager(io);
  app.set('socketio', io);
} catch (error) {
  console.error("Peringatan: Gagal memuat './socket/socketManager.js'.");
}


// =================================
// IMPORT & GUNAKAN API ROUTES
// =================================
// (Tidak ada perubahan di sini, semua rute API tetap sama)
const soalRoutes = require('./routes/soalRoutes');
const hasilRoutes = require('./routes/hasilRoutes');
const ujianRoutes = require('./routes/ujianRoutes');
// ...impor rute lainnya

app.use('/api/soal', soalRoutes);
app.use('/api/hasil', hasilRoutes);
app.use('/api/ujian', ujianRoutes);
// ...gunakan rute lainnya


// =================================
// ROUTE UNTUK MENYAJIKAN HALAMAN (VIEWS) DENGAN EJS
// =================================

app.get('/ujian', (req, res) => {
  // Gunakan res.render untuk file .ejs
  res.render('quiz'); // Akan mencari file /views/quiz.ejs
});

app.get('/selesai', (req, res) => {
  res.render('selesai'); // Akan mencari file /views/selesai.ejs
});

app.get('/dashboard', (req, res) => {
  res.render('dashboard'); // Akan mencari file /views/dashboard.ejs
});

app.get('/guru', (req, res) => res.redirect('/dashboard'));
app.get('/', (req, res) => res.redirect('/dashboard'));


// =================================
// ERROR HANDLING MIDDLEWARE
// =================================
// (Tidak ada perubahan di sini)


// =================================
// JALANKAN SERVER
// =================================
const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
  console.log(`Server berjalan dengan lancar di http://localhost:${PORT}`);
});