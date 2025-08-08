// /js/guru/modules/import-manager.js

// Fungsi-fungsi ini perlu disalin dari dashboard.js:
// - parseExcel
// - isValidSoal
// - sendSoalToServer

function setupFormImport() {
  const form = document.getElementById('formImportExcel');
  const fileInput = document.getElementById('excel-file');
  const importBtn = form.querySelector('button[type="submit"]');
  const statusEl = document.createElement('p'); // Buat elemen status
  statusEl.className = 'text-sm text-gray-600 mt-2 hidden';
  form.appendChild(statusEl);

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const file = fileInput.files[0];
    if (!file) {
      alert('Silakan pilih file Excel terlebih dahulu.');
      return;
    }
    importBtn.disabled = true;
    statusEl.textContent = 'Membaca file...';
    statusEl.classList.remove('hidden');
    try {
      const rows = await parseExcel(file);
      let importSuccess = 0, importFail = 0;
      for (const [index, row] of rows.entries()) {
        statusEl.textContent = `Mengimpor soal ${index + 1} dari ${rows.length}...`;
        const soal = {
          pertanyaan: row.Pertanyaan,
          pilihan_a: row.A, pilihan_b: row.B, pilihan_c: row.C, pilihan_d: row.D, pilihan_e: row.E,
          jawaban_benar: String(row.Jawaban || '').toLowerCase(),
        };
        if (isValidSoal(soal)) {
          const success = await sendSoalToServer(soal);
          if (success) importSuccess++; else importFail++;
        } else {
          importFail++;
        }
      }
      alert(`Import selesai.\nBerhasil: ${importSuccess}\nGagal: ${importFail}`);
      await loadTabelSoal();
    } catch (error) {
      console.error('Error saat import Excel:', error);
      alert('Terjadi kesalahan saat memproses file Excel.');
    } finally {
      importBtn.disabled = false;
      fileInput.value = '';
      statusEl.classList.add('hidden');
    }
  });
}

function parseExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        resolve(XLSX.utils.sheet_to_json(sheet, { defval: '' }));
      } catch (e) { reject(e); }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}

function isValidSoal(soal) {
  return soal.pertanyaan && soal.pilihan_a && soal.pilihan_b && soal.pilihan_c && soal.pilihan_d && soal.pilihan_e && soal.jawaban_benar;
}

export function initHalamanImport() {
    setupFormImport();
}