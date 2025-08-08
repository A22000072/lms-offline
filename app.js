// file: app.js (Versi Stabil)

const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Integrasi Socket.IO
try {
  const socketManager = require('./socket/socketManager'); 
  socketManager(io);
  app.set('socketio', io);
} catch (error) {
  console.error("Peringatan: Gagal memuat './socket/socketManager.js'.");
}

// Import & Gunakan API Routes
const soalRoutes = require('./routes/soalRoutes');
const hasilRoutes = require('./routes/hasilRoutes');
const ujianRoutes = require('./routes/ujianRoutes');
const pengaturanRoutes = require('./routes/pengaturanRoutes');

app.use('/api/soal', soalRoutes);
app.use('/api/hasil', hasilRoutes);
app.use('/api/ujian', ujianRoutes);
app.use('/api/pengaturan', pengaturanRoutes);

// Route untuk Menyajikan Halaman HTML Statis
app.get('/ujian', (req, res) => res.sendFile(path.join(__dirname, 'views', 'quiz.html')));
app.get('/selesai', (req, res) => res.sendFile(path.join(__dirname, 'views', 'selesai.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'views', 'dashboard.html')));
app.get('/guru', (req, res) => res.redirect('/dashboard'));
app.get('/', (req, res) => res.redirect('/dashboard'));

// Error Handling Middleware
app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
});
app.use((err, req, res, next) => {
  console.error("Terjadi error tidak terduga:", err.stack);
  res.status(500).send('Terjadi kesalahan internal pada server!');
});

// Jalankan Server
const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
  console.log(`Server berjalan dengan lancar di http://localhost:${PORT}`);
});