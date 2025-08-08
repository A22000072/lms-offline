let currentIndex = 0;
let soalList = [];
let jawabanSiswa = {};

document.addEventListener("DOMContentLoaded", async () => {
  await loadSoal();
  tampilkanSoal();
});

async function loadSoal() {
  try {
    const res = await fetch("/api/soal");
    const data = await res.json();
    soalList = data;
  } catch (err) {
    console.error("Gagal memuat soal", err);
  }
}

function tampilkanSoal() {
  const soal = soalList[currentIndex];
  const container = document.getElementById("quiz-container");

  const total = soalList.length;
  const terjawab = Object.keys(jawabanSiswa).length;
  const progressPersen = Math.floor((terjawab / total) * 100);

  container.innerHTML = `
    <div class="rounded-lg border bg-white shadow-md">
      <div class="flex flex-col space-y-1.5 p-6 pb-4">
        <div class="flex justify-between flex-wrap gap-4 items-center">
          <div>
            <div class="text-2xl font-semibold mb-2">Ujian Online</div>
            <div class="text-sm text-gray-500">Soal ke-${currentIndex + 1} dari ${soalList.length}</div>
          </div>
          <div class="flex items-center space-x-2 text-gray-500">
            <i class="lucide lucide-clock w-4 h-4"></i>
            <span id="timer">--:--</span>
          </div>
        </div>

        <div class="mt-4">
          <div class="relative w-full overflow-hidden rounded-full bg-gray-200 h-2">
            <div class="h-full bg-indigo-500 transition-all duration-300" style="width: ${progressPersen}%"></div>
          </div>
          <div class="flex justify-between mt-1 text-xs text-gray-500">
            <span>${terjawab} dari ${total} soal terjawab</span>
            <span>${progressPersen}% Terjawab</span>
          </div>
        </div>
      </div>

      <div class="p-6 pt-0">
        <div class="space-y-6">
          <div class="text-lg font-medium">${soal.pertanyaan}</div>
          <div class="grid gap-2">
            ${["a", "b", "c", "d", "e"]
              .map((opt) => {
                const jawaban = soal[`pilihan_${opt}`];
                const idRadio = `soal_${soal.id}_${opt}`;
                return `
      <label for="${idRadio}" onclick="pilihJawaban(${soal.id}, '${opt.toUpperCase()}')"
        class="flex items-center space-x-2 border rounded-lg p-3 hover:bg-indigo-50 transition-colors cursor-pointer ${
          jawabanSiswa[soal.id] === opt.toUpperCase() ? "bg-indigo-100 border-indigo-400" : ""
        }">
        <input
          type="radio"
          id="${idRadio}"
          name="jawaban_${soal.id}"
          value="${opt.toUpperCase()}"
          class="h-4 w-4 text-indigo-600 border-gray-300"
          ${jawabanSiswa[soal.id] === opt.toUpperCase() ? "checked" : ""}
        />
        <span class="text-sm flex-grow">${jawaban}</span>
      </label>
    `;
              })
              .join("")}
          </div>
        </div>
      </div>

      <div class="flex justify-between items-center p-6 pt-0">
        <button onclick="sebelumnya()" ${currentIndex === 0 ? "disabled" : ""} class="text-sm px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50">
          Sebelumnya
        </button>
        <button onclick="berikutnya()" class="bg-indigo-500 text-white text-sm px-4 py-2 rounded hover:bg-indigo-600">
          ${currentIndex === soalList.length - 1 ? "Selesai" : "Soal Berikutnya"}
        </button>
      </div>
    </div>
  `;
}

function pilihJawaban(soalId, pilihan) {
  jawabanSiswa[soalId] = pilihan;
  tampilkanSoal();
}

function sebelumnya() {
  if (currentIndex > 0) {
    currentIndex--;
    tampilkanSoal();
  }
}

function berikutnya() {
  if (currentIndex < soalList.length - 1) {
    currentIndex++;
    tampilkanSoal();
  } else {
    alert("Ujian selesai!");
    // TODO: kirim hasil ujian
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const mulaiBtn = document.getElementById('mulaiUjianBtn');

  mulaiBtn.addEventListener('click', () => {
    const nama = document.getElementById('nama').value.trim();
    const kelas = document.getElementById('kelas').value.trim();

    if (!nama || !kelas) {
      alert('Nama dan kelas harus diisi!');
      return;
    }

    // Sembunyikan modal
    document.getElementById('modal-identitas').style.display = 'none';

    // Lanjut load soal dan mulai ujian
    mulaiUjian();
  });
});

function mulaiUjian() {
  // Misal fetch soal dari API
  fetch('/api/soal')
    .then(res => res.json())
    .then(data => {
      soalList = data;
      currentSoalIndex = 0;
      jawabanSiswa = {};
      tampilkanSoal(currentSoalIndex);
      mulaiTimer(durasiUjian);
    })
    .catch(err => {
      console.error('Gagal memuat soal:', err);
      alert('Terjadi kesalahan memuat soal.');
    });
}
