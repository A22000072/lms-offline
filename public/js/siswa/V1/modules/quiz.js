
import { blockIfCompleted, tampilkanSoal } from './modules/ui.js';
import { resumeExamSession, saveExamSession } from './modules/session.js';
import { 
  mulaiUjian, 
  pilihJawaban, 
  berikutnya, 
  sebelumnya, 
  lompatKeSoal 
} from './modules/exam-logic.js';
import { examState } from './modules/state.js';

// =======================================================================
// PERBAIKAN KUNCI: Daftarkan fungsi-fungsi ujian ke 'window'
// =======================================================================
window.pilihJawaban = pilihJawaban;
window.berikutnya = berikutnya;
window.sebelumnya = sebelumnya;
window.lompatKeSoal = lompatKeSoal;


// Event 'pageshow' untuk menangani tombol back
window.addEventListener('pageshow', () => {
  blockIfCompleted();
});

document.addEventListener('DOMContentLoaded', () => {
  if (blockIfCompleted()) return;

  if (resumeExamSession()) return;


  localStorage.removeItem('examInProgress');
  sessionStorage.removeItem('offenseCount');
  sessionStorage.removeItem('isExamBlocked');
  sessionStorage.removeItem('assignedToken');
  sessionStorage.removeItem('examCompleted');


  const mulaiBtn = document.getElementById('mulaiUjianBtn');
  mulaiBtn.addEventListener('click', () => {
    const id_unik = document.getElementById('id_unik').value.trim();
    const nama = document.getElementById('nama').value.trim();
    const kelas = document.getElementById('kelas').value.trim();
    if (!id_unik || !nama || !kelas) {
      alert('Semua kolom harus diisi!');
      return;
    }
    examState.userInfo = { id: id_unik, nama, kelas };
    if (window.ujianMonitor) window.ujianMonitor.setUser(examState.userInfo);
    document.getElementById('modal-identitas').style.display = 'none';
    mulaiUjian();
  });
});