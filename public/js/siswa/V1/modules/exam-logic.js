
import { examState, durasiUjian, setDurasiUjian } from './state.js';
import { tampilkanSoal } from './ui.js';
import { saveExamSession } from './session.js';
import { fetchStartExam, fetchSoalById, submitExamToServer } from './api.js';
import { mulaiTimer } from './timer.js';

export async function mulaiUjian() {
  try {
    const pengaturan = await fetchStartExam();
    examState.shuffledIds = pengaturan.shuffledIds;
    examState.totalSoal = pengaturan.totalSoal;
    setDurasiUjian(pengaturan.durasi || 15 * 60);

    if (examState.totalSoal === 0) {
      alert("Tidak ada soal yang tersedia.");
      return;
    }

    if (typeof activateAntiSwitch === 'function') activateAntiSwitch();
    
    await fetchSoalById(examState.shuffledIds[0]);
    mulaiTimer(false); // Mulai timer untuk sesi baru
    saveExamSession();
    // trackActivity...
  } catch (err) {
    console.error("Gagal memulai ujian:", err);
  }
}

export function pilihJawaban(soalId, pilihan) {
  examState.jawabanSiswa[soalId] = pilihan;
  tampilkanSoal();
  saveExamSession();
  // trackActivity...
}

export async function berikutnya() {
  if (examState.currentIndex < examState.totalSoal - 1) {
    await fetchSoalById(examState.shuffledIds[examState.currentIndex + 1]);
  } else {
    submitUjian();
  }
}

export async function sebelumnya() {
  if (examState.currentIndex > 0) {
    await fetchSoalById(examState.shuffledIds[examState.currentIndex - 1]);
  }
}

export async function lompatKeSoal(index) {
  await fetchSoalById(examState.shuffledIds[index]);
}

export async function submitUjian() {
  if (typeof deactivateAntiSwitch === 'function') deactivateAntiSwitch();
  
  if (!confirm("Apakah Anda yakin ingin menyelesaikan ujian ini?")) {
    if (typeof activateAntiSwitch === 'function') activateAntiSwitch();
    return;
  }
  
  if (examState.timerWorker) examState.timerWorker.terminate();

  try {
    const dataToSend = {
      nama: examState.userInfo.nama,
      kelas: examState.userInfo.kelas,
      jawabanSiswa: examState.jawabanSiswa,
      waktuMulai: examState.waktuMulai,
    };
    const hasilUjian = await submitExamToServer(dataToSend);

    localStorage.removeItem('examInProgress');
    sessionStorage.setItem('examCompleted', 'true');
    // ... pembersihan lainnya

    window.location.href = `/selesai?nama=${encodeURIComponent(hasilUjian.nama)}&nilai=${hasilUjian.nilai || 'hidden'}`;
  } catch (error) {
    console.error("Error saat submit:", error);
    alert("Gagal mengirim hasil ujian.");
  }
}