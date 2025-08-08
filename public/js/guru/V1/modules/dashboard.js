// /js/guru/dashboard.js (Versi Final dengan Perbaikan)

import { showTab } from './modules/ui.js';
// Impor semua fungsi yang dibutuhkan dari modul-modul
import { 
  initHalamanSoal, 
  editSoal, 
  hapusSoal, 
  hapusSemuaSoal,
  resetFormSoal // Mungkin juga dibutuhkan
} from './modules/soal-manager.js';
import { initHalamanHasil } from './modules/hasil-manager.js';
import { initHalamanPengaturan } from './modules/pengaturan-manager.js';
import { initHalamanImport } from './modules/import-manager.js';

const loadedTabs = {
  soal: false,
  hasil: false,
  monitoring: false,
  pengaturan: false,
};

async function handleTabClick(tabName) {
  if (!loadedTabs[tabName]) {
    switch (tabName) {
      case 'soal':
        initHalamanSoal();
        initHalamanImport();
        break;
      case 'hasil':
        initHalamanHasil();
        break;
      case 'pengaturan':
        initHalamanPengaturan();
        break;
      case 'monitoring':
        if (typeof initMonitoring === 'function') {
          initMonitoring();
        }
        break;
    }
    loadedTabs[tabName] = true;
  }
  showTab(tabName);
}

// =======================================================================
// PERBAIKAN KUNCI: Daftarkan semua fungsi ke 'window' agar bisa diakses HTML
// =======================================================================
window.handleTabClick = handleTabClick;
window.showTab = showTab;
window.editSoal = editSoal;
window.hapusSoal = hapusSoal;
window.hapusSemuaSoal = hapusSemuaSoal;
// Anda mungkin juga perlu mendaftarkan fungsi lain jika ada tombol 'batal' dll.
// window.resetFormSoal = resetFormSoal;

// Inisialisasi halaman saat pertama kali dimuat
document.addEventListener('DOMContentLoaded', () => {
  handleTabClick('soal');
});