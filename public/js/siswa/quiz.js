// =======================================================================
//  quiz.js - VERSI STABIL (SEBELUM DIPECAH MENJADI MODUL)
// =======================================================================

const examState = {
  shuffledIds: [],
  totalSoal: 0,
  currentSoal: null,
  jawabanSiswa: {},
  shuffledOptions: {},
  currentIndex: 0,
  waktuMulai: null,
  endTime: null,
  userInfo: { id: '', nama: '', kelas: '' },
  isPaused: false,
  timerWorker: null,
};

let durasiUjian = 15 * 60; // Durasi default dalam detik

// =======================================================================
// FUNGSI PENCEGAHAN KEMBALI SETELAH UJIAN SELESAI
// =======================================================================

/**
 * Fungsi ini memeriksa apakah ujian sudah selesai dan memblokir halaman jika iya.
 * @returns {boolean} - Mengembalikan true jika halaman diblokir.
 */
function blockIfCompleted() {
  if (sessionStorage.getItem('examCompleted') === 'true') {
    const modal = document.getElementById('modal-identitas');
    const container = document.getElementById('quiz-container');
    if (modal) modal.style.display = 'none';
    
    if (container) {
      container.innerHTML = `
        <div class="text-center p-8 bg-green-100 text-green-800 rounded-lg shadow-md">
          <h2 class="text-2xl font-bold">Ujian Telah Dikumpulkan</h2>
          <p class="mt-2">Anda sudah menyelesaikan dan mengirimkan ujian ini. Anda tidak dapat mengaksesnya kembali.</p>
        </div>
      `;
    }
    return true;
  }
  return false;
}

// Event 'pageshow' adalah kunci untuk menangani navigasi tombol 'back' dari cache browser.
window.addEventListener('pageshow', function(event) {
  blockIfCompleted();
});


// =======================================================================
// INISIALISASI HALAMAN UTAMA
// =======================================================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Prioritas tertinggi: Cek apakah ujian sudah selesai.
    if (blockIfCompleted()) {
        return; // Hentikan semua eksekusi jika sudah selesai.
    }

    // 2. Pencegahan copy-paste
    document.addEventListener('copy', e => e.preventDefault());
    document.addEventListener('cut', e => e.preventDefault());
    document.addEventListener('contextmenu', e => e.preventDefault());

    // 3. Coba lanjutkan sesi yang ada.
    if (resumeExamSession()) {
        return;
    }

    // 4. Jika tidak ada sesi untuk dilanjutkan, siapkan untuk ujian baru.
    localStorage.removeItem('examInProgress');
    sessionStorage.removeItem('offenseCount');
    sessionStorage.removeItem('isExamBlocked');
    sessionStorage.removeItem('assignedToken');
    sessionStorage.removeItem('examCompleted');

    // Setup event listener untuk tombol 'mulai'
    const mulaiBtn = document.getElementById('mulaiUjianBtn');
    const idUnikInput = document.getElementById('id_unik');
    const namaInput = document.getElementById('nama');
    const kelasInput = document.getElementById('kelas');

    mulaiBtn.addEventListener('click', () => {
        const id_unik = idUnikInput.value.trim();
        const nama = namaInput.value.trim();
        const kelas = kelasInput.value.trim();

        if (!id_unik || !nama || !kelas) {
            alert('Nomor Absen/NISN, Nama, dan Kelas harus diisi!');
            return;
        }

        examState.userInfo = { id: id_unik, nama, kelas };

        if (window.ujianMonitor) {
            window.ujianMonitor.setUser(examState.userInfo);
        }

        document.getElementById('modal-identitas').style.display = 'none';
        mulaiUjian();
    });
});


// =======================================================================
// FUNGSI INTI UJIAN (API & LOGIKA)
// =======================================================================

function trackActivity(aktivitas, progress = '') {
    if (window.ujianMonitor) {
        const sisaWaktu = examState.endTime ? examState.endTime.getTime() - new Date().getTime() : durasiUjian * 1000;
        window.ujianMonitor.track(aktivitas, progress, sisaWaktu);
    }
}

