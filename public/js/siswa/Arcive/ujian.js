let soalList = [];
let jawabanSiswa = {};
let currentIndex = 0;
let timerInterval = null;
let sisaWaktu = 0; // dalam detik
let durasiUjian = 0; // dari server (menit)

const socket = io();

// =====================
// ON PAGE LOAD
// =====================
document.addEventListener('DOMContentLoaded', () => {
  fetch('/api/ujian')
    .then(res => res.json())
    .then(data => {
      soalList = data.soal;
      durasiUjian = data.durasi;
      sisaWaktu = durasiUjian * 60;

      renderNomorSoal();
      tampilkanSoal(0);
      mulaiTimer();
      masukFullscreen();
    });

  document.getElementById('btnSubmit').addEventListener('click', kirimJawaban);
});

// =====================
// RENDER NOMOR SOAL
// =====================
function renderNomorSoal() {
  const container = document.getElementById('nomor-soal');
  container.innerHTML = '';

  soalList.forEach((_, i) => {
    const btn = document.createElement('button');
    btn.className = 'btn btn-outline-primary m-1';
    btn.textContent = i + 1;
    btn.id = `btn-${i}`;
    btn.onclick = () => tampilkanSoal(i);
    container.appendChild(btn);
  });
}

// =====================
// TAMPILKAN SOAL
// =====================
function tampilkanSoal(index) {
  currentIndex = index;
  const soal = soalList[index];
  document.getElementById('pertanyaan').textContent = soal.pertanyaan;

  ['a', 'b', 'c', 'd'].forEach(pilihan => {
    const el = document.getElementById(`label-${pilihan}`);
    el.textContent = soal[`pilihan_${pilihan}`];
    const input = document.getElementById(`pilihan-${pilihan}`);
    input.checked = jawabanSiswa[soal.id] === pilihan;
    input.onclick = () => {
      jawabanSiswa[soal.id] = pilihan;
      document.getElementById(`btn-${index}`).classList.remove('btn-outline-primary');
      document.getElementById(`btn-${index}`).classList.add('btn-success');
    };
  });
}

// =====================
// TIMER
// =====================
function mulaiTimer() {
  updateTimerDisplay();

  timerInterval = setInterval(() => {
    sisaWaktu--;
    updateTimerDisplay();

    if (sisaWaktu <= 0) {
      clearInterval(timerInterval);
      alert('Waktu habis!');
      kirimJawaban();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const menit = Math.floor(sisaWaktu / 60);
  const detik = sisaWaktu % 60;
  document.getElementById('timer').textContent = `${menit}m ${detik}s`;
}

// =====================
// SUBMIT UJIAN
// =====================
function kirimJawaban() {
  clearInterval(timerInterval);
  const nama = document.getElementById('nama').value;
  const kelas = document.getElementById('kelas').value;

  if (!nama || !kelas) {
    alert('Nama dan Kelas wajib diisi!');
    return;
  }

  const data = {
    nama,
    kelas,
    jawaban: jawabanSiswa
  };

  fetch('/api/ujian/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => {
    if (res.ok) {
      alert('Ujian selesai. Terima kasih!');
      window.location.href = 'index.html';
    } else {
      alert('Gagal mengirim jawaban.');
    }
  });
}

// =====================
// FULLSCREEN
// =====================
function masukFullscreen() {
  const body = document.body;
  if (body.requestFullscreen) {
    body.requestFullscreen();
  } else if (body.webkitRequestFullscreen) {
    body.webkitRequestFullscreen();
  }
}
