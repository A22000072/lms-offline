
import { examState } from './state.js';
import { pilihJawaban, berikutnya, sebelumnya, lompatKeSoal } from './exam-logic.js';

export function tampilkanSoal() {
  const soal = examState.currentSoal;
  const container = document.getElementById("quiz-container");
  if (!soal) { 
      container.innerHTML = `<p class="text-center text-gray-500 font-semibold">Memuat soal...</p>`;
      return; 
  }
  
  const total = examState.totalSoal;
  const terjawab = Object.keys(examState.jawabanSiswa).length;
  const progressPersen = total > 0 ? Math.floor((terjawab / total) * 100) : 0;
  
  window.pilihJawaban = pilihJawaban;
  window.berikutnya = berikutnya;
  window.sebelumnya = sebelumnya;
  
  container.innerHTML = `
    <div class="flex flex-col lg:flex-row gap-6">
      <div class="w-full lg:w-3/4">
        <div class="rounded-lg border bg-white shadow-md">
          <div class="flex flex-col space-y-1.5 p-6 pb-4">
            <div class="flex justify-between items-center">
              <div>
                <h2 class="text-2xl font-semibold mb-2">Ujian Online</h2>
                <p class="text-sm text-gray-500">Soal ke-${examState.currentIndex + 1} dari ${total}</p>
              </div>
              <div class="flex items-center space-x-2 text-gray-500 text-xl font-semibold">
                <i data-lucide="clock" class="w-5 h-5"></i>
                <span id="timer">--:--</span>
              </div>
            </div>
            </div>
          <div class="flex justify-between items-center p-6 pt-0">
            <button onclick="sebelumnya()" ${examState.currentIndex === 0 ? "disabled" : ""} class="px-4 py-2 border rounded">Sebelumnya</button>
            <button onclick="berikutnya()" class="bg-indigo-500 text-white px-4 py-2 rounded">${examState.currentIndex === total - 1 ? "Selesai & Kumpulkan" : "Soal Berikutnya"}</button>
          </div>
        </div>
      </div>
      <div class="w-full lg:w-1/4">${renderNavigasiSoal()}</div>
    </div>
  `;
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function renderNavigasiSoal() {
  window.lompatKeSoal = lompatKeSoal;
  let navigasiHtml = `<div class="rounded-lg border bg-white shadow-md p-4"><h3 class="font-semibold mb-3 text-center">Navigasi Soal</h3><div class="grid grid-cols-5 gap-2">`;
  for (let i = 0; i < examState.totalSoal; i++) {
    const isAnswered = examState.jawabanSiswa.hasOwnProperty(examState.shuffledIds[i]);
    const isActive = i === examState.currentIndex;
    let buttonClass = 'border rounded w-full h-10 flex items-center justify-center';
    if (isActive) buttonClass += ' bg-indigo-500 text-white';
    else if (isAnswered) buttonClass += ' bg-gray-200';
    navigasiHtml += `<button onclick="lompatKeSoal(${i})" class="${buttonClass}">${i + 1}</button>`;
  }
  navigasiHtml += `</div></div>`;
  return navigasiHtml;
}

export function blockIfCompleted() {
  if (sessionStorage.getItem('examCompleted') === 'true') {
    document.getElementById('modal-identitas').style.display = 'none';
    document.getElementById('quiz-container').innerHTML = `<div class="text-center p-8 bg-green-100 text-green-800 rounded-lg"><h2 class="text-2xl font-bold">Ujian Telah Dikumpulkan</h2><p class="mt-2">Anda tidak dapat mengakses ujian ini kembali.</p></div>`;
    return true;
  }
  return false;
}