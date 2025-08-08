// /js/selesai/modules/ui.js

/**
 * Menampilkan skor akhir siswa di halaman.
 * @param {number} nilai - Skor yang akan ditampilkan.
 */
export function tampilkanNilai(nilai) {
  const nilaiEl = document.getElementById('nilai-akhir');
  const nilaiContainer = document.getElementById('nilai-container');
  
  if (nilaiEl && nilaiContainer) {
    nilaiEl.textContent = nilai;
    nilaiContainer.classList.remove('hidden');
  }
}

/**
 * Merender dan menampilkan ulasan jawaban soal.
 * @param {object} hasil - Objek hasil ujian yang berisi `reviewData`.
 */
export function tampilkanReview(hasil) {
  const reviewContainer = document.getElementById('review-container');
  const reviewList = document.getElementById('review-list');
  
  if (!reviewContainer || !reviewList || !hasil.jawaban) return;

  reviewList.innerHTML = ''; // Kosongkan daftar sebelum mengisi

  hasil.jawaban.forEach((item, idx) => {
    const benar = item.jawaban_siswa === item.kunci;
    const card = document.createElement('div');
    card.className = `p-5 rounded-xl border ${
      benar ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'
    }`;

    // Anda bisa menyesuaikan detail tampilan di sini
    card.innerHTML = `
      <h4 class="font-semibold mb-2">Soal ${idx + 1}:</h4>
      <p class="mb-2">${item.pertanyaan}</p>
      <ul class="mb-2 list-disc list-inside text-sm space-y-1">
        ${['a','b','c','d','e'].map(opt => {
            if (!item[opt]) return ''; // Jangan render pilihan jika kosong
            return `
            <li ${item.kunci.toUpperCase() === opt.toUpperCase() ? 'class="font-bold text-green-600"' : ''}>
                ${opt.toUpperCase()}. ${item[opt]}
            </li>`
        }).join('')}
      </ul>
      <p class="text-sm mt-3 pt-3 border-t">
        Jawaban Anda: <strong>${item.jawaban_siswa || '-'}</strong>
        ${!benar ? `<br>Kunci Jawaban: <strong>${item.kunci.toUpperCase()}</strong>` : ''}
      </p>
    `;

    reviewList.appendChild(card);
  });

  reviewContainer.classList.remove('hidden');
}