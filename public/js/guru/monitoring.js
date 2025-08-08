// file: /js/guru/monitoring.js (Versi Stabil Lengkap)

const monitoringState = {
  students: {},
  socket: null,
  tbody: null,
  timerInterval: null,
};

/**
 * Fungsi utama untuk menginisialisasi seluruh fitur monitoring.
 */
function initMonitoring() {
  // Cegah inisialisasi ganda
  if (monitoringState.socket) return;
  
  monitoringState.tbody = document.getElementById('tabel-monitoring');
  connectAndListen();
  startDashboardTimer();

  // Sembunyikan tombol "Bersihkan Siswa Offline" karena tidak lagi diperlukan
  const clearBtn = document.getElementById('clear-offline-btn');
  if (clearBtn) {
    clearBtn.style.display = 'none';
  }
}

/**
 * Menghubungkan ke server Socket.IO dan menyiapkan semua listener.
 */
function connectAndListen() {
  monitoringState.tbody.innerHTML = `<tr><td colspan="7" class="text-center text-gray-500 py-4">Menghubungkan ke server...</td></tr>`;
  
  // Buat koneksi dengan peran sebagai 'teacher'
  monitoringState.socket = io({ query: { role: 'teacher' } });

  // Minta data awal saat berhasil terhubung
  monitoringState.socket.on('connect', () => {
    monitoringState.socket.emit('requestInitialState');
  });

  // Terima dan render data awal semua siswa yang sedang online
  monitoringState.socket.on('initialState', (initialStudents) => {
    monitoringState.students = initialStudents;
    renderSortedTable();
  });

  // Terima pembaruan aktivitas dari siswa
  monitoringState.socket.on('updateAktivitas', (studentData) => {
    monitoringState.students[studentData.socketId] = studentData;
    renderSortedTable();
  });
  
  // Terima pembaruan saat token baru dibuat untuk siswa
  monitoringState.socket.on('newTokenGenerated', (studentData) => {
    monitoringState.students[studentData.socketId] = studentData;
    renderSortedTable();
  });

  // Saat server memberitahu ada siswa yang disconnect (baik karena keluar atau refresh)
  monitoringState.socket.on('studentDisconnected', (data) => {
    if (monitoringState.students[data.socketId]) {
      // Langsung hapus data siswa dari state dan render ulang tabel
      delete monitoringState.students[data.socketId];
      renderSortedTable();
    }
  });
}

/**
 * Memulai satu interval utama di sisi dasbor untuk menggerakkan semua timer siswa.
 */
function startDashboardTimer() {
  // Hapus interval lama jika ada untuk mencegah duplikasi
  if (monitoringState.timerInterval) {
    clearInterval(monitoringState.timerInterval);
  }

  monitoringState.timerInterval = setInterval(() => {
    // Ambil semua sel waktu yang sedang ditampilkan
    const timerCells = document.querySelectorAll('.sisa-waktu-sel');
    
    timerCells.forEach(cell => {
      const endTime = parseInt(cell.dataset.endTime, 10);
      
      if (endTime) {
        const sisaWaktu = endTime - Date.now();
        
        if (sisaWaktu > 0) {
          cell.textContent = formatSisaWaktu(sisaWaktu);
        } else {
          cell.textContent = "Waktu Habis";
          cell.classList.add('text-red-500', 'font-semibold');
        }
      }
    });
  }, 1000); // Dijalankan setiap 1 detik
}

/**
 * Fungsi utama yang merender seluruh tabel monitoring.
 * Fungsi ini selalu mengurutkan siswa berdasarkan nama sebelum merender.
 */
function renderSortedTable() {
  if (!monitoringState.tbody) return;

  const studentArray = Object.values(monitoringState.students);
  
  // Urutkan siswa berdasarkan nama (abjad, case-insensitive)
  studentArray.sort((a, b) => (a.nama || '').localeCompare(b.nama || ''));
  
  // Kosongkan tabel sebelum diisi ulang
  monitoringState.tbody.innerHTML = '';
  
  // Tampilkan pesan jika tidak ada siswa yang terhubung
  if (studentArray.length === 0) {
    monitoringState.tbody.innerHTML = `<tr><td colspan="7" class="text-center text-gray-500 py-4">Belum ada siswa yang terhubung.</td></tr>`;
    return;
  }

  // Buat baris tabel untuk setiap siswa
  studentArray.forEach((student, index) => {
    const row = monitoringState.tbody.insertRow();
    row.id = `student-${student.socketId}`;

    const sisaWaktu = formatSisaWaktu(student.sisaWaktu);
    const tokenSpan = student.token 
      ? `<span class="font-mono bg-yellow-200 text-yellow-900 font-bold px-2 py-1 rounded">${student.token}</span>` 
      : '-';

    row.innerHTML = `
      <td class="px-4 py-3 text-center">${index + 1}</td>
      <td class="px-4 py-3 font-medium text-gray-800">${student.nama || '<i>Menunggu...</i>'}</td>
      <td class="px-4 py-3">${student.kelas || '-'}</td>
      <td class="px-4 py-3">${student.aktivitas || '-'}</td>
      <td class="px-4 py-3">${student.progress || '0/0'}</td>
      <td class="px-4 py-3 font-mono sisa-waktu-sel" data-end-time="${student.endTime || ''}">
        ${sisaWaktu}
      </td>
      <td class="px-4 py-3 text-center">${tokenSpan}</td>
    `;
  });
}

/**
 * Fungsi bantuan untuk memformat milidetik menjadi format MM:SS.
 */
function formatSisaWaktu(ms) {
    if (ms === undefined || ms === null) return '--:--';
    if (ms < 0) return 'Waktu Habis';
    
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Catatan: Pemanggilan initMonitoring() sekarang dikendalikan oleh dashboard.js
// saat tab "Monitoring" diklik, jadi baris di bawah ini tidak lagi diperlukan di sini.
// document.addEventListener('DOMContentLoaded', initMonitoring);