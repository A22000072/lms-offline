document.addEventListener('DOMContentLoaded', async () => {
  const nilaiEl = document.getElementById('nilai-akhir');
  const nilaiContainer = document.getElementById('nilai-container');
  const reviewContainer = document.getElementById('review-container');
  const reviewList = document.getElementById('review-list');

  try {
    const pengaturan = await (await fetch('/api/pengaturan')).json();
    const hasil = await (await fetch('/api/hasil/terakhir')).json(); 

    if (pengaturan.tampilkanNilai) {
      nilaiEl.textContent = hasil.nilai;
      nilaiContainer.classList.remove('hidden');
    }

    if (pengaturan.tampilkanKunci) {
      reviewContainer.classList.remove('hidden');

      hasil.jawaban.forEach((item, idx) => {
        const benar = item.jawaban_siswa === item.kunci;
        const card = document.createElement('div');
        card.className = `p-5 rounded-xl border ${
          benar ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'
        }`;

        card.innerHTML = `
          <h4 class="font-semibold mb-2">Soal ${idx + 1}:</h4>
          <p class="mb-2">${item.pertanyaan}</p>
          <ul class="mb-2 list-disc list-inside text-sm">
            ${['a','b','c','d','e'].map(opt => `
              <li ${item.kunci === opt ? 'class="font-bold text-green-600"' : ''}>
                ${opt.toUpperCase()}. ${item[opt]}
              </li>`).join('')}
          </ul>
          <p class="text-sm">
            Jawaban Anda: <strong>${item.jawaban_siswa || '-'}</strong><br>
            Kunci Jawaban: <strong>${item.kunci}</strong>
          </p>
        `;

        reviewList.appendChild(card);
      });
    }

  } catch (err) {
    console.error('Gagal memuat data hasil ujian:', err);
  }
});