async function mulaiUjian() {
    try {
        const pengaturanRes = await fetch("/api/ujian/start");
        if (!pengaturanRes.ok) throw new Error('Gagal memulai sesi ujian.');
        const pengaturan = await pengaturanRes.json();
        
        examState.shuffledIds = pengaturan.shuffledIds;
        examState.totalSoal = pengaturan.totalSoal;
        durasiUjian = pengaturan.durasi || 15 * 60;

        if (examState.totalSoal === 0) {
            alert("Tidak ada soal yang tersedia.");
            return;
        }

        if (typeof activateAntiSwitch === 'function') activateAntiSwitch(examState.userInfo);
        
        await fetchSoalByIndex(0);
        mulaiTimer(durasiUjian, false);
        trackActivity('Memulai ujian');
    } catch (err) {
        console.error("KRITIS: Gagal memulai ujian:", err);
        document.getElementById("quiz-container").innerHTML = `
          <div class="text-center p-8 bg-red-100 text-red-700 rounded-lg">
            <h2>Gagal Memuat Ujian</h2>
            <p>Tidak dapat terhubung ke server atau terjadi kesalahan. Silakan coba lagi nanti.</p>
            <p class="text-sm mt-2">Detail: ${err.message}</p>
          </div>
        `;
    }
}

