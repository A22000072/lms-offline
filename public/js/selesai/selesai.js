

import { fetchPengaturan, fetchHasilTerakhir } from './modules/api.js';
import { tampilkanNilai, tampilkanReview } from './modules/ui.js';


async function initHalamanSelesai() {
  try {
    const [pengaturan, hasil] = await Promise.all([
      fetchPengaturan(),
      fetchHasilTerakhir()
    ]);

    if (pengaturan.tampilkanNilai && hasil.nilai !== null) {
      tampilkanNilai(hasil.nilai);
    }

    if (pengaturan.tampilkanKunci && hasil.jawaban) {
      tampilkanReview(hasil);
    }

  } catch (err) {
    console.error('Gagal memuat data hasil ujian:', err);
    const reviewContainer = document.getElementById('review-container');
    if(reviewContainer) {
        reviewContainer.innerHTML = `<p class="text-center text-red-500">Gagal memuat detail hasil ujian. Silakan coba muat ulang halaman.</p>`;
        reviewContainer.classList.remove('hidden');
    }
  } finally {
    localStorage.removeItem('examInProgress');
    localStorage.removeItem('hasilUjianReview'); 
    sessionStorage.removeItem('assignedToken');
  }
}

// Jalankan fungsi utama saat halaman dimuat
document.addEventListener('DOMContentLoaded', initHalamanSelesai);