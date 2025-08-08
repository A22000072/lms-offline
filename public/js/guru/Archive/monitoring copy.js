// file: /js/guru/monitoring.js

const monitoringState = {
  students: {},
  socket: null,
  tbody: null,
  timerInterval: null,
};

function initMonitoring() {
  if (monitoringState.socket) return;
  
  monitoringState.tbody = document.getElementById('tabel-monitoring');
  connectAndListen();
  startDashboardTimer();

  // PERBAIKAN: Logika tombol 'clear-offline-btn' dihapus karena tidak lagi diperlukan.
}

function connectAndListen() {
  monitoringState.tbody.innerHTML = `<tr><td colspan="7" class="text-center text-gray-500 py-4">Menghubungkan...</td></tr>`;
  monitoringState.socket = io({ query: { role: 'teacher' } });

  monitoringState.socket.on('connect', () => {
    monitoringState.socket.emit('requestInitialState');
  });

  monitoringState.socket.on('initialState', (initialStudents) => {
    monitoringState.students = initialStudents;
    renderSortedTable();
  });

  monitoringState.socket.on('updateAktivitas', (studentData) => {
    monitoringState.students[studentData.socketId] = studentData;
    renderSortedTable();
  });
  
  monitoringState.socket.on('newTokenGenerated', (studentData) => {
    monitoringState.students[studentData.socketId] = studentData;
    renderSortedTable();
  });

  // PERBAIKAN: Logika disconnect disederhanakan.
  // Server akan mengirim event ini untuk menghapus baris lama saat siswa reconnect,
  // atau saat siswa benar-benar keluar.
  monitoringState.socket.on('studentDisconnected', (data) => {
    if (monitoringState.students[data.socketId]) {
      delete monitoringState.students[data.socketId];
      renderSortedTable();
    }
  });
}

function startDashboardTimer() {
  if (monitoringState.timerInterval) {
    clearInterval(monitoringState.timerInterval);
  }

  monitoringState.timerInterval = setInterval(() => {
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
  }, 1000);
}

function renderSortedTable() {
  if (!monitoringState.tbody) return;

  const studentArray = Object.values(monitoringState.students);
  studentArray.sort((a, b) => (a.nama || '').localeCompare(b.nama || ''));
  monitoringState.tbody.innerHTML = '';
  
  if (studentArray.length === 0) {
    monitoringState.tbody.innerHTML = `<tr><td colspan="7" class="text-center text-gray-500 py-4">Belum ada siswa yang terhubung.</td></tr>`;
    return;
  }

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

function formatSisaWaktu(ms) {
    if (ms === undefined || ms === null) return '--:--';
    if (ms < 0) return 'Waktu Habis';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

document.addEventListener('DOMContentLoaded', initMonitoring);