async function fetchSoalByIndex(index) {
    if (index < 0 || index >= examState.totalSoal) return;
    const soalId = examState.shuffledIds[index];
    try {
        const res = await fetch(`/api/soal/by-id/${soalId}`);
        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Server merespons dengan error. Status: ${res.status}. Pesan: ${errorText}`);
        }
        examState.currentSoal = await res.json();
        examState.currentIndex = index;
        tampilkanSoal();
    } catch (error) {
        console.error("Gagal mengambil soal:", error);
        alert(`Gagal memuat soal. Silakan coba lagi. Detail: ${error.message}`);
    }
}

function pilihJawaban(soalId, pilihan) {
    examState.jawabanSiswa[soalId] = pilihan;
    saveExamSession();
    tampilkanSoal(); // Tampilkan ulang untuk memperbarui UI
    const progressText = `${Object.keys(examState.jawabanSiswa).length}/${examState.totalSoal}`;
    trackActivity(`Menjawab soal no. ${examState.currentIndex + 1}`, progressText);
}

async function berikutnya() {
    if (examState.currentIndex < examState.totalSoal - 1) {
        await fetchSoalByIndex(examState.currentIndex + 1);
    } else {
        submitUjian();
    }
}

async function sebelumnya() {
    if (examState.currentIndex > 0) {
        await fetchSoalByIndex(examState.currentIndex - 1);
    }
}

async function lompatKeSoal(index) {
    await fetchSoalByIndex(index);
}

async function submitUjian() {
    if (typeof deactivateAntiSwitch === 'function') deactivateAntiSwitch();
    
    const konfirmasi = confirm("Apakah Anda yakin ingin menyelesaikan ujian ini?");
    if (!konfirmasi) {
        if (typeof activateAntiSwitch === 'function') activateAntiSwitch(examState.userInfo);
        return;
    }
    
    trackActivity('Menyelesaikan ujian');
    if (examState.timerWorker) {
        examState.timerWorker.postMessage({ command: 'stop' });
        examState.timerWorker.terminate();
        examState.timerWorker = null;
    }

    try {
        const res = await fetch('/api/ujian/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: examState.userInfo.id,
                nama: examState.userInfo.nama,
                kelas: examState.userInfo.kelas,
                jawabanSiswa: examState.jawabanSiswa,
                waktuMulai: examState.waktuMulai,
            })
        });
        if (!res.ok) throw new Error('Gagal mengirim jawaban.');
        const hasilUjian = await res.json();

        localStorage.removeItem('examInProgress');
        localStorage.removeItem('hasilUjianReview');
        
        if (hasilUjian.reviewData) {
            localStorage.setItem('hasilUjianReview', JSON.stringify(hasilUjian.reviewData));
        }

        // KUNCI: Setel penanda selesai SEBELUM redirect.
        sessionStorage.setItem('examCompleted', 'true');

        const nilaiUntukUrl = hasilUjian.nilai !== null ? hasilUjian.nilai : 'hidden';
        window.location.href = `/selesai?nama=${encodeURIComponent(hasilUjian.nama)}&nilai=${nilaiUntukUrl}`;
    } catch (error) {
        console.error("Error saat submit:", error);
        alert("Terjadi kesalahan koneksi saat mengirimkan hasil ujian.");
    }
}


// =======================================================================
// FUNGSI TIMER DAN SESSION
// =======================================================================

function mulaiTimer(durasi, isResume = false) {
    if (!isResume) {
        examState.waktuMulai = new Date().toISOString();
        examState.endTime = new Date(new Date().getTime() + durasi * 1000);
        saveExamSession();
    }

    if (examState.timerWorker) {
        examState.timerWorker.terminate();
    }

    examState.timerWorker = new Worker('/js/siswa/timer.worker.js');
    examState.timerWorker.postMessage({
        command: 'start',
        endTime: examState.endTime.getTime()
    });

    examState.timerWorker.onmessage = function(e) {
        const { status, sisaWaktu } = e.data;
        if (status === 'tick' && !examState.isPaused) {
            const timerDisplay = document.getElementById('timer');
            if(timerDisplay) {
                const menit = Math.floor(sisaWaktu / 60000);
                const detik = Math.floor((sisaWaktu % 60000) / 1000);
                timerDisplay.textContent = `${String(menit).padStart(2, '0')}:${String(detik).padStart(2, '0')}`;
            }
        }
        if (status === 'done') {
            if (examState.timerWorker) examState.timerWorker.terminate();
            examState.timerWorker = null;
            const timerDisplay = document.getElementById('timer');
            if (timerDisplay) timerDisplay.textContent = 'Waktu Habis';
            
            if (typeof deactivateAntiSwitch === 'function') deactivateAntiSwitch();
            alert('Waktu habis! Ujian akan dikumpulkan secara otomatis.');
            
            const originalConfirm = window.confirm;
            window.confirm = () => true;
            submitUjian();
            window.confirm = originalConfirm;
        }
    };
}

function pauseExamTimer() {
    examState.isPaused = true;
}

function resumeExamTimer() {
    examState.isPaused = false;
}

function saveExamSession() {
    const stateToSave = {
        shuffledIds: examState.shuffledIds,
        totalSoal: examState.totalSoal,
        jawabanSiswa: examState.jawabanSiswa,
        shuffledOptions: examState.shuffledOptions,
        currentIndex: examState.currentIndex,
        endTime: examState.endTime,
        userInfo: examState.userInfo,
        waktuMulai: examState.waktuMulai,
    };
    localStorage.setItem('examInProgress', JSON.stringify(stateToSave));
}

function resumeExamSession() {
    const savedStateJSON = localStorage.getItem('examInProgress');
    if (savedStateJSON) {
        const savedState = JSON.parse(savedStateJSON);
        Object.assign(examState, savedState);
        examState.endTime = new Date(savedState.endTime);
        document.getElementById('modal-identitas').style.display = 'none';

        if (typeof activateAntiSwitch === 'function') activateAntiSwitch(examState.userInfo);
        
        fetchSoalByIndex(examState.currentIndex).then(() => {
            if (!sessionStorage.getItem('isExamBlocked')) {
                mulaiTimer(0, true);
            }
            setTimeout(() => {
                if (window.ujianMonitor && window.ujianMonitor.socket && window.ujianMonitor.socket.connected) {
                    const sisaWaktu = examState.endTime.getTime() - new Date().getTime();
                    const reconnectData = {
                        userInfo: examState.userInfo,
                        progress: Object.keys(examState.jawabanSiswa).length,
                        totalSoal: examState.totalSoal,
                        sisaWaktu: sisaWaktu > 0 ? sisaWaktu : 0,
                        token: sessionStorage.getItem('assignedToken') || null 
                    };
                    window.ujianMonitor.socket.emit('studentReconnected', reconnectData);
                }
            }, 500);
        });
        return true;
    }
    return false;
}


// =======================================================================
// FUNGSI RENDER TAMPILAN (UI)
// =======================================================================

function tampilkanSoal() {
    const soal = examState.currentSoal;
    const container = document.getElementById("quiz-container");
    if (!soal) {
        container.innerHTML = `<p class="text-center text-gray-500 font-semibold">Memuat soal...</p>`;
        return;
    }

    const total = examState.totalSoal;
    const terjawab = Object.keys(examState.jawabanSiswa).length;
    const progressPersen = total > 0 ? Math.floor((terjawab / total) * 100) : 0;

    container.innerHTML = `
    <div class="flex flex-col lg:flex-row gap-6">
      <div class="w-full lg:w-3/4">
        <div class="rounded-lg border bg-white shadow-md">
          <div class="flex flex-col space-y-1.5 p-6 pb-4">
            <div class="flex justify-between flex-wrap gap-4 items-center">
              <div>
                <div class="text-2xl font-semibold mb-2">Ujian Online</div>
                <div class="text-sm text-gray-500">Soal ke-${examState.currentIndex + 1} dari ${total}</div>
              </div>
              <div class="flex items-center space-x-2 text-gray-500 text-xl font-semibold">
                <i data-lucide="clock" class="w-5 h-5"></i>
                <span id="timer">--:--</span>
              </div>
            </div>
            <div class="mt-4">
              <div class="relative w-full overflow-hidden rounded-full bg-gray-200 h-2">
                <div class="h-full bg-indigo-500 transition-all duration-300" style="width: ${progressPersen}%"></div>
              </div>
              <div class="flex justify-between mt-1 text-xs text-gray-500">
                <span>${terjawab} dari ${total} soal terjawab</span>
                <span>${progressPersen}% Selesai</span>
              </div>
            </div>
          </div>
          <div class="p-6 pt-0">
            <div class="space-y-6">
              <div class="text-lg font-medium">${soal.pertanyaan}</div>
              <div class="grid gap-2">
                ${(() => {
                  const soalId = soal.id;
                  let shuffledOrder;
                  if (examState.shuffledOptions[soalId]) {
                    shuffledOrder = examState.shuffledOptions[soalId];
                  } else {
                    let pilihanValid = ["a", "b", "c", "d", "e"].filter(opt => soal[`pilihan_${opt}`]);
                    for (let i = pilihanValid.length - 1; i > 0; i--) {
                      const j = Math.floor(Math.random() * (i + 1));
                      [pilihanValid[i], pilihanValid[j]] = [pilihanValid[j], pilihanValid[i]];
                    }
                    shuffledOrder = pilihanValid;
                    examState.shuffledOptions[soalId] = shuffledOrder;
                  }
                  return shuffledOrder.map(opt => {
                    const jawaban = soal[`pilihan_${opt}`];
                    const idRadio = `soal_${soal.id}_${opt}`;
                    const isChecked = examState.jawabanSiswa[soal.id] === opt.toUpperCase();
                    return `
                      <label for="${idRadio}" onclick="pilihJawaban(${soal.id}, '${opt.toUpperCase()}')"
                        class="flex items-start gap-3 border rounded-lg p-3 hover:bg-indigo-50 transition-colors cursor-pointer ${ isChecked ? "bg-indigo-100 border-indigo-400" : "" }">
                        <input type="radio" id="${idRadio}" name="jawaban_${soal.id}" value="${opt.toUpperCase()}" 
                          class="h-4 w-4 mt-1 flex-shrink-0 text-indigo-600 border-gray-300 focus:ring-indigo-500" ${ isChecked ? "checked" : "" }/>
                        <span class="text-sm">${jawaban}</span>
                      </label>
                    `;
                  }).join("");
                })()}
              </div>
            </div>
          </div>
          <div class="flex justify-between items-center p-6 pt-0">
            <button onclick="sebelumnya()" ${examState.currentIndex === 0 ? "disabled" : ""} 
              class="text-sm px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
              Sebelumnya
            </button>
            <button onclick="berikutnya()" 
              class="bg-indigo-500 text-white text-sm px-4 py-2 rounded hover:bg-indigo-600">
              ${examState.currentIndex === total - 1 ? "Selesai & Kumpulkan" : "Soal Berikutnya"}
            </button>
          </div>
        </div>
      </div>
      <div class="w-full lg:w-1/4">
        ${renderNavigasiSoal()}
      </div>
    </div>
  `;
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function renderNavigasiSoal() {
  let navigasiHtml = `<div class="rounded-lg border bg-white shadow-md p-4"><h3 class="font-semibold mb-3 text-center">Navigasi Soal</h3><div class="grid grid-cols-5 gap-2">`;
  for (let i = 0; i < examState.totalSoal; i++) {
    const soalId = examState.shuffledIds[i];
    const isAnswered = examState.jawabanSiswa.hasOwnProperty(soalId);
    const isActive = i === examState.currentIndex;
    let buttonClass = 'border rounded w-full h-10 flex items-center justify-center transition-colors text-sm';
    if (isActive) {
      buttonClass += ' bg-indigo-500 text-white border-indigo-500';
    } else if (isAnswered) {
      buttonClass += ' bg-gray-200 border-gray-300 hover:bg-gray-300';
    } else {
      buttonClass += ' bg-white border-gray-300 hover:bg-gray-100';
    }
    navigasiHtml += `<button onclick="lompatKeSoal(${i})" class="${buttonClass}">${i + 1}</button>`;
  }
  navigasiHtml += `</div></div>`;
  return navigasiHtml;
}